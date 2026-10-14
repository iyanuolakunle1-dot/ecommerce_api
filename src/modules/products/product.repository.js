const db = require('../../config/db');

class ProductRepository {
    async create({ name, description, price, stock }) {
        const text = `
            INSERT INTO products (name, description, price, stock)
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `;
        const { rows } = await db.query(text, [name, description || '', price, stock || 0]);
        return rows[0];
    }

    async findAll(limit, offset) {
        const listText = `
            SELECT * FROM products
            ORDER BY id ASC
            LIMIT $1 OFFSET $2
        `;
        const countText = 'SELECT COUNT(*)::int AS total FROM products';

        const [listResult, countResult] = await Promise.all([
            db.query(listText, [limit, offset]),
            db.query(countText)
        ]);

        return {
            items: listResult.rows,
            total: countResult.rows[0].total
        };
    }

    async findById(id) {
        const text = 'SELECT * FROM products WHERE id = $1';
        const { rows } = await db.query(text, [id]);
        return rows[0] || null;
    }

    async update(id, { name, description, price, stock }) {
        const text = `
            UPDATE products
            SET name = $1, description = $2, price = $3, stock = $4
            WHERE id = $5
            RETURNING *
        `;
        const { rows } = await db.query(text, [name, description, price, stock, id]);
        return rows[0] || null;
    }

    async delete(id) {
        const text = 'DELETE FROM products WHERE id = $1 RETURNING id';
        const { rows } = await db.query(text, [id]);
        return rows.length > 0;
    }
}

module.exports = new ProductRepository();
