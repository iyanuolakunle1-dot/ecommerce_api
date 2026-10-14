require('dotenv').config();
const { query, initDb, pool } = require('./src/config/db');

const seedData = async () => {
    try {
        console.log('Seeding PostgreSQL database with sample products...');
        await initDb();

        await query('TRUNCATE TABLE products RESTART IDENTITY CASCADE');

        const sampleProducts = [
            ['Mechanical Keyboard', 'Custom tactile mechanical keyboard with backlight', 79.99, 25],
            ['Wireless Mouse', 'Ergonomic rechargeable optical mouse', 29.50, 50],
            ['USB-C Hub Multiport', '7-in-1 adapter with 4K HDMI and 100W PD', 45.00, 30]
        ];

        for (const [name, description, price, stock] of sampleProducts) {
            await query(
                'INSERT INTO products (name, description, price, stock) VALUES ($1, $2, $3, $4)',
                [name, description, price, stock]
            );
        }

        console.log('Seeded sample products successfully');
    } catch (err) {
        console.error('Error seeding database:', err.message);
        process.exitCode = 1;
    } finally {
        await pool.end();
    }
};

seedData();
