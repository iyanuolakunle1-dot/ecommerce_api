const express = require('express');
const router = express.Router();
const orderController = require('./order.controller');
const { authenticate } = require('../../middleware/auth');
const { validate } = require('../../middleware/validate');
const { createOrderSchema, updateOrderStatusSchema } = require('./order.validation');

// All order routes require authentication
router.use(authenticate);

// 1. Place a new order (with transaction & stock deduction)
router.post('/', validate(createOrderSchema), (req, res, next) => orderController.create(req, res, next));

// 2. Get logged-in user's own orders (Relationship 1:N)
router.get('/my-orders', (req, res, next) => orderController.getMyOrders(req, res, next));

// 3. Get single order details (with ownership protection: 403 if not owner)
router.get('/:id', (req, res, next) => orderController.getById(req, res, next));

// 4. Update order status
router.put('/:id/status', validate(updateOrderStatusSchema), (req, res, next) => orderController.updateStatus(req, res, next));

// 5. Cancel order and restore stock (with ownership check)
router.post('/:id/cancel', (req, res, next) => orderController.cancel(req, res, next));

module.exports = router;
