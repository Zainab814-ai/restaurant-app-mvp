const express = require('express');
const router = express.Router();
const {
  getMenuItems,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
} = require('../controllers/menuController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Public access
router.get('/', getMenuItems);
router.get('/:id', getMenuItemById);

// Protected access (Manager only)
router.post('/', protect, authorize('manager'), createMenuItem);
router.put('/:id', protect, authorize('manager'), updateMenuItem);
router.delete('/:id', protect, authorize('manager'), deleteMenuItem);

module.exports = router;