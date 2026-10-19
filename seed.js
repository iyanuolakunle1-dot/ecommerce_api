require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('./src/config/db');

const seedData = async () => {
    try {
        console.log('Seeding PostgreSQL database with sample data...');

        // 1. Clean existing records in correct foreign key order
        await db.query('DELETE FROM orders');
        await db.query('DELETE FROM products');
        await db.query('DELETE FROM users');
        await db.query('DELETE FROM categories');

        // 2. Hash test password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('password123', salt);

        // 3. Seed demo users
        const user1Result = await db.query(
            `INSERT INTO users (full_name, username, email, password)
             VALUES ($1, $2, $3, $4) RETURNING id, full_name, email`,
            ['Ada Lovelace', 'adalove', 'ada@example.com', hashedPassword]
        );
        const user2Result = await db.query(
            `INSERT INTO users (full_name, username, email, password)
             VALUES ($1, $2, $3, $4) RETURNING id, full_name, email`,
            ['Alan Turing', 'aturing', 'alan@example.com', hashedPassword]
        );

        const adaId = user1Result.rows[0].id;
        const alanId = user2Result.rows[0].id;
        console.log(`Seeded 2 users: ${user1Result.rows[0].email}, ${user2Result.rows[0].email}`);

        // 4. Seed product categories
        const elecResult = await db.query(
            `INSERT INTO categories (name, description)
             VALUES ($1, $2) RETURNING id, name`,
            ['Electronics', 'Computer peripherals and electronic accessories']
        );
        const accResult = await db.query(
            `INSERT INTO categories (name, description)
             VALUES ($1, $2) RETURNING id, name`,
            ['Accessories', 'General accessories for everyday use']
        );

        const electronicsId = elecResult.rows[0].id;
        const accessoriesId = accResult.rows[0].id;
        console.log(`Seeded 2 categories: ${elecResult.rows[0].name}, ${accResult.rows[0].name}`);

        // 5. Seed demo products (now linked to categories)
        const p1Result = await db.query(
            `INSERT INTO products (name, description, price, stock, category_id)
             VALUES ($1, $2, $3, $4, $5) RETURNING id, name, price, stock`,
            ['Mechanical Keyboard', 'Custom tactile mechanical keyboard with backlight', 79.99, 25, electronicsId]
        );
        const p2Result = await db.query(
            `INSERT INTO products (name, description, price, stock, category_id)
             VALUES ($1, $2, $3, $4, $5) RETURNING id, name, price, stock`,
            ['Wireless Mouse', 'Ergonomic rechargeable optical mouse', 29.50, 50, electronicsId]
        );
        await db.query(
            `INSERT INTO products (name, description, price, stock, category_id)
             VALUES ($1, $2, $3, $4, $5) RETURNING id, name, price, stock`,
            ['USB-C Hub Multiport', '7-in-1 adapter with 4K HDMI and 100W PD', 45.00, 30, accessoriesId]
        );

        const keyboardId = p1Result.rows[0].id;
        const mouseId = p2Result.rows[0].id;
        console.log('Seeded 3 sample products with categories.');

        // 6. Seed demo orders (Relationship connecting users and products)
        await db.query(
            `INSERT INTO orders (user_id, product_id, quantity, total_price, status)
             VALUES ($1, $2, $3, $4, $5)`,
            [adaId, keyboardId, 1, 79.99, 'confirmed']
        );
        await db.query(
            `INSERT INTO orders (user_id, product_id, quantity, total_price, status)
             VALUES ($1, $2, $3, $4, $5)`,
            [alanId, mouseId, 2, 59.00, 'pending']
        );

        console.log('Seeded 2 sample orders.');
        console.log('\nDatabase seeded successfully!');
        console.log('Login credentials: ada@example.com / password123');
    } catch (err) {
        console.error('Error seeding database:', err);
        process.exit(1);
    } finally {
        await db.pool.end();
    }
};

seedData();
