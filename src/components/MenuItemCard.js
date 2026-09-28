import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

const MenuItemCard = React.memo(({ item, onAddToCart, onToggleFavourite, isFavourite }) => {
  // Direct theme access to avoid undefined props crash
  const { theme } = useTheme();

  // Console log requirement to track re-renders for Q8
  console.log(`Rendering MenuItemCard: ${item.name}`);

  const currentTheme = theme || {
    cardBackground: '#FFFFFF',
    border: '#E9ECEF',
    text: '#212529',
    subText: '#6C757D',
    primary: '#D9534F',
  };

  return (
    <View
      style={[
        styles.card,
        !item.isAvailable && styles.disabledCard,
        { backgroundColor: currentTheme.cardBackground, borderColor: currentTheme.border },
      ]}
    >
      {item.isSpecial && (
        <View style={styles.specialBadge}>
          <Text style={styles.specialBadgeText}>Daily Special ⭐</Text>
        </View>
      )}

      {/* Favourite Heart Button */}
      <TouchableOpacity
        style={styles.favouriteBtn}
        onPress={() => onToggleFavourite(item.id)}
      >
        <Text style={styles.favouriteIcon}>{isFavourite ? '❤️' : '🤍'}</Text>
      </TouchableOpacity>

      <Image source={{ uri: item.image }} style={styles.itemImage} />

      <View style={styles.itemDetails}>
        <Text style={[styles.itemName, { color: currentTheme.text }]}>{item.name}</Text>
        <Text style={[styles.itemDescription, { color: currentTheme.subText }]} numberOfLines={2}>
          {item.description}
        </Text>
        <Text style={[styles.itemPrice, { color: currentTheme.primary }]}>Rs. {item.price}</Text>

        {!item.isAvailable ? (
          <Text style={styles.outOfStockText}>Out of Stock</Text>
        ) : (
          <TouchableOpacity
            style={[styles.addBtn, { backgroundColor: currentTheme.primary }]}
            onPress={() => onAddToCart(item)}
          >
            <Text style={styles.addBtnText}>Add to Cart</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
});

export default MenuItemCard;

const styles = StyleSheet.create({
  card: { borderRadius: 12, overflow: 'hidden', borderWidth: 1, elevation: 2 },
  disabledCard: { opacity: 0.5 },
  specialBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: '#FFC107',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 1,
  },
  specialBadgeText: { fontSize: 12, fontWeight: 'bold', color: '#000' },
  favouriteBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.3)',
    padding: 6,
    borderRadius: 20,
    zIndex: 2,
  },
  favouriteIcon: { fontSize: 18 },
  itemImage: { width: '100%', height: 160 },
  itemDetails: { padding: 12 },
  itemName: { fontSize: 18, fontWeight: 'bold' },
  itemDescription: { fontSize: 13, marginVertical: 4 },
  itemPrice: { fontSize: 16, fontWeight: 'bold', marginTop: 4 },
  addBtn: { paddingVertical: 8, borderRadius: 6, alignItems: 'center', marginTop: 8 },
  addBtnText: { color: '#FFFFFF', fontWeight: 'bold' },
  outOfStockText: { color: '#DC3545', fontWeight: 'bold', marginTop: 8 },
});