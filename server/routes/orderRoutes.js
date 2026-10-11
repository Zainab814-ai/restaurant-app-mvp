const express = require('express');
const router = express.Router();
const {
  placeOrder,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
} = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, placeOrder);
router.get('/my', protect, getMyOrders);
router.get('/', protect, authorize('manager'), getAllOrders);
router.patch('/:id/status', protect, authorize('manager'), updateOrderStatus);

module.exports = router;