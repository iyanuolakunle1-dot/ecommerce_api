const express = require('express');
const router = express.Router();
const authController = require('./auth.controller');
const { validate } = require('../../middleware/validate');
const { authenticate } = require('../../middleware/auth');
const { registerSchema, loginSchema } = require('./auth.validation');

// Public auth routes
router.post('/register', validate(registerSchema), (req, res, next) => authController.register(req, res, next));
router.post('/login', validate(loginSchema), (req, res, next) => authController.login(req, res, next));

// Protected profile route
router.get('/me', authenticate, (req, res, next) => authController.getMe(req, res, next));

module.exports = router;
