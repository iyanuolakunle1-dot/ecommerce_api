const Joi = require('joi');

const createOrderSchema = Joi.object({
    product_id: Joi.number().integer().positive().required().messages({
        'any.required': 'Product ID is required',
        'number.base': 'Product ID must be a number',
        'number.positive': 'Product ID must be greater than zero'
    }),
    quantity: Joi.number().integer().min(1).max(10000).required().messages({
        'any.required': 'Quantity is required',
        'number.base': 'Quantity must be a number',
        'number.min': 'Quantity must be at least 1',
        'number.max': 'Quantity cannot exceed 10000 per order'
    })
});

const updateOrderStatusSchema = Joi.object({
    status: Joi.string().valid('pending', 'confirmed', 'shipped', 'delivered', 'cancelled').required().messages({
        'any.required': 'Order status is required',
        'any.only': 'Status must be one of: pending, confirmed, shipped, delivered, cancelled'
    })
});

module.exports = {
    createOrderSchema,
    updateOrderStatusSchema
};
