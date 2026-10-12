const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const verifyToken = require('../middleware/auth');

// 1. REGISTER
router.post('/register', async (req, res) => {
    try {
        const { full_name, username, email, password } = req.body;

        // Check required fields
        if (!full_name || !username || !email || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters' });
        }

        // Check if email already exists
        const checkEmail = await db.query('SELECT id FROM users WHERE email = ?', [email]);
        if (checkEmail.rows.length > 0) {
            return res.status(400).json({ message: 'Email already registered' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Save user
        const result = await db.query(
            'INSERT INTO users (full_name, username, email, password) VALUES (?, ?, ?, ?)',
            [full_name, username, email, hashedPassword]
        );

        const newId = result.rows[0].id;
        const newUser = await db.query('SELECT id, full_name, username, email FROM users WHERE id = ?', [newId]);

        res.status(201).json({
            message: 'User registered successfully',
            user: newUser.rows[0]
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// 2. LOGIN
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        // Find user
        const result = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        const user = result.rows[0];

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check password
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate token
        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET || 'secretkey',
            { expiresIn: '1d' }
        );

        // Return user without password
        delete user.password;

        res.status(200).json({
            message: 'Login successful',
            token,
            user
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// 3. GET ALL USERS
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const result = await db.query(
            'SELECT id, full_name, username, email, created_at FROM users LIMIT ? OFFSET ?',
            [limit, offset]
        );

        const count = await db.query('SELECT COUNT(*) AS total FROM users');

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

// 4. GET ONE USER
router.get('/:id', async (req, res) => {
    try {
        const result = await db.query('SELECT id, full_name, username, email, created_at FROM users WHERE id = ?', [req.params.id]);
        const user = result.rows[0];

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// 5. UPDATE USER (Protected)
router.put('/:id', verifyToken, async (req, res) => {
    try {
        const { full_name, username, email } = req.body;

        const check = await db.query('SELECT * FROM users WHERE id = ?', [req.params.id]);
        if (check.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const currentUser = check.rows[0];
        const newName = full_name || currentUser.full_name;
        const newUsername = username || currentUser.username;
        const newEmail = email || currentUser.email;

        await db.query(
            'UPDATE users SET full_name = ?, username = ?, email = ? WHERE id = ?',
            [newName, newUsername, newEmail, req.params.id]
        );

        const updated = await db.query('SELECT id, full_name, username, email FROM users WHERE id = ?', [req.params.id]);

        res.status(200).json({
            message: 'User updated successfully',
            user: updated.rows[0]
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// 6. DELETE USER (Protected)
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        const check = await db.query('SELECT id FROM users WHERE id = ?', [req.params.id]);
        if (check.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        await db.query('DELETE FROM users WHERE id = ?', [req.params.id]);

        res.status(200).json({ message: 'User deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
