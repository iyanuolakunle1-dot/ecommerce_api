const db = require('../../config/db');

class OrderRepository {
    async createOrderWithStockDeduction({ userId, productId, quantity, unitPrice }) {
        const client = await db.pool.connect();

        try {
            await client.query('BEGIN');

            // 1. Lock product row to prevent race conditions during concurrent orders
            const productQuery = 'SELECT id, name, price, stock FROM products WHERE id = $1 FOR UPDATE';
            const { rows: products } = await client.query(productQuery, [productId]);

            if (products.length === 0) {
                const error = new Error('Product not found.');
                error.statusCode = 404;
                error.code = 'PRODUCT_NOT_FOUND';
                throw error;
            }

            const product = products[0];

            // 2. Check if enough stock exists
            if (product.stock < quantity) {
                const error = new Error(`Insufficient stock. Only ${product.stock} units available.`);
                error.statusCode = 400;
                error.code = 'INSUFFICIENT_STOCK';
                throw error;
            }

            // 3. Deduct stock from products table
            const updateStockQuery = 'UPDATE products SET stock = stock - $1 WHERE id = $2 RETURNING stock';
            await client.query(updateStockQuery, [quantity, productId]);

            // 4. Calculate total price and insert order record
            const totalPrice = (Number(product.price) * quantity).toFixed(2);
            const insertOrderQuery = `
                INSERT INTO orders (user_id, product_id, quantity, total_price, status)
                VALUES ($1, $2, $3, $4, 'pending')
                RETURNING *
            `;
            const { rows: orders } = await client.query(insertOrderQuery, [
                userId,
                productId,
                quantity,
                totalPrice
            ]);

            await client.query('COMMIT');

            const order = orders[0];
            return {
                ...order,
                product_name: product.name,
                unit_price: product.price
            };
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }
    }

    async findById(orderId) {
        const text = `
            SELECT 
                o.id,
                o.user_id,
                o.product_id,
                o.quantity,
                o.total_price,
                o.status,
                o.created_at,
                u.full_name AS customer_name,
                u.email AS customer_email,
                p.name AS product_name,
                p.price AS unit_price
            FROM orders o
            JOIN users u ON o.user_id = u.id
            JOIN products p ON o.product_id = p.id
            WHERE o.id = $1
        `;
        const { rows } = await db.query(text, [orderId]);
        return rows[0] || null;
    }

    async findByUserId(userId, limit = 10, offset = 0) {
        const listText = `
            SELECT 
                o.id,
                o.user_id,
                o.product_id,
                o.quantity,
                o.total_price,
                o.status,
                o.created_at,
                p.name AS product_name,
                p.price AS unit_price
            FROM orders o
            JOIN products p ON o.product_id = p.id
            WHERE o.user_id = $1
            ORDER BY o.created_at DESC
            LIMIT $2 OFFSET $3
        `;
        const countText = 'SELECT COUNT(*)::int AS total FROM orders WHERE user_id = $1';

        const [listResult, countResult] = await Promise.all([
            db.query(listText, [userId, limit, offset]),
            db.query(countText, [userId])
        ]);

        return {
            items: listResult.rows,
            total: countResult.rows[0].total
        };
    }

    async findAll(limit = 10, offset = 0) {
        const listText = `
            SELECT 
                o.id,
                o.user_id,
                o.product_id,
                o.quantity,
                o.total_price,
                o.status,
                o.created_at,
                u.full_name AS customer_name,
                u.email AS customer_email,
                p.name AS product_name,
                p.price AS unit_price
            FROM orders o
            JOIN users u ON o.user_id = u.id
            JOIN products p ON o.product_id = p.id
            ORDER BY o.created_at DESC
            LIMIT $1 OFFSET $2
        `;
        const countText = 'SELECT COUNT(*)::int AS total FROM orders';

        const [listResult, countResult] = await Promise.all([
            db.query(listText, [limit, offset]),
            db.query(countText)
        ]);

        return {
            items: listResult.rows,
            total: countResult.rows[0].total
        };
    }

    async updateStatus(orderId, status) {
        const text = `
            UPDATE orders
            SET status = $1
            WHERE id = $2
            RETURNING *
        `;
        const { rows } = await db.query(text, [status, orderId]);
        return rows[0] || null;
    }

    async cancelOrderAndRestoreStock(orderId, userId) {
        const client = await db.pool.connect();

        try {
            await client.query('BEGIN');

            const orderQuery = 'SELECT * FROM orders WHERE id = $1 FOR UPDATE';
            const { rows: orders } = await client.query(orderQuery, [orderId]);

            if (orders.length === 0) {
                const error = new Error('Order not found.');
                error.statusCode = 404;
                error.code = 'ORDER_NOT_FOUND';
                throw error;
            }

            const order = orders[0];

            // Ownership check
            if (Number(order.user_id) !== Number(userId)) {
                const error = new Error('You are not authorized to cancel this order.');
                error.statusCode = 403;
                error.code = 'FORBIDDEN';
                throw error;
            }

            if (order.status === 'cancelled') {
                const error = new Error('This order has already been cancelled.');
                error.statusCode = 400;
                error.code = 'ALREADY_CANCELLED';
                throw error;
            }

            // Restore inventory stock
            const restoreStockQuery = 'UPDATE products SET stock = stock + $1 WHERE id = $2';
            await client.query(restoreStockQuery, [order.quantity, order.product_id]);

            // Update status to cancelled
            const updateOrderQuery = "UPDATE orders SET status = 'cancelled' WHERE id = $1 RETURNING *";
            const { rows: updated } = await client.query(updateOrderQuery, [orderId]);

            await client.query('COMMIT');
            return updated[0];
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }
    }
}

module.exports = new OrderRepository();
