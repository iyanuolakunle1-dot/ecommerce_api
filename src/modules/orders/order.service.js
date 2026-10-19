const orderRepository = require('./order.repository');

class OrderService {
    async createOrder(userId, { product_id, quantity }) {
        return await orderRepository.createOrderWithStockDeduction({
            userId,
            productId: product_id,
            quantity
        });
    }

    async getOrderById(orderId, currentUser) {
        const order = await orderRepository.findById(orderId);
        if (!order) {
            const error = new Error('Order not found.');
            error.statusCode = 404;
            error.code = 'NOT_FOUND';
            throw error;
        }

        // Ownership check: user can only see their own order
        if (Number(order.user_id) !== Number(currentUser.id)) {
            const error = new Error('Access denied. You do not own this order.');
            error.statusCode = 403;
            error.code = 'FORBIDDEN';
            throw error;
        }

        return order;
    }

    async getMyOrders(userId, page = 1, limit = 10) {
        const pageNum = Math.max(1, parseInt(page, 10) || 1);
        const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
        const offset = (pageNum - 1) * limitNum;

        const { items, total } = await orderRepository.findByUserId(userId, limitNum, offset);

        return {
            data: items,
            page: pageNum,
            limit: limitNum,
            total
        };
    }

    async getAllOrders(page = 1, limit = 10) {
        const pageNum = Math.max(1, parseInt(page, 10) || 1);
        const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
        const offset = (pageNum - 1) * limitNum;

        const { items, total } = await orderRepository.findAll(limitNum, offset);

        return {
            data: items,
            page: pageNum,
            limit: limitNum,
            total
        };
    }

    async updateStatus(orderId, status) {
        const existing = await orderRepository.findById(orderId);
        if (!existing) {
            const error = new Error('Order not found.');
            error.statusCode = 404;
            error.code = 'NOT_FOUND';
            throw error;
        }

        return await orderRepository.updateStatus(orderId, status);
    }

    async cancelOrder(orderId, userId) {
        return await orderRepository.cancelOrderAndRestoreStock(orderId, userId);
    }
}

module.exports = new OrderService();
