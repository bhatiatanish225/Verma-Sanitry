const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');
const { connectRedis } = require('./utils/redis');

const authRoutes = require('./routes/auth.routes');
const categoryRoutes = require('./routes/category.routes');
const productRoutes = require('./routes/product.routes');
const orderRoutes = require('./routes/order.routes');
const paymentRoutes = require('./routes/payment.routes');
const adminRoutes = require('./routes/admin.routes');

// Configure dotenv with safe defaults
dotenv.config();

const prisma = new PrismaClient();
const app = express();


app.use(cors({
  origin: '*', // open to all origins (useful for mobile apps)
  credentials: true
}));


app.options('*', cors()); // Enable pre-flight for all routes
app.use(express.json()); // Required to read req.body

// 🏁 Root route
app.get('/', (req, res) => res.send('Sanitary Shop Backend is running!'));

// 🚀 API Routes
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/admin', adminRoutes);

// Load cart routes separately to avoid path-to-regexp issues
const cartRoutes = require('./routes/cart.routes');
app.use('/api/cart', cartRoutes);


// 📂 Ensure invoice directory exists
const path = require('path');
const invoicesPath = path.join(__dirname, 'invoices');
if (!fs.existsSync(invoicesPath)) fs.mkdirSync(invoicesPath);

// 🚀 Start server
const PORT = process.env.PORT || 5001;
const startServer = async () => {
  try {
    // Initialize Redis connection
    await connectRedis();
    
    // Start the server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
