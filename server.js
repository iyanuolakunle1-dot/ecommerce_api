require('dotenv').config();
const express = require('express');
const cors = require('cors');

const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');

const app = express();

// Standard middleware
app.use(cors());
app.use(express.json());

// Welcome route
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to the ecommerce API' });
});

// Main resource routes
app.use('/users', userRoutes);
app.use('/products', productRoutes);
app.use('/orders', orderRoutes);

// Catch 404 for unknown routes
app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

// Simple error handler
app.use((err, req, res, next) => {
    console.error(err);
    res.status(err.status || 500).json({
        message: err.message || 'Something went wrong on the server'
    });
});

const port = process.env.PORT || 3000;

if (process.env.NODE_ENV !== 'test') {
    app.listen(port, () => {
        console.log(`Server running on port ${port}`);
    });
}

module.exports = app;