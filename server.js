require('dotenv').config();
const express = require('express');
const cors = require('cors');

const productRoutes = require('./routes/productRoutes');

const app = express();

// Standard middleware
app.use(cors());
app.use(express.json());

// Welcome route
app.get('/', (req, res) => {
    res.json({
        message: 'Welcome to the E-Commerce API (Week 1)',
        main_resource: '/products'
    });
});

// Week 1 Core Entity Routes
app.use('/products', productRoutes);

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