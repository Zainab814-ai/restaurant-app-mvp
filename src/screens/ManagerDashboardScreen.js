import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useOrders } from '../context/OrdersContext';
import { useReservation } from '../hooks/useReservation';

export default function ManagerDashboardScreen() {
  const [activeTab, setActiveTab] = useState('orders'); // 'orders', 'reservations', 'menu'
  const { orders, updateOrderStatus } = useOrders();
  const { reservations, cancelReservation } = useReservation();

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Manager Dashboard</Text>

      {/* Tabs */}
      <View style={styles.tabBar}>
        <TouchableOpacity style={[styles.tab, activeTab === 'orders' && styles.activeTab]} onPress={() => setActiveTab('orders')}>
          <Text style={styles.tabText}>Orders</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, activeTab === 'reservations' && styles.activeTab]} onPress={() => setActiveTab('reservations')}>
          <Text style={styles.tabText}>Reservations</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {activeTab === 'orders' ? (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.bold}>{item.id} - Status: {item.status}</Text>
              <Text>Total: Rs. {item.totalPrice.toFixed(2)}</Text>
              <View style={styles.row}>
                <TouchableOpacity style={styles.statusBtn} onPress={() => updateOrderStatus(item.id, 'Preparing')}>
                  <Text style={styles.btnText}>Preparing</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.statusBtn} onPress={() => updateOrderStatus(item.id, 'Ready')}>
                  <Text style={styles.btnText}>Ready</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.statusBtn} onPress={() => updateOrderStatus(item.id, 'Served')}>
                  <Text style={styles.btnText}>Served</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      ) : (
        <FlatList
          data={reservations}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.bold}>{item.name} ({item.partySize} Guests)</Text>
              <Text>{item.date} at {item.timeSlot}</Text>
              <View style={styles.row}>
                <TouchableOpacity style={[styles.statusBtn, { backgroundColor: '#28A745' }]} onPress={() => Alert.alert('Accepted', 'Reservation Accepted')}>
                  <Text style={styles.btnText}>Accept</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.statusBtn, { backgroundColor: '#DC3545' }]} onPress={() => cancelReservation(item.id)}>
                  <Text style={styles.btnText}>Decline</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#F8F9FA' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 12 },
  tabBar: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  tab: { flex: 1, padding: 10, backgroundColor: '#E9ECEF', borderRadius: 6, alignItems: 'center' },
  activeTab: { backgroundColor: '#D9534F' },
  tabText: { color: '#FFF', fontWeight: 'bold' },
  card: { padding: 12, borderWidth: 1, borderColor: '#CCC', borderRadius: 6, backgroundColor: '#FFF', marginBottom: 10 },
  bold: { fontWeight: 'bold' },
  row: { flexDirection: 'row', gap: 6, marginTop: 8 },
  statusBtn: { padding: 6, backgroundColor: '#007BFF', borderRadius: 4 },
  btnText: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },
});