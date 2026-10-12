require('dotenv').config();
const express = require('express');
const cors = require('cors');

const productRoutes = require('./src/modules/products/product.routes');

const app = express();

// Standard middleware
app.use(cors());
app.use(express.json());

// Welcome & health check route
app.get('/', (req, res) => {
    res.status(200).json({
        message: 'Welcome to the E-Commerce REST API (Week 1)',
        main_resource: '/products',
        status: 'online'
    });
});

// Modular Monolith Routes (Week 1: Products Module)
app.use('/products', productRoutes);

// Catch 404 for undefined routes
app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

// Centralized error handling middleware
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
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