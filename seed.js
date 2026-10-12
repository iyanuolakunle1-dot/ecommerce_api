require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('./db');

const seedData = async () => {
    try {
        console.log('Seeding SQLite database with sample test data...');

        // Clear existing tables
        await db.query('DELETE FROM orders');
        await db.query('DELETE FROM products');
        await db.query('DELETE FROM users');

        // Hash password for sample users
        const passwordHash = await bcrypt.hash('password123', 10);

        // Seed users
        const u1 = await db.query(
            'INSERT INTO users (full_name, username, email, password) VALUES (?, ?, ?, ?)',
            ['Ada Lovelace', 'adalove', 'ada@example.com', passwordHash]
        );
        const u2 = await db.query(
            'INSERT INTO users (full_name, username, email, password) VALUES (?, ?, ?, ?)',
            ['Alan Turing', 'aturing', 'alan@example.com', passwordHash]
        );

        console.log('Seeded 2 users.');

        // Seed products
        const p1 = await db.query(
            'INSERT INTO products (name, description, price, stock) VALUES (?, ?, ?, ?)',
            ['Mechanical Keyboard', 'Custom tactile mechanical keyboard with backlight', 79.99, 25]
        );
        const p2 = await db.query(
            'INSERT INTO products (name, description, price, stock) VALUES (?, ?, ?, ?)',
            ['Wireless Mouse', 'Ergonomic rechargeable optical mouse', 29.50, 50]
        );

        console.log('Seeded 2 products.');

        // Seed orders
        await db.query(
            'INSERT INTO orders (user_id, product_id, quantity, total_price, status) VALUES (?, ?, ?, ?, ?)',
            [u1.rows[0].id, p1.rows[0].id, 1, 79.99, 'completed']
        );
        await db.query(
            'INSERT INTO orders (user_id, product_id, quantity, total_price, status) VALUES (?, ?, ?, ?, ?)',
            [u2.rows[0].id, p2.rows[0].id, 2, 59.00, 'pending']
        );

        console.log('Seeded 2 orders.');
        console.log('Database seeded successfully!');
        process.exit(0);
    } catch (err) {
        console.error('Error seeding database:', err);
        process.exit(1);
    }
};

seedData();
