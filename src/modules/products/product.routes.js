const express = require('express');
const router = express.Router();
const productController = require('./product.controller');

// Week 1 Main Entity Core CRUD routes
router.post('/', (req, res, next) => productController.create(req, res, next));
router.get('/', (req, res, next) => productController.getAll(req, res, next));
router.get('/:id', (req, res, next) => productController.getById(req, res, next));
router.put('/:id', (req, res, next) => productController.update(req, res, next));
router.delete('/:id', (req, res, next) => productController.delete(req, res, next));

module.exports = router;
