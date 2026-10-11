const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db');

// Explicitly load .env from the server directory
dotenv.config({ path: path.join(__dirname, '.env') });

const User = require('./models/User');
const MenuItem = require('./models/MenuItem');
const Table = require('./models/Table');
const Reservation = require('./models/Reservation');
const Order = require('./models/Order');

const seedData = async () => {
  try {
    // Connect to database
    await connectDB();
    console.log('Connected to MongoDB for Seeding...');

    // Clear existing data
    await User.deleteMany();
    await MenuItem.deleteMany();
    await Table.deleteMany();
    await Reservation.deleteMany();
    await Order.deleteMany();

    // Hash passwords for seed users
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    // Seed Users
    await User.insertMany([
      { name: 'Customer User', email: 'customer@app.com', password: hashedPassword, role: 'customer' },
      { name: 'Restaurant Manager', email: 'manager@app.com', password: hashedPassword, role: 'manager' },
    ]);

    // Seed Menu Items
    await MenuItem.insertMany([
      { name: "Chicken Karahi", description: "Traditional wok-cooked spicy chicken", price: 1450, category: "Mains", isSpecial: true, isAvailable: true, image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400" },
      { name: "Chicken Tikka", description: "Barbecued marinated chicken piece", price: 550, category: "Starters", isSpecial: true, isAvailable: true, image: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400" },
      { name: "Seekh Kabab", description: "Grilled minced beef skewers", price: 850, category: "Starters", isSpecial: true, isAvailable: true, image: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400" },
      { name: "Mutton Biryani", description: "Fragrant basmati rice cooked with mutton", price: 1200, category: "Mains", isSpecial: true, isAvailable: true, image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400" },
      { name: "Samosa", description: "Crispy fried pastry filled with spiced potatoes", price: 150, category: "Starters", isSpecial: false, isAvailable: true, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400" },
      { name: "Kheer", description: "Traditional slow-cooked rice pudding", price: 400, category: "Desserts", isSpecial: false, isAvailable: false, image: "https://images.unsplash.com/photo-1517244683847-7456b63c5969?w=400" },
      { name: "Mint Margarita", description: "Refreshing crushed mint and lime soda", price: 300, category: "Drinks", isSpecial: false, isAvailable: true, image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=400" },
      { name: "Lassi", description: "Sweet yogurt drink", price: 250, category: "Drinks", isSpecial: false, isAvailable: true, image: "https://images.unsplash.com/photo-1571006682880-60b296f86b45?w=400" },
      { name: "Garlic Naan", description: "Freshly baked tandoori naan with garlic butter", price: 120, category: "Starters", isSpecial: false, isAvailable: true, image: "https://images.unsplash.com/photo-1626074353765-517a681e40be?w=400" },
      { name: "Butter Chicken", description: "Creamy tomato based chicken curry", price: 1350, category: "Mains", isSpecial: false, isAvailable: true, image: "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=400" },
      { name: "Roghni Naan", description: "Sesame topped traditional naan", price: 100, category: "Starters", isSpecial: false, isAvailable: true, image: "https://images.unsplash.com/photo-1626074353765-517a681e40be?w=400" },
      { name: "Ice Cream", description: "Vanilla bean scoop with chocolate sauce", price: 280, category: "Desserts", isSpecial: false, isAvailable: true, image: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400" },
      { name: "Fresh Lime", description: "Chilled lemon fizz drink", price: 220, category: "Drinks", isSpecial: false, isAvailable: true, image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=400" },
      { name: "Chicken Handi", description: "Boneless chicken cooked in clay pot", price: 1500, category: "Mains", isSpecial: true, isAvailable: true, image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400" },
      { name: "Brownie", description: "Warm chocolate brownie", price: 450, category: "Desserts", isSpecial: true, isAvailable: true, image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400" }
    ]);

    // Seed Tables
    await Table.insertMany([
      { tableNumber: 1, capacity: 2, isAvailable: true },
      { tableNumber: 2, capacity: 2, isAvailable: true },
      { tableNumber: 3, capacity: 4, isAvailable: true },
      { tableNumber: 4, capacity: 4, isAvailable: true },
      { tableNumber: 5, capacity: 6, isAvailable: true },
      { tableNumber: 6, capacity: 8, isAvailable: true },
    ]);

    console.log('Database Seeding Completed Successfully!');
    process.exit(0);
  } catch (error) {
    console.error(`Error Seeding Database: ${error.message}`);
    process.exit(1);
  }
};

seedData();