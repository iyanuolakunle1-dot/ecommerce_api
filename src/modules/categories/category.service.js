const categoryRepository = require('./category.repository');

class CategoryService {
    async createCategory({ name, description }) {
        if (!name || typeof name !== 'string' || !name.trim()) {
            const error = new Error('Category name is required');
            error.statusCode = 400;
            throw error;
        }

        // Make sure we don't create two categories with the same name
        const existing = await categoryRepository.findByName(name.trim());
        if (existing) {
            const error = new Error(`Category "${name.trim()}" already exists.`);
            error.statusCode = 409;
            error.code = 'DUPLICATE_CATEGORY';
            throw error;
        }

        return await categoryRepository.create({
            name: name.trim(),
            description: description ? description.trim() : ''
        });
    }

    async getAllCategories() {
        return await categoryRepository.findAll();
    }

    async getCategoryById(id) {
        const categoryId = parseInt(id, 10);
        if (isNaN(categoryId) || categoryId <= 0) {
            const error = new Error('Invalid category ID');
            error.statusCode = 400;
            throw error;
        }

        const category = await categoryRepository.findById(categoryId);
        if (!category) {
            const error = new Error('Category not found');
            error.statusCode = 404;
            throw error;
        }

        return category;
    }

    async getProductsInCategory(id, page = 1, limit = 10) {
        // First confirm the category exists
        const category = await this.getCategoryById(id);

        const pageNum = Math.max(1, parseInt(page, 10) || 1);
        const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
        const offset = (pageNum - 1) * limitNum;

        const { items, total } = await categoryRepository.findProductsByCategory(
            category.id,
            limitNum,
            offset
        );

        return {
            category,
            data: items,
            page: pageNum,
            limit: limitNum,
            total
        };
    }

    async updateCategory(id, data) {
        const category = await this.getCategoryById(id);

        let newName = category.name;
        if (data.name !== undefined) {
            if (typeof data.name !== 'string' || !data.name.trim()) {
                const error = new Error('Category name cannot be empty');
                error.statusCode = 400;
                throw error;
            }
            // Check that no other category already has this name
            const existing = await categoryRepository.findByName(data.name.trim());
            if (existing && existing.id !== category.id) {
                const error = new Error(`Category "${data.name.trim()}" already exists.`);
                error.statusCode = 409;
                error.code = 'DUPLICATE_CATEGORY';
                throw error;
            }
            newName = data.name.trim();
        }

        const newDescription = data.description !== undefined
            ? (data.description ? data.description.trim() : '')
            : category.description;

        return await categoryRepository.update(category.id, {
            name: newName,
            description: newDescription
        });
    }

    async deleteCategory(id) {
        const category = await this.getCategoryById(id);
        return await categoryRepository.delete(category.id);
    }
}

module.exports = new CategoryService();
