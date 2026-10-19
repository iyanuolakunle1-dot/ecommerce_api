const express = require('express');
const router = express.Router();
const productController = require('./product.controller');
const { authenticate } = require('../../middleware/auth');

// Public read routes
router.get('/', (req, res, next) => productController.getAll(req, res, next));
router.get('/:id', (req, res, next) => productController.getById(req, res, next));

// Protected mutating routes (Week 2 Auth requirement)
router.post('/', authenticate, (req, res, next) => productController.create(req, res, next));
router.put('/:id', authenticate, (req, res, next) => productController.update(req, res, next));
router.delete('/:id', authenticate, (req, res, next) => productController.delete(req, res, next));

module.exports = router;
