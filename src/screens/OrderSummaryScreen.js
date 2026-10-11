import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCart } from '../context/CartContext';
import apiClient from '../api/client';

export default function OrderSummaryScreen({ route, navigation }) {
  const { cartItems = [], discountAmount = 0 } = route.params || {};
  const { state, dispatch } = useCart();
  const [loading, setLoading] = useState(false);

  const items = cartItems.length > 0 ? cartItems : state?.items || [];

  const [orderType, setOrderType] = useState('dine-in'); // 'dine-in' or 'takeaway'
  const [tableNumber, setTableNumber] = useState('Table 2');
  const [pickupTime, setPickupTime] = useState('19:30');

  // Requirement 3: Bill breakdown calculation via useMemo
  const { subtotal, serviceCharge, salesTax, grandTotal } = useMemo(() => {
    const sub = items.reduce((acc, item) => acc + (Number(item.price) || 0) * (Number(item.quantity) || 1), 0);
    const afterDiscount = Math.max(0, sub - discountAmount);
    const sc = afterDiscount * 0.05; // 5% Service Charge
    const tax = afterDiscount * 0.15; // 15% Sales Tax
    const total = afterDiscount + sc + tax;

    return {
      subtotal: sub,
      serviceCharge: sc,
      salesTax: tax,
      grandTotal: total,
    };
  }, [items, discountAmount]);

  // Handle Order Placement directly with Backend API Call
  const handleConfirmOrder = async () => {
    if (items.length === 0) {
      Alert.alert('Error', 'Cart is empty!');
      return;
    }

    try {
      setLoading(true);

      const payload = {
        items: items.map((item) => ({
          _id: item._id || item.id,
          name: item.name,
          price: Number(item.price),
          quantity: Number(item.quantity),
        })),
        totalAmount: grandTotal,
        orderType: orderType,
        tableNumber: orderType === 'dine-in' ? tableNumber : null,
        pickupTime: orderType === 'takeaway' ? pickupTime : null,
        deliveryAddress: orderType === 'dine-in' ? tableNumber : 'Takeaway Pickup',
      };

      // Real Backend API Call (POST /orders)
      const response = await apiClient('/orders', {
        method: 'POST',
        body: payload,
      });

      // Extract generated MongoDB Order ID
      const newOrder = response.order || response.data || response;
      const createdOrderId = newOrder._id || newOrder.id;

      // Clear cart state
      if (dispatch) {
        dispatch({ type: 'CLEAR_CART' });
      }

      Alert.alert('Success 🎉', 'Order placed successfully!');

      // FIXED ROUTE NAME: Route set to exact 'OrderTracking'
      navigation.reset({
        index: 0,
        routes: [{ name: 'OrderTracking', params: { orderId: createdOrderId } }],
      });

    } catch (error) {
      console.error('Order Error:', error.message);
      Alert.alert('Order Failed', error.message || 'Server error while placing order');
    } finally {
      setLoading(false);
    }
  };

  const getItemId = (item, index) => item._id || item.id || `summary-item-${index}`;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={styles.title}>Order Summary</Text>

        {/* Order Type Selector */}
        <Text style={styles.sectionTitle}>Select Dining Type</Text>
        <View style={styles.typeRow}>
          <TouchableOpacity
            style={[styles.typeBtn, orderType === 'dine-in' && styles.activeTypeBtn]}
            onPress={() => setOrderType('dine-in')}
          >
            <Text style={[styles.typeBtnText, orderType === 'dine-in' && styles.activeTypeBtnText]}>
              🍽️ Dine-in
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.typeBtn, orderType === 'takeaway' && styles.activeTypeBtn]}
            onPress={() => setOrderType('takeaway')}
          >
            <Text style={[styles.typeBtnText, orderType === 'takeaway' && styles.activeTypeBtnText]}>
              🛍️ Takeaway
            </Text>
          </TouchableOpacity>
        </View>

        {/* Ordered Items List */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Items Ordered ({items.length})</Text>
          {items.map((item, idx) => (
            <View key={String(getItemId(item, idx))} style={styles.itemRow}>
              <Text style={styles.itemName}>
                {item.quantity}x {item.name}
              </Text>
              <Text style={styles.itemPrice}>Rs. {(item.price * item.quantity).toFixed(2)}</Text>
            </View>
          ))}
        </View>

        {/* Payment Breakdown */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Payment Breakdown</Text>
          <View style={styles.breakdownRow}>
            <Text style={styles.label}>Subtotal</Text>
            <Text style={styles.value}>Rs. {subtotal.toFixed(2)}</Text>
          </View>
          {discountAmount > 0 && (
            <View style={styles.breakdownRow}>
              <Text style={[styles.label, { color: '#28A745' }]}>Discount Applied</Text>
              <Text style={[styles.value, { color: '#28A745' }]}>
                -Rs. {discountAmount.toFixed(2)}
              </Text>
            </View>
          )}
          <View style={styles.breakdownRow}>
            <Text style={styles.label}>Service Charge (5%)</Text>
            <Text style={styles.value}>Rs. {serviceCharge.toFixed(2)}</Text>
          </View>
          <View style={styles.breakdownRow}>
            <Text style={styles.label}>Sales Tax (15%)</Text>
            <Text style={styles.value}>Rs. {salesTax.toFixed(2)}</Text>
          </View>
          <View style={[styles.breakdownRow, styles.grandTotalRow]}>
            <Text style={styles.grandTotalLabel}>Grand Total</Text>
            <Text style={styles.grandTotalValue}>Rs. {grandTotal.toFixed(2)}</Text>
          </View>
        </View>

        {/* Place Order Button */}
        <TouchableOpacity 
          style={styles.placeOrderBtn} 
          onPress={handleConfirmOrder}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.placeOrderBtnText}>Confirm & Place Order</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 8 },
  typeRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  typeBtn: { flex: 1, padding: 12, borderWidth: 1, borderColor: '#CED4DA', borderRadius: 8, alignItems: 'center', backgroundColor: '#FFF' },
  activeTypeBtn: { backgroundColor: '#D9534F', borderColor: '#D9534F' },
  typeBtnText: { fontWeight: 'bold', color: '#495057' },
  activeTypeBtnText: { color: '#FFF' },
  card: { padding: 16, borderWidth: 1, borderColor: '#DEE2E6', borderRadius: 8, backgroundColor: '#FFF', marginBottom: 16 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 12 },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  itemName: { fontSize: 14, color: '#333' },
  itemPrice: { fontSize: 14, fontWeight: 'bold' },
  breakdownRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  label: { fontSize: 14, color: '#6C757D' },
  value: { fontSize: 14, fontWeight: 'bold', color: '#333' },
  grandTotalRow: { borderTopWidth: 1, borderColor: '#DEE2E6', paddingTop: 10, marginTop: 6 },
  grandTotalLabel: { fontSize: 16, fontWeight: 'bold', color: '#1A1A1A' },
  grandTotalValue: { fontSize: 18, fontWeight: 'bold', color: '#D9534F' },
  placeOrderBtn: { backgroundColor: '#D9534F', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 8 },
  placeOrderBtnText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
});