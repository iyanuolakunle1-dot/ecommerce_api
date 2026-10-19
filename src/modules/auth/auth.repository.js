const db = require('../../config/db');

class AuthRepository {
    async findByEmail(email) {
        const text = 'SELECT * FROM users WHERE LOWER(email) = LOWER($1)';
        const { rows } = await db.query(text, [email]);
        return rows[0] || null;
    }

    async findByUsername(username) {
        const text = 'SELECT * FROM users WHERE LOWER(username) = LOWER($1)';
        const { rows } = await db.query(text, [username]);
        return rows[0] || null;
    }

    async findById(id) {
        const text = 'SELECT id, full_name, username, email, created_at FROM users WHERE id = $1';
        const { rows } = await db.query(text, [id]);
        return rows[0] || null;
    }

    async createUser({ full_name, username, email, password }) {
        const text = `
            INSERT INTO users (full_name, username, email, password)
            VALUES ($1, $2, $3, $4)
            RETURNING id, full_name, username, email, created_at
        `;
        const { rows } = await db.query(text, [full_name, username, email, password]);
        return rows[0];
    }
}

module.exports = new AuthRepository();
