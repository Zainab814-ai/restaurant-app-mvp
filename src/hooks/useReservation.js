import { useState, useMemo, useCallback } from 'react';
import { mockTables, mockReservations } from '../data/reservationsData';

export const TIME_SLOTS = [
  '12:00', '13:00', '14:00', '15:00', '16:00',
  '17:00', '18:00', '19:00', '20:00', '21:00', '22:00'
];

export function useReservation() {
  const [reservations, setReservations] = useState(mockReservations);
  const [selectedDate, setSelectedDate] = useState('2026-09-27');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [partySize, setPartySize] = useState('2');
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [selectedTable, setSelectedTable] = useState(null);

  // Requirement 4: Check free tables per slot
  const availableSlots = useMemo(() => {
    const size = parseInt(partySize, 10) || 1;
    return TIME_SLOTS.map((slot) => {
      const bookedTableIds = reservations
        .filter((r) => r.date === selectedDate && r.timeSlot === slot)
        .map((r) => r.tableId);

      const hasFreeTable = mockTables.some(
        (table) => table.capacity >= size && !bookedTableIds.includes(table.id)
      );

      return {
        slot,
        isAvailable: hasFreeTable,
      };
    });
  }, [reservations, selectedDate, partySize]);

  // Requirement 5: Validation logic
  const validateForm = useCallback(() => {
    const errors = {};
    const size = parseInt(partySize, 10);
    const pkPhoneRegex = /^03\d{2}-\d{7}$/;

    if (!selectedDate) errors.date = 'Date is required';
    if (!selectedSlot) errors.slot = 'Time slot is required';
    if (isNaN(size) || size < 1 || size > 12) {
      errors.partySize = 'Party size must be between 1 and 12';
    }
    if (!pkPhoneRegex.test(contactPhone)) {
      errors.phone = 'Phone format must be 03XX-XXXXXXX';
    }
    if (!contactName.trim()) {
      errors.name = 'Contact name is required';
    }

    return errors;
  }, [selectedDate, selectedSlot, partySize, contactPhone, contactName]);

  const createReservation = useCallback(() => {
    const size = parseInt(partySize, 10);
    const bookedTableIds = reservations
      .filter((r) => r.date === selectedDate && r.timeSlot === selectedSlot)
      .map((r) => r.tableId);

    const table = mockTables.find(
      (t) => t.capacity >= size && !bookedTableIds.includes(t.id)
    );

    if (!table) throw new Error('No available table found for selected slot');

    const newRes = {
      id: `res-${Date.now()}`,
      date: selectedDate,
      timeSlot: selectedSlot,
      partySize: size,
      tableId: table.id,
      tableName: table.name,
      name: contactName,
      phone: contactPhone,
    };

    setReservations((prev) => [...prev, newRes]);
    return newRes;
  }, [reservations, selectedDate, selectedSlot, partySize, contactName, contactPhone]);

  const cancelReservation = useCallback((id) => {
    setReservations((prev) => prev.filter((r) => r.id !== id));
  }, []);

  return {
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
  };
}