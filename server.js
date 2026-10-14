require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initDb } = require('./src/config/db');
const productRoutes = require('./src/modules/products/product.routes');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.status(200).json({
        message: 'Welcome to the ecommerce API'
    });
});

app.use('/products', productRoutes);

app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        message: err.message || 'Internal server error'
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