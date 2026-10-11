const express = require('express');
const router = express.Router();
const {
  createReservation,
  getMyReservations,
  getAllReservations,
  updateReservationStatus
} = require('../controllers/reservationController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, createReservation);
router.get('/my', protect, getMyReservations);
router.get('/', protect, authorize('manager'), getAllReservations);
router.patch('/:id', protect, authorize('manager'), updateReservationStatus);

module.exports = router;