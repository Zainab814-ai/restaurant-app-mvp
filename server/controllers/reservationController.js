const Reservation = require('../models/Reservation');
const Table = require('../models/Table');
const mongoose = require('mongoose');

// 1. Create Reservation (POST /api/reservations)
exports.createReservation = async (req, res) => {
  try {
    const { date, time, timeSlot, guests, partySize, table, tableNumber, name, phone } = req.body;

    const finalDate = (date || '').trim();
    const finalTime = (time || timeSlot || '').trim();
    const finalGuests = Number(guests || partySize || 0);

    // Basic Validation Check
    if (!finalDate || !finalTime || !finalGuests) {
      return res.status(400).json({ 
        message: 'Please provide all required fields (date, time, guests)' 
      });
    }

    if (!req.user) {
      return res.status(401).json({ message: 'User authentication required. Please login again.' });
    }

    // Robust Table ObjectId Resolution
    let finalTableId = null;

    if (table && mongoose.Types.ObjectId.isValid(table)) {
      finalTableId = table;
    } else {
      const num = Number(tableNumber || 1);
      // Try fetching real table doc first
      const tableDoc = await Table.findOne({ tableNumber: num });
      if (tableDoc) {
        finalTableId = tableDoc._id;
      } else {
        // Fallback: Create a valid 24-hex string based on table number
        finalTableId = new mongoose.Types.ObjectId(num.toString(16).padStart(24, '0'));
      }
    }

    // BUSINESS RULE (Requirement 4): Double-booking Conflict Check
    const existingBooking = await Reservation.findOne({
      table: finalTableId,
      date: finalDate,
      time: finalTime,
      status: { $in: ['Pending', 'Confirmed'] }
    });

    if (existingBooking) {
      return res.status(409).json({ 
        message: `This table is already booked for ${finalDate} at ${finalTime}. Please choose another time slot.` 
      });
    }

    // Create Reservation matching exact Mongoose Schema
    const newReservation = new Reservation({
      user: req.user._id,
      table: finalTableId,
      date: finalDate,
      time: finalTime,
      guests: finalGuests,
      status: 'Pending'
    });

    await newReservation.save();

    res.status(201).json({ 
      message: 'Reservation booked successfully 🎉', 
      reservation: newReservation 
    });

  } catch (error) {
    console.error('Reservation Controller Error:', error);
    res.status(500).json({ message: error.message || 'Server error while booking reservation' });
  }
};

// 2. Get Customer's Own Reservations (GET /api/reservations/my)
exports.getMyReservations = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'User authentication required' });
    }
    const reservations = await Reservation.find({ user: req.user._id })
      .populate('table')
      .sort({ createdAt: -1 });
    res.json(reservations);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching customer reservations', error: error.message });
  }
};

// 3. Get All Reservations for Manager (GET /api/reservations)
exports.getAllReservations = async (req, res) => {
  try {
    const reservations = await Reservation.find()
      .populate('user', 'name email')
      .populate('table')
      .sort({ createdAt: -1 });
    res.json(reservations);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching all reservations', error: error.message });
  }
};

// 4. Accept/Decline Reservation by Manager (PATCH /api/reservations/:id)
exports.updateReservationStatus = async (req, res) => {
  try {
    const { status } = req.body; // 'Confirmed' or 'Cancelled'
    const reservation = await Reservation.findById(req.params.id);

    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    const allowedStatuses = ['Pending', 'Confirmed', 'Cancelled'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: `Invalid status. Allowed values are: ${allowedStatuses.join(', ')}` });
    }

    reservation.status = status;
    await reservation.save();

    res.json({ message: `Reservation status updated to ${status}`, reservation });
  } catch (error) {
    res.status(500).json({ message: 'Error updating reservation', error: error.message });
  }
};