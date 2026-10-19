const db = require('../../config/db');

class CategoryRepository {
    async create({ name, description }) {
        const text = `
            INSERT INTO categories (name, description)
            VALUES ($1, $2)
            RETURNING *
        `;
        const { rows } = await db.query(text, [name, description || '']);
        return rows[0];
    }

    async findAll() {
        const text = 'SELECT * FROM categories ORDER BY name ASC';
        const { rows } = await db.query(text);
        return rows;
    }

    async findById(id) {
        const text = 'SELECT * FROM categories WHERE id = $1';
        const { rows } = await db.query(text, [id]);
        return rows[0] || null;
    }

    async findByName(name) {
        const text = 'SELECT * FROM categories WHERE LOWER(name) = LOWER($1)';
        const { rows } = await db.query(text, [name]);
        return rows[0] || null;
    }

    async update(id, { name, description }) {
        const text = `
            UPDATE categories
            SET name = $1, description = $2
            WHERE id = $3
            RETURNING *
        `;
        const { rows } = await db.query(text, [name, description, id]);
        return rows[0] || null;
    }

    async delete(id) {
        const text = 'DELETE FROM categories WHERE id = $1 RETURNING id';
        const { rows } = await db.query(text, [id]);
        return rows.length > 0;
    }

    // Get all products belonging to a specific category
    async findProductsByCategory(categoryId, limit, offset) {
        const listText = `
            SELECT 
                p.*,
                c.name AS category_name
            FROM products p
            JOIN categories c ON p.category_id = c.id
            WHERE p.category_id = $1
            ORDER BY p.id ASC
            LIMIT $2 OFFSET $3
        `;
        const countText = 'SELECT COUNT(*)::int AS total FROM products WHERE category_id = $1';

        const [listResult, countResult] = await Promise.all([
            db.query(listText, [categoryId, limit, offset]),
            db.query(countText, [categoryId])
        ]);

        return {
            items: listResult.rows,
            total: countResult.rows[0].total
        };
    }
}

module.exports = new CategoryRepository();
