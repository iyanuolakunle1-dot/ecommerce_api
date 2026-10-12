const express = require('express');
const router = express.Router();
const db = require('../db');
const verifyToken = require('../middleware/auth');

// 1. PLACE AN ORDER (Protected)
router.post('/', verifyToken, async (req, res) => {
    try {
        const { product_id, quantity } = req.body;
        const user_id = req.user.id;

        if (!product_id || !quantity) {
            return res.status(400).json({ message: 'product_id and quantity are required' });
        }

        const qty = parseInt(quantity);
        if (qty <= 0) {
            return res.status(400).json({ message: 'Quantity must be at least 1' });
        }

        // Find the product
        const productResult = await db.query('SELECT * FROM products WHERE id = ?', [product_id]);
        const product = productResult.rows[0];

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Check if there is enough stock
        if (product.stock < qty) {
            return res.status(400).json({ message: 'Not enough stock available' });
        }

        // Calculate total price
        const total_price = (product.price * qty).toFixed(2);

        // Save the order
        const orderResult = await db.query(
            'INSERT INTO orders (user_id, product_id, quantity, total_price, status) VALUES (?, ?, ?, ?, ?)',
            [user_id, product_id, qty, total_price, 'pending']
        );

        // Deduct stock from products
        await db.query('UPDATE products SET stock = stock - ? WHERE id = ?', [qty, product_id]);

        const newId = orderResult.rows[0].id;
        const savedOrder = await db.query('SELECT * FROM orders WHERE id = ?', [newId]);

        res.status(201).json({
            message: 'Order placed successfully',
            order: savedOrder.rows[0]
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// 2. GET ALL ORDERS
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const result = await db.query(`
            SELECT 
                orders.id,
                orders.quantity,
                orders.total_price,
                orders.status,
                orders.created_at,
                users.id AS user_id,
                users.full_name AS user_name,
                products.id AS product_id,
                products.name AS product_name
            FROM orders
            JOIN users ON orders.user_id = users.id
            JOIN products ON orders.product_id = products.id
            ORDER BY orders.id DESC
            LIMIT ? OFFSET ?
        `, [limit, offset]);

        const count = await db.query('SELECT COUNT(*) AS total FROM orders');

        res.status(200).json({
            data: result.rows,
            page,
            limit,
            total: count.rows[0].total
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// 3. GET ONE ORDER
router.get('/:id', async (req, res) => {
    try {
        const result = await db.query(`
            SELECT 
                orders.id,
                orders.quantity,
                orders.total_price,
                orders.status,
                orders.created_at,
                users.id AS user_id,
                users.full_name AS user_name,
                products.id AS product_id,
                products.name AS product_name
            FROM orders
            JOIN users ON orders.user_id = users.id
            JOIN products ON orders.product_id = products.id
            WHERE orders.id = ?
        `, [req.params.id]);

        const order = result.rows[0];
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        res.status(200).json(order);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// 4. UPDATE ORDER STATUS (Protected)
router.put('/:id', verifyToken, async (req, res) => {
    try {
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({ message: 'Status is required' });
        }

        const check = await db.query('SELECT id FROM orders WHERE id = ?', [req.params.id]);
        if (check.rows.length === 0) {
            return res.status(404).json({ message: 'Order not found' });
        }

        await db.query('UPDATE orders SET status = ? WHERE id = ?', [status, req.params.id]);

        const updated = await db.query('SELECT * FROM orders WHERE id = ?', [req.params.id]);

        res.status(200).json({
            message: 'Order updated successfully',
            order: updated.rows[0]
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// 5. CANCEL / DELETE ORDER (Protected)
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        const check = await db.query('SELECT id FROM orders WHERE id = ?', [req.params.id]);
        if (check.rows.length === 0) {
            return res.status(404).json({ message: 'Order not found' });
        }

        await db.query('DELETE FROM orders WHERE id = ?', [req.params.id]);

        res.status(200).json({ message: 'Order deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
