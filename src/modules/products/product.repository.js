const db = require('../../config/db');

class ProductRepository {
    async create({ name, description, price, stock, category_id }) {
        const text = `
            INSERT INTO products (name, description, price, stock, category_id)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `;
        const { rows } = await db.query(text, [name, description || '', price, stock || 0, category_id || null]);
        return rows[0];
    }

    async findAll(limit, offset) {
        // LEFT JOIN so products without a category are still returned
        const listText = `
            SELECT 
                p.*,
                c.name AS category_name
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            ORDER BY p.id ASC
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
        const text = `
            SELECT 
                p.*,
                c.name AS category_name
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            WHERE p.id = $1
        `;
        const { rows } = await db.query(text, [id]);
        return rows[0] || null;
    }

    async update(id, { name, description, price, stock, category_id }) {
        const text = `
            UPDATE products
            SET name = $1, description = $2, price = $3, stock = $4, category_id = $5
            WHERE id = $6
            RETURNING *
        `;
        const { rows } = await db.query(text, [name, description, price, stock, category_id, id]);
        return rows[0] || null;
    }

    async delete(id) {
        const text = 'DELETE FROM products WHERE id = $1 RETURNING id';
        const { rows } = await db.query(text, [id]);
        return rows.length > 0;
    }
}

module.exports = new ProductRepository();
