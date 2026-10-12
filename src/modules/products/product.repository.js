const db = require('../../config/db');

class ProductRepository {
    async create({ name, description, price, stock }) {
        const result = await db.query(
            'INSERT INTO products (name, description, price, stock) VALUES (?, ?, ?, ?)',
            [name, description || '', price, stock || 0]
        );
        const newId = result.rows[0].id;
        return this.findById(newId);
    }

    async findAll(limit, offset) {
        const result = await db.query(
            'SELECT * FROM products LIMIT ? OFFSET ?',
            [limit, offset]
        );
        const count = await db.query('SELECT COUNT(*) AS total FROM products');
        return {
            items: result.rows,
            total: count.rows[0].total
        };
    }

    async findById(id) {
        const result = await db.query('SELECT * FROM products WHERE id = ?', [id]);
        return result.rows[0] || null;
    }

    async update(id, { name, description, price, stock }) {
        await db.query(
            'UPDATE products SET name = ?, description = ?, price = ?, stock = ? WHERE id = ?',
            [name, description, price, stock, id]
        );
        return this.findById(id);
    }

    async delete(id) {
        await db.query('DELETE FROM products WHERE id = ?', [id]);
        return true;
    }
}

module.exports = new ProductRepository();
