import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ScrollView,
  Modal,
  Alert,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useReservation } from '../hooks/useReservation';
import { useTheme } from '../context/ThemeContext';

export default function ReservationScreen() {
  const { theme } = useTheme();
  const currentTheme = theme || { background: '#F8F9FA', text: '#1A1A1A', primary: '#D9534F', cardBackground: '#FFF', border: '#CCC', subText: '#6C' };

  const {
    reservations,
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
    createReservation,
    cancelReservation,
  } = useReservation();

  const [modalVisible, setModalVisible] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const handleOpenModal = () => {
    const errs = validateForm();
    if (Object.keys(errs).length > 0) {
      setFormErrors(errs);
    } else {
      setFormErrors({});
      setModalVisible(true);
    }
  };

  const handleConfirmBooking = () => {
    try {
      createReservation();
      setModalVisible(false);
      Alert.alert('Success 🎉', 'Table Reservation confirmed!');
    } catch (err) {
      Alert.alert('Booking Error', err.message);
    }
  };

  const handleCancelPrompt = (id) => {
    Alert.alert('Cancel Reservation', 'Are you sure you want to cancel this booking?', [
      { text: 'No', style: 'cancel' },
      { text: 'Yes, Cancel', style: 'destructive', onPress: () => cancelReservation(id) },
    ]);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentTheme.background }]}>
      <ScrollView padding={16}>
        <Text style={[styles.title, { color: currentTheme.text }]}>Table Reservation</Text>

        {/* Inputs */}
        <Text style={styles.label}>Date (YYYY-MM-DD)</Text>
        <TextInput style={styles.input} value={selectedDate} onChangeText={setSelectedDate} />
        {formErrors.date && <Text style={styles.errText}>{formErrors.date}</Text>}

        <Text style={styles.label}>Party Size (1 - 12)</Text>
        <TextInput style={styles.input} keyboardType="numeric" value={partySize} onChangeText={setPartySize} />
        {formErrors.partySize && <Text style={styles.errText}>{formErrors.partySize}</Text>}

        <Text style={styles.label}>Full Name</Text>
        <TextInput style={styles.input} placeholder="Zainab Farhan" value={contactName} onChangeText={setContactName} />
        {formErrors.name && <Text style={styles.errText}>{formErrors.name}</Text>}

        <Text style={styles.label}>Pakistani Phone (03XX-XXXXXXX)</Text>
        <TextInput style={styles.input} placeholder="0300-1234567" value={contactPhone} onChangeText={setContactPhone} />
        {formErrors.phone && <Text style={styles.errText}>{formErrors.phone}</Text>}

        {/* Hourly Slot Selector */}
        <Text style={styles.label}>Select Time Slot (12:00 - 22:00)</Text>
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
              <Text style={[styles.slotText, !isAvailable && styles.disabledSlotText]}>
                {slot} {!isAvailable && '(Full)'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.bookBtn} onPress={handleOpenModal}>
          <Text style={styles.bookBtnText}>Reserve Table</Text>
        </TouchableOpacity>

        {/* My Reservations List */}
        <Text style={[styles.subTitle, { color: currentTheme.text }]}>My Reservations</Text>
        {reservations.map((res) => (
          <View key={res.id} style={styles.resCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.resText}>{res.date} at {res.timeSlot} ({res.partySize} Seats)</Text>
              <Text style={styles.resSubText}>{res.tableName} - {res.name}</Text>
            </View>
            <TouchableOpacity onPress={() => handleCancelPrompt(res.id)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      {/* Confirmation Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalBg}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Confirm Reservation</Text>
            <Text style={styles.modalBody}>Date: {selectedDate}</Text>
            <Text style={styles.modalBody}>Time: {selectedSlot}</Text>
            <Text style={styles.modalBody}>Guests: {partySize}</Text>
            <Text style={styles.modalBody}>Name: {contactName}</Text>
            <Text style={styles.modalBody}>Phone: {contactPhone}</Text>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancel} onPress={() => setModalVisible(false)}>
                <Text style={styles.btnText}>Back</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalConfirm} onPress={handleConfirmBooking}>
                <Text style={styles.btnText}>Confirm</Text>
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
  resCard: { padding: 10, borderWidth: 1, borderColor: '#E9ECEF', borderRadius: 6, flexDirection: 'row', alignItems: 'center', marginVertical: 4 },
  resText: { fontWeight: 'bold' },
  resSubText: { fontSize: 12, color: '#6C757D' },
  cancelText: { color: 'red', fontWeight: 'bold', fontSize: 12 },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalCard: { backgroundColor: '#FFF', padding: 20, borderRadius: 8, gap: 6 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  modalBody: { fontSize: 14, color: '#333' },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 12 },
  modalCancel: { padding: 8, backgroundColor: '#6C757D', borderRadius: 4 },
  modalConfirm: { padding: 8, backgroundColor: '#28A745', borderRadius: 4 },
  btnText: { color: '#FFF', fontWeight: 'bold' },
});