const mongoose = require('mongoose');
const MenuItem = require('../models/MenuItem');

// @desc    Get all menu items (with optional category & case-insensitive search filter)
// @route   GET /api/menu
exports.getMenuItems = async (req, res) => {
  try {
    const { category, search } = req.query;
    let query = {};

    // Filter by category if provided
    if (category) {
      query.category = category;
    }

    // Case-insensitive search by item name
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const menuItems = await MenuItem.find(query);
    res.status(200).json(menuItems);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Get single menu item by ID
// @route   GET /api/menu/:id
exports.getMenuItemById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId to prevent server crash
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid MongoDB ID format' });
    }

    const menuItem = await MenuItem.findById(id);
    if (!menuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }

    res.status(200).json(menuItem);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Create new menu item
// @route   POST /api/menu
exports.createMenuItem = async (req, res) => {
  try {
    const { name, description, price, category, image } = req.body;

    // Validate required fields
    if (!name || !description || price === undefined || !category || !image) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    if (price < 0) {
      return res.status(400).json({ message: 'Price cannot be negative' });
    }

    const newItem = await MenuItem.create(req.body);
    res.status(201).json(newItem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update menu item
// @route   PUT /api/menu/:id
exports.updateMenuItem = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid MongoDB ID format' });
    }

    if (req.body.price !== undefined && req.body.price < 0) {
      return res.status(400).json({ message: 'Price cannot be negative' });
    }

    const updatedItem = await MenuItem.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }

    res.status(200).json(updatedItem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete menu item
// @route   DELETE /api/menu/:id
exports.deleteMenuItem = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid MongoDB ID format' });
    }

    const deletedItem = await MenuItem.findByIdAndDelete(id);

    if (!deletedItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }

    res.status(200).json({ message: 'Menu item deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};