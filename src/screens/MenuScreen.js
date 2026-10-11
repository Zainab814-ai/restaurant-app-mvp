import React, { useState, useRef, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MenuItemCard from '../components/MenuItemCard';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext'; // Auth hook added
import useApi from '../hooks/useApi'; // Requirement 4: Custom hook

const CATEGORIES = ['All', 'Starters', 'Mains', 'Desserts', 'Drinks'];

export default function MenuScreen({ navigation }) {
  // Requirement 3 & 4: Live GET /api/menu call using useApi custom hook
  const { data: menuItems, loading, error, refetch } = useApi('/menu');
  const { user } = useAuth(); // User role check karne ke liye

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortOption, setSortOption] = useState('default');
  const [favourites, setFavourites] = useState([]);

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  const searchInputRef = useRef(null);
  const debounceTimerRef = useRef(null);
  const flatListRef = useRef(null);

  const { dispatch } = useCart();
  const { theme } = useTheme();

  const handleSearchChange = (text) => {
    setSearchQuery(text);
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => setDebouncedQuery(text.trim()), 400);
  };

  const handleAddToCart = useCallback((item) => {
    dispatch({ type: 'ADD_ITEM', payload: item });
  }, [dispatch]);

  const handleToggleFavourite = useCallback((id) => {
    setFavourites((prev) =>
      prev.includes(id) ? prev.filter((favId) => favId !== id) : [...prev, id]
    );
  }, []);

  const filteredAndSortedItems = useMemo(() => {
    let result = Array.isArray(menuItems) ? [...menuItems] : [];

    if (selectedCategory !== 'All') {
      result = result.filter(
        (item) => item.category && item.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    if (debouncedQuery) {
      result = result.filter(
        (item) =>
          (item.name && item.name.toLowerCase().includes(debouncedQuery.toLowerCase())) ||
          (item.description && item.description.toLowerCase().includes(debouncedQuery.toLowerCase()))
      );
    }

    if (sortOption === 'lowToHigh') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortOption === 'highToLow') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortOption === 'aToZ') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }

    return result;
  }, [menuItems, selectedCategory, debouncedQuery, sortOption]);

  const currentTheme = theme || {
    background: '#F8F9FA',
    text: '#212529',
    primary: '#D9534F',
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentTheme.background }]}>
      <View style={styles.headerRow}>
        <Text style={[styles.headerTitle, { color: currentTheme.text }]}>
          Menu ({filteredAndSortedItems.length})
        </Text>
        
        {/* Navigation Action Buttons Header */}
        <View style={{ flexDirection: 'row', gap: 6 }}>
          {/* Manager Role Check: Sirf Manager ko Dashboard Button Dikhai Dega */}
          {user && user.role === 'manager' && (
            <TouchableOpacity
              style={[styles.cartHeaderBtn, { backgroundColor: '#007AFF' }]}
              onPress={() => navigation.navigate('ManagerDashboard')}
            >
              <Text style={styles.cartHeaderBtnText}>👔 Dashboard</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.cartHeaderBtn, { backgroundColor: '#28A745' }]}
            onPress={() => navigation.navigate('Reservation')}
          >
            <Text style={styles.cartHeaderBtnText}>📅 Table</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cartHeaderBtn}
            onPress={() => navigation.navigate('Cart')}
          >
            <Text style={styles.cartHeaderBtnText}>🛒 Cart</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Input */}
      <View style={styles.searchBar}>
        <TextInput
          ref={searchInputRef}
          style={[styles.searchInput, { color: currentTheme.text }]}
          placeholder="Search menu..."
          placeholderTextColor="#888"
          value={searchQuery}
          onChangeText={handleSearchChange}
        />
      </View>

      {/* Sort Buttons */}
      <View style={styles.sortContainer}>
        <TouchableOpacity onPress={() => setSortOption('lowToHigh')} style={styles.sortBtn}>
          <Text style={styles.sortText}>Price ↑</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setSortOption('highToLow')} style={styles.sortBtn}>
          <Text style={styles.sortText}>Price ↓</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setSortOption('aToZ')} style={styles.sortBtn}>
          <Text style={styles.sortText}>A-Z</Text>
        </TouchableOpacity>
      </View>

      {/* Categories */}
      <View style={styles.categoryContainer}>
        <FlatList
          horizontal
          data={CATEGORIES}
          keyExtractor={(c) => c}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item: category }) => (
            <TouchableOpacity
              style={[
                styles.chip,
                selectedCategory === category && { backgroundColor: currentTheme.primary },
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text style={{ color: selectedCategory === category ? '#FFF' : currentTheme.text }}>
                {category}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Requirement 3: Loading Indicator, Error State + Retry, Pull to Refresh */}
      {loading && !menuItems ? (
        <ActivityIndicator size="large" color={currentTheme.primary} style={{ marginTop: 40 }} />
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load menu: {error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={refetch}>
            <Text style={styles.retryBtnText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={filteredAndSortedItems}
          keyExtractor={(item) => (item._id ? item._id.toString() : item.id.toString())}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={refetch} colors={[currentTheme.primary]} />
          }
          renderItem={({ item }) => (
            <MenuItemCard
              item={item}
              onAddToCart={handleAddToCart}
              onToggleFavourite={handleToggleFavourite}
              isFavourite={favourites.includes(item._id || item.id)}
            />
          )}
          contentContainerStyle={{ padding: 16, gap: 16 }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  headerTitle: { fontSize: 20, fontWeight: 'bold' },
  cartHeaderBtn: { backgroundColor: '#D9534F', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  cartHeaderBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 12 },
  searchBar: { paddingHorizontal: 16, marginBottom: 8 },
  searchInput: { borderWidth: 1, borderColor: '#CCC', borderRadius: 8, padding: 8 },
  sortContainer: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, marginBottom: 8 },
  sortBtn: { backgroundColor: '#E9ECEF', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 },
  sortText: { fontSize: 12, fontWeight: 'bold' },
  categoryContainer: { paddingLeft: 16, marginBottom: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 16, backgroundColor: '#E9ECEF', marginRight: 8 },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  errorText: { color: '#D9534F', fontSize: 16, marginBottom: 12, textAlign: 'center' },
  retryBtn: { backgroundColor: '#007AFF', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  retryBtnText: { color: '#FFF', fontWeight: 'bold' },
});