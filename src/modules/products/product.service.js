const productRepository = require('./product.repository');

class ProductService {
    async createProduct(data) {
        const { name, description, price, stock } = data;
        if (!name || price === undefined) {
            const error = new Error('Product name and price are required');
            error.statusCode = 400;
            throw error;
        }

        const productPrice = parseFloat(price);
        if (isNaN(productPrice) || productPrice < 0) {
            const error = new Error('Price must be a valid positive number');
            error.statusCode = 400;
            throw error;
        }

        const productStock = stock !== undefined ? parseInt(stock, 10) : 0;
        if (isNaN(productStock) || productStock < 0) {
            const error = new Error('Stock must be a valid non-negative integer');
            error.statusCode = 400;
            throw error;
        }

        return await productRepository.create({
            name: name.trim(),
            description: description ? description.trim() : '',
            price: productPrice,
            stock: productStock
        });
    }

    async getProducts(page = 1, limit = 10) {
        const pageNum = Math.max(1, parseInt(page, 10) || 1);
        const limitNum = Math.max(1, parseInt(limit, 10) || 10);
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
        const product = await productRepository.findById(id);
        if (!product) {
            const error = new Error('Product not found');
            error.statusCode = 404;
            throw error;
        }
        return product;
    }

    async updateProduct(id, data) {
        const current = await this.getProductById(id);

        const newName = data.name !== undefined ? data.name.trim() : current.name;
        const newDesc = data.description !== undefined ? data.description.trim() : current.description;
        const newPrice = data.price !== undefined ? parseFloat(data.price) : current.price;
        const newStock = data.stock !== undefined ? parseInt(data.stock, 10) : current.stock;

        return await productRepository.update(id, {
            name: newName,
            description: newDesc,
            price: newPrice,
            stock: newStock
        });
    }

    async deleteProduct(id) {
        await this.getProductById(id);
        return await productRepository.delete(id);
    }
}

module.exports = new ProductService();
