require('dotenv').config();
const db = require('./src/config/db');

const seedData = async () => {
    try {
        console.log('Seeding SQLite database with sample products (Week 1)...');

        // Clear existing products table
        await db.query('DELETE FROM products');

        // Seed sample products
        await db.query(
            'INSERT INTO products (name, description, price, stock) VALUES (?, ?, ?, ?)',
            ['Mechanical Keyboard', 'Custom tactile mechanical keyboard with backlight', 79.99, 25]
        );
        await db.query(
            'INSERT INTO products (name, description, price, stock) VALUES (?, ?, ?, ?)',
            ['Wireless Mouse', 'Ergonomic rechargeable optical mouse', 29.50, 50]
        );
        await db.query(
            'INSERT INTO products (name, description, price, stock) VALUES (?, ?, ?, ?)',
            ['USB-C Hub Multiport', '7-in-1 adapter with 4K HDMI and 100W PD', 45.00, 30]
        );

        console.log('Seeded 3 sample products successfully!');
    } catch (err) {
        console.error('Error seeding database:', err);
        process.exit(1);
    }
};

seedData();
