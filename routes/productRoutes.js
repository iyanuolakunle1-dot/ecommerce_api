const express = require('express');
const router = express.Router();
const db = require('../db');

// 1. CREATE PRODUCT (Week 1 Core CRUD)
router.post('/', async (req, res) => {
    try {
        const { name, description, price, stock } = req.body;

        if (!name || price === undefined) {
            return res.status(400).json({ message: 'Product name and price are required' });
        }

        const productPrice = parseFloat(price);
        const productStock = stock !== undefined ? parseInt(stock) : 0;

        const result = await db.query(
            'INSERT INTO products (name, description, price, stock) VALUES (?, ?, ?, ?)',
            [name, description || '', productPrice, productStock]
        );

        const newId = result.rows[0].id;
        const newProduct = await db.query('SELECT * FROM products WHERE id = ?', [newId]);

        res.status(201).json({
            message: 'Product created successfully',
            product: newProduct.rows[0]
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// 2. GET ALL PRODUCTS
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const result = await db.query(
            'SELECT * FROM products LIMIT ? OFFSET ?',
            [limit, offset]
        );

        const count = await db.query('SELECT COUNT(*) AS total FROM products');

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

// 3. GET ONE PRODUCT
router.get('/:id', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM products WHERE id = ?', [req.params.id]);
        const product = result.rows[0];

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.status(200).json(product);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// 4. UPDATE PRODUCT (Week 1 Core CRUD)
router.put('/:id', async (req, res) => {
    try {
        const { name, description, price, stock } = req.body;

        const check = await db.query('SELECT * FROM products WHERE id = ?', [req.params.id]);
        if (check.rows.length === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }

        const current = check.rows[0];
        const newName = name || current.name;
        const newDesc = description !== undefined ? description : current.description;
        const newPrice = price !== undefined ? parseFloat(price) : current.price;
        const newStock = stock !== undefined ? parseInt(stock) : current.stock;

        await db.query(
            'UPDATE products SET name = ?, description = ?, price = ?, stock = ? WHERE id = ?',
            [newName, newDesc, newPrice, newStock, req.params.id]
        );

        const updated = await db.query('SELECT * FROM products WHERE id = ?', [req.params.id]);

        res.status(200).json({
            message: 'Product updated successfully',
            product: updated.rows[0]
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// 5. DELETE PRODUCT (Week 1 Core CRUD)
router.delete('/:id', async (req, res) => {
    try {
        const check = await db.query('SELECT id FROM products WHERE id = ?', [req.params.id]);
        if (check.rows.length === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }

        await db.query('DELETE FROM products WHERE id = ?', [req.params.id]);

        res.status(200).json({ message: 'Product deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
