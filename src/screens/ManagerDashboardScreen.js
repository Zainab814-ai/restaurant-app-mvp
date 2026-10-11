import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import useApi from '../hooks/useApi';
import apiClient from '../api/client';

export default function ManagerDashboardScreen() {
  const [activeTab, setActiveTab] = useState('menu'); // 'menu', 'orders', 'reservations'

  // Requirement 4 & 5: Live menu list
  const { data: menuItems, loading: menuLoading, refetch: refetchMenu } = useApi('/menu');

  // Question 7: Live Orders & Reservations from Server
  const [orders, setOrders] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [resLoading, setResLoading] = useState(false);

  // New Item Form State
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Modal Price Update States
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [newPrice, setNewPrice] = useState('');
  const [updatingPrice, setUpdatingPrice] = useState(false);

  // Question 7: Fetch All Orders from Server
  const fetchAllOrders = async () => {
    try {
      setOrdersLoading(true);
      const res = await apiClient('/orders', { method: 'GET' });
      const fetchedList = Array.isArray(res) ? res : res?.data || res?.orders || [];
      setOrders(fetchedList);
    } catch (err) {
      console.log('Error fetching manager orders:', err.message);
    } finally {
      setOrdersLoading(false);
    }
  };

  // Question 7: Fetch All Reservations from Server
  const fetchAllReservations = async () => {
    try {
      setResLoading(true);
      const res = await apiClient('/reservations', { method: 'GET' });
      const fetchedList = Array.isArray(res) ? res : res?.data || res?.reservations || [];
      setReservations(fetchedList);
    } catch (err) {
      console.log('Error fetching manager reservations:', err.message);
    } finally {
      setResLoading(false);
    }
  };

  // Live Polling every 10 seconds for Manager Sync
  useEffect(() => {
    if (activeTab === 'orders') {
      fetchAllOrders();
      const interval = setInterval(fetchAllOrders, 10000);
      return () => clearInterval(interval);
    } else if (activeTab === 'reservations') {
      fetchAllReservations();
      const interval = setInterval(fetchAllReservations, 10000);
      return () => clearInterval(interval);
    }
  }, [activeTab]);

  // Question 7: Forward-Only Order Status Progression
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await apiClient(`/orders/${orderId}/status`, {
        method: 'PATCH',
        body: { status: newStatus },
      });
      Alert.alert('Success', `Order status updated to ${newStatus}`);
      fetchAllOrders();
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to update order status');
    }
  };

  // Question 7: Accept/Decline Reservation Handler
  const handleUpdateReservationStatus = async (resId, newStatus) => {
    try {
      await apiClient(`/reservations/${resId}`, {
        method: 'PATCH',
        body: { status: newStatus },
      });
      Alert.alert('Success', `Reservation ${newStatus}`);
      fetchAllReservations();
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to update reservation');
    }
  };

  // Add Item to Menu
  const handleAddItem = async () => {
    if (!name || !price || !category) {
      Alert.alert('Error', 'Please fill name, price, and category');
      return;
    }

    setSubmitting(true);
    try {
      await apiClient('/menu', {
        method: 'POST',
        body: {
          name,
          price: Number(price),
          category,
          description: description || 'Freshly prepared item',
          image: 'https://via.placeholder.com/150',
        },
      });
      Alert.alert('Success', 'Item added to live menu!');
      setName('');
      setPrice('');
      setCategory('');
      setDescription('');
      refetchMenu();
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to add item');
    } finally {
      setSubmitting(false);
    }
  };

  // Open Price Change Modal
  const openPriceModal = (item) => {
    setSelectedItem(item);
    setNewPrice(String(item.price));
    setModalVisible(true);
  };

  // Save New Price
  const handleSavePrice = async () => {
    if (!newPrice || isNaN(newPrice)) {
      Alert.alert('Error', 'Please enter a valid price');
      return;
    }

    setUpdatingPrice(true);
    try {
      const itemId = selectedItem._id || selectedItem.id;
      await apiClient(`/menu/${itemId}`, {
        method: 'PUT',
        body: { price: Number(newPrice) },
      });
      Alert.alert('Success', 'Price updated successfully!');
      setModalVisible(false);
      setSelectedItem(null);
      setNewPrice('');
      refetchMenu();
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to update price');
    } finally {
      setUpdatingPrice(false);
    }
  };

  const getItemId = (item, index) => item._id || item.id || `item-${index}`;

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Manager Dashboard 👨‍🍳</Text>

      {/* Tab Selector Bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'menu' && styles.activeTab]}
          onPress={() => setActiveTab('menu')}
        >
          <Text style={[styles.tabText, activeTab === 'menu' && styles.activeTabText]}>Menu</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'orders' && styles.activeTab]}
          onPress={() => setActiveTab('orders')}
        >
          <Text style={[styles.tabText, activeTab === 'orders' && styles.activeTabText]}>Orders</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'reservations' && styles.activeTab]}
          onPress={() => setActiveTab('reservations')}
        >
          <Text style={[styles.tabText, activeTab === 'reservations' && styles.activeTabText]}>Reservations</Text>
        </TouchableOpacity>
      </View>

      {/* Menu Management Tab */}
      {activeTab === 'menu' ? (
        <FlatList
          data={menuItems || []}
          keyExtractor={(item, index) => String(getItemId(item, index))}
          refreshControl={<RefreshControl refreshing={menuLoading} onRefresh={refetchMenu} />}
          ListHeaderComponent={
            <View style={styles.formCard}>
              <Text style={styles.formTitle}>Add New Menu Item</Text>
              <TextInput placeholder="Item Name" value={name} onChangeText={setName} style={styles.input} />
              <TextInput placeholder="Price (PKR)" value={price} onChangeText={setPrice} keyboardType="numeric" style={styles.input} />
              <TextInput placeholder="Category (e.g. Mains, Drinks)" value={category} onChangeText={setCategory} style={styles.input} />
              <TextInput placeholder="Description (Optional)" value={description} onChangeText={setDescription} style={styles.input} />

              <TouchableOpacity style={styles.addButton} onPress={handleAddItem} disabled={submitting}>
                {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.addButtonText}>Add Item</Text>}
              </TouchableOpacity>
            </View>
          }
          renderItem={({ item, index }) => (
            <View key={String(getItemId(item, index))} style={styles.card}>
              <View style={styles.menuRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.bold}>{item.name}</Text>
                  <Text style={styles.categoryText}>{item.category}</Text>
                  <Text style={styles.priceText}>Rs. {item.price}</Text>
                </View>

                <TouchableOpacity
                  style={styles.changePriceBtn}
                  onPress={() => openPriceModal(item)}
                >
                  <Text style={styles.btnText}>Change Price</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      ) : activeTab === 'orders' ? (
        /* Live Orders Tab */
        <FlatList
          data={orders}
          keyExtractor={(item, index) => String(getItemId(item, index))}
          refreshControl={<RefreshControl refreshing={ordersLoading} onRefresh={fetchAllOrders} />}
          renderItem={({ item, index }) => (
            <View key={String(getItemId(item, index))} style={styles.card}>
              <View style={styles.orderHeader}>
                <Text style={styles.bold}>Order #{String(item._id || item.id).slice(-6)}</Text>
                <Text style={styles.statusBadge}>{item.status || 'Pending'}</Text>
              </View>

              <Text style={styles.totalText}>
                Total: Rs. {Number(item.totalAmount || item.totalPrice || item.grandTotal || 0).toFixed(2)}
              </Text>

              {Array.isArray(item.items) && item.items.map((sub, sIdx) => (
                <Text key={sub._id || sub.id || sIdx} style={styles.subItemText}>
                  • {sub.name || 'Menu Item'} x {sub.quantity || 1}
                </Text>
              ))}

              {/* Order Status Action Buttons */}
              <View style={styles.row}>
                <TouchableOpacity
                  style={[styles.statusBtn, { backgroundColor: '#FFC107' }]}
                  onPress={() => handleUpdateOrderStatus(item._id || item.id, 'Preparing')}
                >
                  <Text style={[styles.btnText, { color: '#000' }]}>Preparing</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.statusBtn, { backgroundColor: '#17A2B8' }]}
                  onPress={() => handleUpdateOrderStatus(item._id || item.id, 'Ready')}
                >
                  <Text style={styles.btnText}>Ready</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.statusBtn, { backgroundColor: '#28A745' }]}
                  onPress={() => handleUpdateOrderStatus(item._id || item.id, 'Served')}
                >
                  <Text style={styles.btnText}>Served</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      ) : (
        /* Live Reservations Tab */
        <FlatList
          data={reservations}
          keyExtractor={(item, index) => String(getItemId(item, index))}
          refreshControl={<RefreshControl refreshing={resLoading} onRefresh={fetchAllReservations} />}
          renderItem={({ item, index }) => (
            <View key={String(getItemId(item, index))} style={styles.card}>
              <Text style={styles.bold}>
                {item.user?.name || item.name || 'Customer'} ({item.guests || item.partySize || 1} Guests)
              </Text>
              <Text style={styles.subItemText}>Date: {item.date} at {item.time || item.timeSlot}</Text>
              <Text style={{ fontWeight: 'bold', color: item.status === 'Confirmed' ? '#28A745' : item.status === 'Cancelled' ? '#DC3545' : '#856404', marginVertical: 4 }}>
                Status: {item.status || 'Pending'}
              </Text>

              <View style={styles.row}>
                <TouchableOpacity
                  style={[styles.statusBtn, { backgroundColor: '#28A745' }]}
                  onPress={() => handleUpdateReservationStatus(item._id || item.id, 'Confirmed')}
                >
                  <Text style={styles.btnText}>Accept</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.statusBtn, { backgroundColor: '#DC3545' }]}
                  onPress={() => handleUpdateReservationStatus(item._id || item.id, 'Cancelled')}
                >
                  <Text style={styles.btnText}>Decline</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}

      {/* Price Change Modal */}
      <Modal visible={modalVisible} transparent={true} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Update Price</Text>
            <Text style={styles.modalSubTitle}>{selectedItem?.name}</Text>

            <TextInput
              style={styles.modalInput}
              value={newPrice}
              onChangeText={setNewPrice}
              keyboardType="numeric"
              placeholder="Enter new price"
              autoFocus={true}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: '#6C757D' }]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.btnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: '#28A745' }]}
                onPress={handleSavePrice}
                disabled={updatingPrice}
              >
                {updatingPrice ? (
                  <ActivityIndicator color="#FFF" size="small" />
                ) : (
                  <Text style={styles.btnText}>Save Price</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#F8F9FA' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 12 },
  tabBar: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  tab: { flex: 1, padding: 10, backgroundColor: '#E9ECEF', borderRadius: 6, alignItems: 'center' },
  activeTab: { backgroundColor: '#D9534F' },
  tabText: { color: '#333', fontWeight: 'bold' },
  activeTabText: { color: '#FFF' },
  card: { padding: 12, borderWidth: 1, borderColor: '#CCC', borderRadius: 6, backgroundColor: '#FFF', marginBottom: 10 },
  bold: { fontWeight: 'bold', fontSize: 16 },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  statusBadge: { backgroundColor: '#FFF3CD', color: '#856404', fontWeight: 'bold', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, overflow: 'hidden' },
  totalText: { color: '#D9534F', fontWeight: 'bold', marginBottom: 6 },
  subItemText: { color: '#555', fontSize: 14 },
  categoryText: { color: '#007BFF', fontSize: 12, marginVertical: 2 },
  priceText: { color: '#28A745', fontWeight: 'bold' },
  row: { flexDirection: 'row', gap: 8, marginTop: 10 },
  menuRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statusBtn: { flex: 1, paddingVertical: 8, borderRadius: 4, alignItems: 'center', justifyContent: 'center' },
  changePriceBtn: { padding: 8, backgroundColor: '#D9534F', borderRadius: 4 },
  btnText: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },
  formCard: { backgroundColor: '#FFF', padding: 12, borderRadius: 6, borderWidth: 1, borderColor: '#DDD', marginBottom: 15 },
  formTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#CCC', borderRadius: 4, padding: 8, marginBottom: 8 },
  addButton: { backgroundColor: '#28A745', padding: 10, borderRadius: 4, alignItems: 'center' },
  addButtonText: { color: '#FFF', fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { width: '90%', backgroundColor: '#FFF', borderRadius: 10, padding: 20, elevation: 5 },
  modalTitle: { fontSize: 18, fontWeight: 'bold' },
  modalSubTitle: { fontSize: 14, color: '#666', marginBottom: 12 },
  modalInput: { borderWidth: 1, borderColor: '#CCC', borderRadius: 6, padding: 10, fontSize: 16, marginBottom: 16 },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10 },
  modalBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 6 },
});