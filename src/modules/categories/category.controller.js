const categoryService = require('./category.service');

class CategoryController {
    async create(req, res, next) {
        try {
            const category = await categoryService.createCategory(req.body);
            res.status(201).json({
                message: 'Category created successfully',
                category
            });
        } catch (err) {
            next(err);
        }
    }

    async getAll(req, res, next) {
        try {
            const categories = await categoryService.getAllCategories();
            res.status(200).json({ data: categories });
        } catch (err) {
            next(err);
        }
    }

    async getById(req, res, next) {
        try {
            const category = await categoryService.getCategoryById(req.params.id);
            res.status(200).json({ data: category });
        } catch (err) {
            next(err);
        }
    }

    async getProducts(req, res, next) {
        try {
            const { page, limit } = req.query;
            const result = await categoryService.getProductsInCategory(req.params.id, page, limit);
            res.status(200).json(result);
        } catch (err) {
            next(err);
        }
    }

    async update(req, res, next) {
        try {
            const category = await categoryService.updateCategory(req.params.id, req.body);
            res.status(200).json({
                message: 'Category updated successfully',
                category
            });
        } catch (err) {
            next(err);
        }
    }

    async delete(req, res, next) {
        try {
            await categoryService.deleteCategory(req.params.id);
            res.status(200).json({ message: 'Category deleted successfully' });
        } catch (err) {
            next(err);
        }
    }
}

module.exports = new CategoryController();
