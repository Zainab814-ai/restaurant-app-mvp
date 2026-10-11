const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');
const mongoose = require('mongoose');

// 1. Place Order (POST /api/orders)
exports.placeOrder = async (req, res) => {
  try {
    const { items, cartItems, totalAmount, grandTotal, deliveryAddress, orderType, tableNumber } = req.body;
    const rawItems = items || cartItems || [];

    if (!rawItems || rawItems.length === 0) {
      return res.status(400).json({ message: 'Order items cannot be empty' });
    }

    if (!req.user) {
      return res.status(401).json({ message: 'User authentication required' });
    }

    let calculatedTotal = 0;
    const validatedItems = [];

    for (const item of rawItems) {
      const targetId = item.menuItemId || item._id || item.id;
      let dbItem = null;

      // Safe ObjectId check before query
      if (mongoose.Types.ObjectId.isValid(targetId)) {
        dbItem = await MenuItem.findById(targetId);
      }

      if (dbItem) {
        // Business Rule: Server-side check for item availability
        if (dbItem.isAvailable === false) {
          return res.status(400).json({ message: `Item "${dbItem.name}" is currently unavailable.` });
        }

        const qty = Number(item.quantity) || 1;
        calculatedTotal += Number(dbItem.price) * qty;

        validatedItems.push({
          menuItem: dbItem._id,
          name: dbItem.name,
          price: dbItem.price,
          quantity: qty,
        });
      } else {
        // Fallback: If DB item not found, use client provided details gracefully
        const itemPrice = Number(item.price) || 0;
        const qty = Number(item.quantity) || 1;
        calculatedTotal += itemPrice * qty;

        const safeObjectId = mongoose.Types.ObjectId.isValid(targetId)
          ? targetId
          : new mongoose.Types.ObjectId();

        validatedItems.push({
          menuItem: safeObjectId,
          name: item.name || 'Menu Item',
          price: itemPrice,
          quantity: qty,
        });
      }
    }

    // Use server calculated total or fallback to client total
    const finalTotal = calculatedTotal > 0 ? calculatedTotal : Number(totalAmount || grandTotal || 0);

    const newOrder = new Order({
      user: req.user._id,
      items: validatedItems,
      totalAmount: finalTotal,
      totalPrice: finalTotal,
      deliveryAddress: deliveryAddress || (orderType === 'dine-in' ? tableNumber : 'Takeaway Pickup'),
      status: 'Pending',
    });

    await newOrder.save();
    res.status(201).json({ message: 'Order placed successfully 🎉', order: newOrder });

  } catch (error) {
    console.error('Place Order Error:', error);
    res.status(500).json({ message: 'Server error while placing order', error: error.message });
  }
};

// 2. Get Customer's Own Orders (GET /api/orders/my)
exports.getMyOrders = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'User authentication required' });
    }
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching orders', error: error.message });
  }
};

// 3. Get All Orders for Manager (GET /api/orders)
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate('user', 'name email').sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching all orders', error: error.message });
  }
};

// 4. Update Order Status (PATCH /api/orders/:id/status)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const allowedStatuses = ['Pending', 'Preparing', 'Ready', 'Served', 'Cancelled'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status provided' });
    }

    // Business Rule 3: Cancellation is only allowed when status is 'Pending'
    if (status === 'Cancelled' && order.status !== 'Pending') {
      return res.status(400).json({
        message: `Cannot cancel order. Order is already in '${order.status}' stage.`,
      });
    }

    // Business Rule 3: Status progression check (Forward-only rule)
    const statusOrder = ['Pending', 'Preparing', 'Ready', 'Served'];
    if (status !== 'Cancelled') {
      const currentIndex = statusOrder.indexOf(order.status);
      const newIndex = statusOrder.indexOf(status);

      if (newIndex < currentIndex) {
        return res.status(400).json({
          message: `Invalid transition from '${order.status}' back to '${status}'. Status can only move forward.`,
        });
      }
    }

    order.status = status;
    await order.save();

    res.json({ message: 'Order status updated successfully', order });
  } catch (error) {
    res.status(500).json({ message: 'Error updating order status', error: error.message });
  }
};