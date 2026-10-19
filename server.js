require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initDb } = require('./src/config/db');
const authRoutes = require('./src/modules/auth/auth.routes');
const productRoutes = require('./src/modules/products/product.routes');
const orderRoutes = require('./src/modules/orders/order.routes');
const categoryRoutes = require('./src/modules/categories/category.routes');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.status(200).json({
        message: 'Welcome to the ecommerce API'
    });
});

// Modular Monolith Routes
app.use('/auth', authRoutes);
app.use('/categories', categoryRoutes);
app.use('/products', productRoutes);
app.use('/orders', orderRoutes);

app.use((req, res) => {
    res.status(404).json({
        error: {
            code: 'NOT_FOUND',
            message: 'Route not found'
        }
    });
});

// Centralized error handler with consistent error format
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const code = err.code || (statusCode === 500 ? 'INTERNAL_SERVER_ERROR' : 'ERROR');

    res.status(statusCode).json({
        error: {
            code,
            message: err.message || 'Internal server error'
        }
    });
});

const port = process.env.PORT || 3000;

if (process.env.NODE_ENV !== 'test') {
    initDb()
        .then(() => {
            app.listen(port, () => {
                console.log(`Server running on port ${port}`);
            });
        })
        .catch(err => {
            console.error('Database connection failed:', err.message);
            process.exit(1);
        });
}

module.exports = app;