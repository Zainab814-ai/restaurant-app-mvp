import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { initialMenuItems } from '../data/menu';
import MenuItemCard from '../components/MenuItemCard';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';

const CATEGORIES = ['All', 'Starters', 'Mains', 'Desserts', 'Drinks'];

export default function MenuScreen({ navigation }) {
  const [menuItems, setMenuItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortOption, setSortOption] = useState('default');
  const [favourites, setFavourites] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  const searchInputRef = useRef(null);
  const debounceTimerRef = useRef(null);
  const flatListRef = useRef(null);

  const { dispatch } = useCart();
  const { theme } = useTheme();

  useEffect(() => {
    const timer = setTimeout(() => {
      setMenuItems(initialMenuItems);
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

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
    let result = [...menuItems];

    if (selectedCategory !== 'All') {
      result = result.filter(
        (item) => item.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    if (debouncedQuery) {
      result = result.filter(
        (item) =>
          item.name.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
          item.description.toLowerCase().includes(debouncedQuery.toLowerCase())
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
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TouchableOpacity
            style={[styles.cartHeaderBtn, { backgroundColor: '#28A745' }]}
            onPress={() => navigation.navigate('Reservation')}
          >
            <Text style={styles.cartHeaderBtnText}>📅 Book Table</Text>
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

      {/* List */}
      {isLoading ? (
        <ActivityIndicator size="large" color={currentTheme.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          ref={flatListRef}
          data={filteredAndSortedItems}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <MenuItemCard
              item={item}
              onAddToCart={handleAddToCart}
              onToggleFavourite={handleToggleFavourite}
              isFavourite={favourites.includes(item.id)}
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
  headerTitle: { fontSize: 22, fontWeight: 'bold' },
  cartHeaderBtn: { backgroundColor: '#D9534F', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  cartHeaderBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 13 },
  searchBar: { paddingHorizontal: 16, marginBottom: 8 },
  searchInput: { borderWidth: 1, borderColor: '#CCC', borderRadius: 8, padding: 8 },
  sortContainer: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, marginBottom: 8 },
  sortBtn: { backgroundColor: '#E9ECEF', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 },
  sortText: { fontSize: 12, fontWeight: 'bold' },
  categoryContainer: { paddingLeft: 16, marginBottom: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 16, backgroundColor: '#E9ECEF', marginRight: 8 },
});