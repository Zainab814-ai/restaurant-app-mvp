import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useOrders } from '../context/OrdersContext';

const STATUS_STEPS = ['Pending', 'Preparing', 'Ready', 'Served'];

export default function OrderTrackingScreen({ route, navigation }) {
  const { orderId } = route.params || {};
  const { orders, updateOrderStatus } = useOrders();

  const currentOrder = orders.find((o) => o.id === orderId) || orders[0];

  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Requirement 2: Auto status updates and timer with cleanup
  useEffect(() => {
    if (!currentOrder) return;

    const timer = setInterval(() => {
      setElapsedSeconds((prev) => {
        const nextTime = prev + 1;

        // Auto transition timers
        if (nextTime === 10 && currentOrder.status === 'Pending') {
          updateOrderStatus(currentOrder.id, 'Preparing');
        } else if (nextTime === 20 && currentOrder.status === 'Preparing') {
          updateOrderStatus(currentOrder.id, 'Ready');
        } else if (nextTime === 30 && currentOrder.status === 'Ready') {
          updateOrderStatus(currentOrder.id, 'Served');
        }

        return nextTime;
      });
    }, 1000);

    return () => clearInterval(timer); // Cleanup function
  }, [currentOrder, updateOrderStatus]);

  if (!currentOrder) {
    return (
      <SafeAreaView style={styles.center}>
        <Text>No Active Orders Found</Text>
      </SafeAreaView>
    );
  }

  const currentStepIndex = STATUS_STEPS.indexOf(currentOrder.status);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView padding={20}>
        <Text style={styles.title}>Order Tracking</Text>
        <Text style={styles.orderIdText}>Order ID: {currentOrder.id}</Text>
        <Text style={styles.timerText}>⏱️ Elapsed Time: {elapsedSeconds}s</Text>

        {/* Step Progress Indicator */}
        <View style={styles.progressContainer}>
          {STATUS_STEPS.map((step, index) => {
            const isCompleted = index <= currentStepIndex;
            return (
              <View key={step} style={styles.stepBox}>
                <View style={[styles.circle, isCompleted && styles.activeCircle]}>
                  <Text style={styles.circleText}>{index + 1}</Text>
                </View>
                <Text style={[styles.stepLabel, isCompleted && styles.activeLabel]}>
                  {step}
                </Text>
              </View>
            );
          })}
        </View>

        {/* Order Info */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Type: {currentOrder.orderType.toUpperCase()}</Text>
          {currentOrder.orderType === 'dine-in' ? (
            <Text>Table Number: {currentOrder.tableNumber}</Text>
          ) : (
            <Text>Pickup Time: {currentOrder.pickupTime}</Text>
          )}
          <Text style={styles.totalText}>Total Amount: Rs. {currentOrder.totalPrice.toFixed(2)}</Text>
        </View>

        <TouchableOpacity style={styles.btn} onPress={() => navigation.navigate('MainTabs')}>
          <Text style={styles.btnText}>Back to Menu</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold' },
  orderIdText: { fontSize: 16, color: '#6C757D', marginBottom: 8 },
  timerText: { fontSize: 18, fontWeight: 'bold', color: '#D9534F', marginBottom: 20 },
  progressContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  stepBox: { alignItems: 'center', flex: 1 },
  circle: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#CED4DA', justifyContent: 'center', alignItems: 'center', marginBottom: 4 },
  activeCircle: { backgroundColor: '#28A745' },
  circleText: { color: '#FFF', fontWeight: 'bold' },
  stepLabel: { fontSize: 11, color: '#6C757D' },
  activeLabel: { color: '#28A745', fontWeight: 'bold' },
  card: { padding: 16, borderWidth: 1, borderColor: '#DEE2E6', borderRadius: 8, backgroundColor: '#FFF', marginBottom: 20 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 6 },
  totalText: { fontSize: 16, fontWeight: 'bold', color: '#D9534F', marginTop: 8 },
  btn: { backgroundColor: '#D9534F', padding: 12, borderRadius: 8, alignItems: 'center' },
  btnText: { color: '#FFF', fontWeight: 'bold' },
});