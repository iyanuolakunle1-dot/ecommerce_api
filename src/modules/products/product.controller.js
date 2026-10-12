const productService = require('./product.service');

class ProductController {
    async create(req, res, next) {
        try {
            const product = await productService.createProduct(req.body);
            res.status(201).json({
                message: 'Product created successfully',
                product
            });
        } catch (err) {
            next(err);
        }
    }

    async getAll(req, res, next) {
        try {
            const { page, limit } = req.query;
            const result = await productService.getProducts(page, limit);
            res.status(200).json(result);
        } catch (err) {
            next(err);
        }
    }

    async getById(req, res, next) {
        try {
            const product = await productService.getProductById(req.params.id);
            res.status(200).json(product);
        } catch (err) {
            next(err);
        }
    }

    async update(req, res, next) {
        try {
            const product = await productService.updateProduct(req.params.id, req.body);
            res.status(200).json({
                message: 'Product updated successfully',
                product
            });
        } catch (err) {
            next(err);
        }
    }

    async delete(req, res, next) {
        try {
            await productService.deleteProduct(req.params.id);
            res.status(200).json({
                message: 'Product deleted successfully'
            });
        } catch (err) {
            next(err);
        }
    }
}

module.exports = new ProductController();
