const express = require('express');
const router = express.Router();
const categoryController = require('./category.controller');
const { authenticate } = require('../../middleware/auth');

// Public: anyone can browse categories and their products
router.get('/', (req, res, next) => categoryController.getAll(req, res, next));
router.get('/:id', (req, res, next) => categoryController.getById(req, res, next));
router.get('/:id/products', (req, res, next) => categoryController.getProducts(req, res, next));

// Protected: only authenticated users can create, update or delete a category
router.post('/', authenticate, (req, res, next) => categoryController.create(req, res, next));
router.put('/:id', authenticate, (req, res, next) => categoryController.update(req, res, next));
router.delete('/:id', authenticate, (req, res, next) => categoryController.delete(req, res, next));

module.exports = router;
