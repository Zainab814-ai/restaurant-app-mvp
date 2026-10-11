import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCart } from '../context/CartContext';

export default function CartScreen({ navigation }) {
  const { state, dispatch } = useCart();
  const [promoCode, setPromoCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);

  const cartItems = state?.items || [];
  const subtotal = cartItems.reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 1), 0);
  const discountAmount = (subtotal * discountPercent) / 100;
  const grandTotal = subtotal - discountAmount;

  const handleApplyPromo = () => {
    if (promoCode.trim().toUpperCase() === 'WELCOME10') {
      setDiscountPercent(10);
      Alert.alert('Promo Applied 🎉', '10% discount applied!');
    } else {
      Alert.alert('Invalid Code', 'Try promo code: WELCOME10');
    }
  };

  const getItemId = (item) => item._id || item.id;

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.headerTitle}>Shopping Cart ({cartItems.length})</Text>

      {cartItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Your cart is empty 🛒</Text>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.navigate('MainTabs')}>
            <Text style={styles.backBtnText}>Browse Menu</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <FlatList
            data={cartItems}
            keyExtractor={(item) => String(getItemId(item))}
            renderItem={({ item }) => (
              <View style={styles.cartCard}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemPrice}>Rs. {item.price}</Text>
                </View>
                <View style={styles.qtyRow}>
                  <TouchableOpacity
                    style={styles.qtyBtn}
                    onPress={() => dispatch({ type: 'DECREMENT', payload: getItemId(item) })}
                  >
                    <Text style={styles.qtyBtnText}>-</Text>
                  </TouchableOpacity>
                  <Text style={styles.qtyText}>{item.quantity}</Text>
                  <TouchableOpacity
                    style={styles.qtyBtn}
                    onPress={() => dispatch({ type: 'INCREMENT', payload: getItemId(item) })}
                  >
                    <Text style={styles.qtyBtnText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
            contentContainerStyle={{ padding: 16 }}
          />

          <View style={styles.footer}>
            <View style={styles.promoRow}>
              <TextInput
                style={styles.promoInput}
                placeholder="Promo Code (WELCOME10)"
                placeholderTextColor="#999"
                value={promoCode}
                onChangeText={setPromoCode}
              />
              <TouchableOpacity style={styles.applyBtn} onPress={handleApplyPromo}>
                <Text style={styles.applyBtnText}>Apply</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Grand Total:</Text>
              <Text style={styles.totalValue}>Rs. {grandTotal.toFixed(2)}</Text>
            </View>

            <TouchableOpacity
              style={styles.checkoutBtn}
              onPress={() =>
                navigation.navigate('OrderSummary', {
                  cartItems: cartItems,
                  discountAmount: discountAmount,
                  grandTotal: grandTotal,
                })
              }
            >
              <Text style={styles.checkoutBtnText}>Proceed to Order Summary ➔</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  headerTitle: { fontSize: 22, fontWeight: 'bold', padding: 16 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 18, color: '#6C757D', marginBottom: 12 },
  backBtn: { backgroundColor: '#D9534F', padding: 10, borderRadius: 6 },
  backBtnText: { color: '#FFF', fontWeight: 'bold' },
  cartCard: { flexDirection: 'row', padding: 12, borderWidth: 1, borderColor: '#DEE2E6', borderRadius: 8, backgroundColor: '#FFF', marginBottom: 10, alignItems: 'center' },
  itemName: { fontSize: 16, fontWeight: 'bold' },
  itemPrice: { color: '#D9534F', marginTop: 4 },
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  qtyBtn: { width: 28, height: 28, backgroundColor: '#E9ECEF', borderRadius: 4, justifyContent: 'center', alignItems: 'center' },
  qtyBtnText: { fontWeight: 'bold', fontSize: 16 },
  qtyText: { fontSize: 14, fontWeight: 'bold' },
  footer: { padding: 16, borderTopWidth: 1, borderColor: '#DEE2E6', backgroundColor: '#FFF' },
  promoRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  promoInput: { flex: 1, borderWidth: 1, borderColor: '#CED4DA', borderRadius: 6, padding: 8, color: '#000' },
  applyBtn: { backgroundColor: '#28A745', paddingHorizontal: 14, justifyContent: 'center', borderRadius: 6 },
  applyBtnText: { color: '#FFF', fontWeight: 'bold' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  totalLabel: { fontSize: 16, fontWeight: 'bold' },
  totalValue: { fontSize: 18, fontWeight: 'bold', color: '#D9534F' },
  checkoutBtn: { backgroundColor: '#D9534F', padding: 14, borderRadius: 8, alignItems: 'center' },
  checkoutBtnText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
});