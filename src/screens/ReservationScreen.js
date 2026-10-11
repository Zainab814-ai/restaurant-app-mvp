import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  Alert,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useIsFocused } from '@react-navigation/native';
import { useReservation } from '../hooks/useReservation';
import { useTheme } from '../context/ThemeContext';
import apiClient from '../api/client';

export default function ReservationScreen() {
  const isFocused = useIsFocused();
  const { theme } = useTheme();
  const currentTheme = theme || {
    background: '#F8F9FA',
    text: '#1A1A1A',
    primary: '#D9534F',
    cardBackground: '#FFF',
    border: '#CCC',
    subText: '#6C757D',
  };

  const {
    selectedDate,
    setSelectedDate,
    selectedSlot,
    setSelectedSlot,
    partySize,
    setPartySize,
    contactName,
    setContactName,
    contactPhone,
    setContactPhone,
    availableSlots,
    validateForm,
  } = useReservation();

  const [tableNumber, setTableNumber] = useState('1');
  const [modalVisible, setModalVisible] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [myReservations, setMyReservations] = useState([]);
  const [loadingReservations, setLoadingReservations] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Requirement 5 & Question 7: Live Polling for Customer Reservations
  const fetchMyReservations = useCallback(async () => {
    try {
      const data = await apiClient('/reservations/my');
      const list = Array.isArray(data) ? data : data?.data || data?.reservations || [];
      setMyReservations(list);
    } catch (err) {
      console.log('Error fetching reservations:', err.message);
    } finally {
      setLoadingReservations(false);
      setRefreshing(false);
    }
  }, []);

  // 10-Second Auto-Polling: Refetches data automatically without restarting the app
  useEffect(() => {
    if (isFocused) {
      fetchMyReservations();

      const intervalId = setInterval(() => {
        fetchMyReservations();
      }, 10000); // 10 seconds polling

      return () => clearInterval(intervalId);
    }
  }, [isFocused, fetchMyReservations]);

  const handleOpenModal = () => {
    const errs = validateForm();
    if (Object.keys(errs).length > 0) {
      setFormErrors(errs);
    } else {
      setFormErrors({});
      setModalVisible(true);
    }
  };

  // Requirement 4 & 5: Save Booking with Server 409 Conflict Handling
  const handleConfirmBooking = async () => {
    setSubmitting(true);
    try {
      await apiClient('/reservations', {
        method: 'POST',
        body: {
          name: contactName,
          phone: contactPhone,
          date: selectedDate,
          time: selectedSlot,
          timeSlot: selectedSlot,
          guests: Number(partySize),
          partySize: Number(partySize),
          tableNumber: Number(tableNumber),
        },
      });

      setModalVisible(false);
      Alert.alert('Success 🎉', `Table ${tableNumber} reserved successfully!`);
      fetchMyReservations(); // Immediate re-fetch after booking
    } catch (err) {
      setModalVisible(false);
      Alert.alert('Booking Error', err.message || 'Table is already booked at this time.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentTheme.background }]}>
      <ScrollView
        contentContainerStyle={{ padding: 16 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchMyReservations(); }} />
        }
      >
        <Text style={[styles.title, { color: currentTheme.text }]}>Table Reservation</Text>

        {/* Inputs */}
        <Text style={styles.label}>Date (YYYY-MM-DD)</Text>
        <TextInput
          style={styles.input}
          value={selectedDate}
          onChangeText={setSelectedDate}
          placeholder="2026-10-15"
        />
        {formErrors.date && <Text style={styles.errText}>{formErrors.date}</Text>}

        <View style={{ flexDirection: 'row', gap: 10 }}>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Party Size (1 - 12)</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={partySize}
              onChangeText={setPartySize}
            />
            {formErrors.partySize && <Text style={styles.errText}>{formErrors.partySize}</Text>}
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Table Number</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={tableNumber}
              onChangeText={setTableNumber}
            />
          </View>
        </View>

        <Text style={styles.label}>Full Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Zainab Farhan"
          value={contactName}
          onChangeText={setContactName}
        />
        {formErrors.name && <Text style={styles.errText}>{formErrors.name}</Text>}

        <Text style={styles.label}>Phone Number (03XX-XXXXXXX)</Text>
        <TextInput
          style={styles.input}
          placeholder="0300-1234567"
          value={contactPhone}
          onChangeText={setContactPhone}
        />
        {formErrors.phone && <Text style={styles.errText}>{formErrors.phone}</Text>}

        {/* Hourly Slot Selector */}
        <Text style={styles.label}>Select Time Slot</Text>
        <View style={styles.slotsGrid}>
          {availableSlots.map(({ slot, isAvailable }) => (
            <TouchableOpacity
              key={slot}
              disabled={!isAvailable}
              style={[
                styles.slotBtn,
                selectedSlot === slot && styles.activeSlot,
                !isAvailable && styles.disabledSlot,
              ]}
              onPress={() => setSelectedSlot(slot)}
            >
              <Text style={[styles.slotText, selectedSlot === slot && { color: '#FFF' }, !isAvailable && styles.disabledSlotText]}>
                {slot} {!isAvailable && '(Full)'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.bookBtn} onPress={handleOpenModal}>
          <Text style={styles.bookBtnText}>Reserve Table</Text>
        </TouchableOpacity>

        {/* My Reservations List */}
        <Text style={[styles.subTitle, { color: currentTheme.text }]}>My Live Reservations</Text>
        {loadingReservations && myReservations.length === 0 ? (
          <ActivityIndicator color={currentTheme.primary} style={{ marginVertical: 10 }} />
        ) : myReservations.length === 0 ? (
          <Text style={{ color: '#888', marginVertical: 10 }}>No active reservations found.</Text>
        ) : (
          myReservations.map((res, index) => {
            const statusStr = res.status || 'Pending';
            const isConfirmed = statusStr === 'Confirmed' || statusStr === 'Accepted';
            const isCancelled = statusStr === 'Cancelled' || statusStr === 'Declined';

            return (
              <View key={res._id || res.id || index} style={styles.resCard}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.resText}>
                    {res.date} at {res.time || res.timeSlot || '19:00'} ({res.guests || res.partySize || 2} Guests)
                  </Text>
                  <Text style={styles.resSubText}>
                    Table #{res.tableNumber || res.table?.tableNumber || 1} - Status:{' '}
                    <Text style={{ fontWeight: 'bold', color: isConfirmed ? '#28A745' : isCancelled ? '#DC3545' : '#FFC107' }}>
                      {statusStr}
                    </Text>
                  </Text>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Confirmation Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalBg}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Confirm Reservation</Text>
            <Text style={styles.modalBody}>Date: {selectedDate}</Text>
            <Text style={styles.modalBody}>Time: {selectedSlot}</Text>
            <Text style={styles.modalBody}>Table: #{tableNumber}</Text>
            <Text style={styles.modalBody}>Guests: {partySize}</Text>
            <Text style={styles.modalBody}>Name: {contactName}</Text>
            <Text style={styles.modalBody}>Phone: {contactPhone}</Text>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancel} onPress={() => setModalVisible(false)} disabled={submitting}>
                <Text style={styles.btnText}>Back</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalConfirm} onPress={handleConfirmBooking} disabled={submitting}>
                {submitting ? (
                  <ActivityIndicator color="#FFF" size="small" />
                ) : (
                  <Text style={styles.btnText}>Confirm</Text>
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
  container: { flex: 1 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 12 },
  subTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 24, marginBottom: 8 },
  label: { fontSize: 13, fontWeight: 'bold', marginTop: 8, marginBottom: 4 },
  input: { borderWidth: 1, borderColor: '#CCC', borderRadius: 6, padding: 8, backgroundColor: '#FFF' },
  errText: { color: 'red', fontSize: 11 },
  slotsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginVertical: 8 },
  slotBtn: { padding: 8, borderWidth: 1, borderColor: '#CCC', borderRadius: 6, backgroundColor: '#FFF' },
  activeSlot: { backgroundColor: '#D9534F', borderColor: '#D9534F' },
  disabledSlot: { backgroundColor: '#E9ECEF', borderColor: '#DEE2E6' },
  slotText: { fontSize: 12, fontWeight: 'bold', color: '#1A1A1A' },
  disabledSlotText: { color: '#ADB5BD' },
  bookBtn: { backgroundColor: '#D9534F', padding: 12, borderRadius: 6, alignItems: 'center', marginTop: 12 },
  bookBtnText: { color: '#FFF', fontWeight: 'bold' },
  resCard: { padding: 10, borderWidth: 1, borderColor: '#E9ECEF', borderRadius: 6, flexDirection: 'row', alignItems: 'center', marginVertical: 4, backgroundColor: '#FFF' },
  resText: { fontWeight: 'bold' },
  resSubText: { fontSize: 12, color: '#6C757D' },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalCard: { backgroundColor: '#FFF', padding: 20, borderRadius: 8, gap: 6 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  modalBody: { fontSize: 14, color: '#333' },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 12 },
  modalCancel: { padding: 8, backgroundColor: '#6C757D', borderRadius: 4 },
  modalConfirm: { padding: 8, backgroundColor: '#28A745', borderRadius: 4 },
  btnText: { color: '#FFF', fontWeight: 'bold' },
});