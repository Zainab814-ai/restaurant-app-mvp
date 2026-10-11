import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import apiClient from '../api/client';

const STATUS_STEPS = ['Pending', 'Preparing', 'Ready', 'Served'];

export default function OrderTrackingScreen({ route, navigation }) {
  const { orderId } = route.params || {};
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const fetchMyOrders = async () => {
    try {
      const res = await apiClient('/orders/my');
      let fetchedList = Array.isArray(res) ? res : res?.data || res?.orders || [];
      setOrders(fetchedList);
    } catch (err) {
      console.log('Error polling orders:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMyOrders();
    const intervalId = setInterval(fetchMyOrders, 10000); // 10s Live Polling
    return () => clearInterval(intervalId);
  }, []);

  // Timer Counter
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const currentOrder = orderId
    ? orders.find((o) => String(o._id || o.id) === String(orderId)) || orders[0]
    : orders[0];

  if (loading && orders.length === 0) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color="#D9534F" />
      </SafeAreaView>
    );
  }

  if (!currentOrder) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.emptyText}>No Active Orders Found</Text>
        <TouchableOpacity style={[styles.btn, { marginTop: 16 }]} onPress={() => navigation.navigate('MainTabs')}>
          <Text style={styles.btnText}>Back to Menu</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const formattedStatus = currentOrder.status 
    ? currentOrder.status.charAt(0).toUpperCase() + currentOrder.status.slice(1).toLowerCase()
    : 'Pending';

  const currentStepIndex = STATUS_STEPS.indexOf(formattedStatus);
  const orderTotal = Number(currentOrder.totalAmount || currentOrder.totalPrice || currentOrder.grandTotal || 0);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={{ padding: 20 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchMyOrders(); }} />}
      >
        <Text style={styles.title}>Order Tracking</Text>
        <Text style={styles.orderIdText}>
          Order ID: ORD-{currentOrder._id ? String(currentOrder._id).slice(-4).toUpperCase() : '8811'}
        </Text>
        <Text style={styles.timerText}>⏱️ Elapsed Time: {elapsedSeconds}s</Text>

        {/* Step Progress Circles matching Screenshot */}
        <View style={styles.progressContainer}>
          {STATUS_STEPS.map((step, index) => {
            const isCompleted = currentStepIndex !== -1 ? index <= currentStepIndex : index === 0;
            return (
              <View key={step} style={styles.stepBox}>
                <View style={[styles.circle, isCompleted && styles.activeCircle]}>
                  <Text style={[styles.circleText, isCompleted && styles.activeCircleText]}>{index + 1}</Text>
                </View>
                <Text style={[styles.stepLabel, isCompleted && styles.activeLabel]}>
                  {step}
                </Text>
              </View>
            );
          })}
        </View>

        {/* Order Details Card matching Picture 2 */}
        <View style={styles.card}>
          <Text style={styles.cardTypeTitle}>
            Type: {(currentOrder.orderType || currentOrder.deliveryAddress || 'DINE-IN').toUpperCase()}
          </Text>
          <Text style={styles.tableText}>
            Table Number: {currentOrder.tableNumber || 'Table 2'}
          </Text>
          <Text style={styles.totalText}>
            Total Amount: Rs. {orderTotal.toFixed(2)}
          </Text>
        </View>

        <TouchableOpacity style={styles.btn} onPress={() => navigation.navigate('MainTabs')}>
          <Text style={styles.btnText}>Back to Menu</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  emptyText: { fontSize: 16, color: '#6C757D' },
  title: { fontSize: 32, fontWeight: 'bold', color: '#1A1A1A' },
  orderIdText: { fontSize: 18, color: '#6C757D', marginBottom: 12 },
  timerText: { fontSize: 20, fontWeight: 'bold', color: '#D9534F', marginBottom: 24 },
  progressContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 },
  stepBox: { alignItems: 'center', flex: 1 },
  circle: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#E0E0E0', justifyContent: 'center', alignItems: 'center', marginBottom: 6 },
  activeCircle: { backgroundColor: '#28A745' },
  circleText: { color: '#666', fontWeight: 'bold', fontSize: 18 },
  activeCircleText: { color: '#FFF' },
  stepLabel: { fontSize: 13, color: '#999', fontWeight: '500' },
  activeLabel: { color: '#28A745', fontWeight: 'bold' },
  card: { padding: 20, borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 12, backgroundColor: '#FFF', marginBottom: 24 },
  cardTypeTitle: { fontSize: 20, fontWeight: 'bold', color: '#000', marginBottom: 10 },
  tableText: { fontSize: 16, color: '#333', marginBottom: 12 },
  totalText: { fontSize: 18, fontWeight: 'bold', color: '#D9534F' },
  btn: { backgroundColor: '#D9534F', paddingVertical: 16, borderRadius: 10, alignItems: 'center' },
  btnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
});