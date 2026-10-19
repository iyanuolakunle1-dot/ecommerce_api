const productRepository = require('./product.repository');

class ProductService {
    async createProduct(data) {
        const { name, description, price, stock, category_id } = data;

        if (!name || typeof name !== 'string' || !name.trim()) {
            const error = new Error('Product name is required');
            error.statusCode = 400;
            throw error;
        }

        if (price === undefined || price === null || price === '') {
            const error = new Error('Product price is required');
            error.statusCode = 400;
            throw error;
        }

        const parsedPrice = parseFloat(price);
        if (isNaN(parsedPrice) || parsedPrice < 0) {
            const error = new Error('Price must be a valid positive number');
            error.statusCode = 400;
            throw error;
        }

        const parsedStock = stock !== undefined ? parseInt(stock, 10) : 0;
        if (isNaN(parsedStock) || parsedStock < 0) {
            const error = new Error('Stock must be a non-negative integer');
            error.statusCode = 400;
            throw error;
        }

        // category_id is optional — null means "uncategorized"
        const parsedCategoryId = category_id ? parseInt(category_id, 10) : null;

        return await productRepository.create({
            name: name.trim(),
            description: description ? description.trim() : '',
            price: parsedPrice,
            stock: parsedStock,
            category_id: parsedCategoryId
        });
    }

    async getProducts(page = 1, limit = 10) {
        const pageNum = Math.max(1, parseInt(page, 10) || 1);
        const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
        const offset = (pageNum - 1) * limitNum;

        const { items, total } = await productRepository.findAll(limitNum, offset);
        return {
            data: items,
            page: pageNum,
            limit: limitNum,
            total
        };
    }

    async getProductById(id) {
        const productId = parseInt(id, 10);
        if (isNaN(productId) || productId <= 0) {
            const error = new Error('Invalid product ID');
            error.statusCode = 400;
            throw error;
        }

        const product = await productRepository.findById(productId);
        if (!product) {
            const error = new Error('Product not found');
            error.statusCode = 404;
            throw error;
        }

        return product;
    }

    async updateProduct(id, data) {
        const current = await this.getProductById(id);

        let newName = current.name;
        if (data.name !== undefined) {
            if (typeof data.name !== 'string' || !data.name.trim()) {
                const error = new Error('Product name cannot be empty');
                error.statusCode = 400;
                throw error;
            }
            newName = data.name.trim();
        }

        let newDesc = current.description;
        if (data.description !== undefined) {
            newDesc = data.description ? data.description.trim() : '';
        }

        let newPrice = current.price;
        if (data.price !== undefined) {
            const parsedPrice = parseFloat(data.price);
            if (isNaN(parsedPrice) || parsedPrice < 0) {
                const error = new Error('Price must be a valid positive number');
                error.statusCode = 400;
                throw error;
            }
            newPrice = parsedPrice;
        }

        let newStock = current.stock;
        if (data.stock !== undefined) {
            const parsedStock = parseInt(data.stock, 10);
            if (isNaN(parsedStock) || parsedStock < 0) {
                const error = new Error('Stock must be a non-negative integer');
                error.statusCode = 400;
                throw error;
            }
            newStock = parsedStock;
        }

        // Allow updating the category (pass null to remove from a category)
        let newCategoryId = current.category_id;
        if (data.category_id !== undefined) {
            newCategoryId = data.category_id ? parseInt(data.category_id, 10) : null;
        }

        return await productRepository.update(current.id, {
            name: newName,
            description: newDesc,
            price: newPrice,
            stock: newStock,
            category_id: newCategoryId
        });
    }

    async deleteProduct(id) {
        const product = await this.getProductById(id);
        return await productRepository.delete(product.id);
    }
}

module.exports = new ProductService();
