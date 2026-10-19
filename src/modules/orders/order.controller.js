const orderService = require('./order.service');

class OrderController {
    async create(req, res, next) {
        try {
            const order = await orderService.createOrder(req.user.id, req.body);
            res.status(201).json({
                message: 'Order placed successfully',
                data: order
            });
        } catch (err) {
            next(err);
        }
    }

    async getMyOrders(req, res, next) {
        try {
            const { page, limit } = req.query;
            const result = await orderService.getMyOrders(req.user.id, page, limit);
            res.status(200).json(result);
        } catch (err) {
            next(err);
        }
    }

    async getById(req, res, next) {
        try {
            const order = await orderService.getOrderById(req.params.id, req.user);
            res.status(200).json({
                data: order
            });
        } catch (err) {
            next(err);
        }
    }

    async updateStatus(req, res, next) {
        try {
            const order = await orderService.updateStatus(req.params.id, req.body.status);
            res.status(200).json({
                message: 'Order status updated successfully',
                data: order
            });
        } catch (err) {
            next(err);
        }
    }

    async cancel(req, res, next) {
        try {
            const order = await orderService.cancelOrder(req.params.id, req.user.id);
            res.status(200).json({
                message: 'Order cancelled successfully and inventory restored',
                data: order
            });
        } catch (err) {
            next(err);
        }
    }
}

module.exports = new OrderController();
