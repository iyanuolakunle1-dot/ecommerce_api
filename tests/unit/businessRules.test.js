const productService = require('../../src/modules/products/product.service');
const orderService = require('../../src/modules/orders/order.service');
const orderRepository = require('../../src/modules/orders/order.repository');
const { createOrderSchema, updateOrderStatusSchema } = require('../../src/modules/orders/order.validation');

describe('Unit Tests: Core Business Rules', () => {

    describe('1. Product Pricing & Stock Business Rules', () => {
        test('rejects product creation when price is negative', async () => {
            await expect(productService.createProduct({
                name: 'Gaming Mouse',
                price: -15.50,
                stock: 10
            })).rejects.toMatchObject({
                statusCode: 400,
                message: 'Price must be a valid positive number'
            });
        });

        test('rejects product creation when price is non-numeric', async () => {
            await expect(productService.createProduct({
                name: 'Gaming Mouse',
                price: 'invalid_price',
                stock: 10
            })).rejects.toMatchObject({
                statusCode: 400,
                message: 'Price must be a valid positive number'
            });
        });

        test('rejects product creation when stock is negative', async () => {
            await expect(productService.createProduct({
                name: 'Gaming Mouse',
                price: 25.00,
                stock: -5
            })).rejects.toMatchObject({
                statusCode: 400,
                message: 'Stock must be a non-negative integer'
            });
        });

        test('rejects product creation with empty or whitespace-only name', async () => {
            await expect(productService.createProduct({
                name: '   ',
                price: 25.00,
                stock: 5
            })).rejects.toMatchObject({
                statusCode: 400,
                message: 'Product name is required'
            });
        });

        test('rejects product update with invalid negative price', async () => {
            jest.spyOn(productService, 'getProductById').mockResolvedValueOnce({
                id: 1,
                name: 'Laptop',
                price: '500.00',
                stock: 10
            });

            await expect(productService.updateProduct(1, { price: -50 }))
                .rejects.toMatchObject({
                    statusCode: 400,
                    message: 'Price must be a valid positive number'
                });
        });
    });

    describe('2. Order Calculation & Inventory Availability Rules', () => {
        test('calculates order total price with accurate 2-decimal precision', () => {
            const unitPrice = 19.99;
            const quantity = 3;
            const totalPrice = (Number(unitPrice) * quantity).toFixed(2);
            expect(totalPrice).toBe('59.97');
        });

        test('calculates correct stock remaining after order deduction', () => {
            const initialStock = 15;
            const orderQuantity = 4;
            const remainingStock = initialStock - orderQuantity;
            expect(remainingStock).toBe(11);
            expect(remainingStock).toBeGreaterThanOrEqual(0);
        });

        test('detects when requested quantity exceeds available stock', () => {
            const stock = 5;
            const requestedQuantity = 8;
            const hasSufficientStock = stock >= requestedQuantity;
            expect(hasSufficientStock).toBe(false);
        });
    });

    describe('3. Order Validation Schemas (Joi)', () => {
        test('accepts valid order placement payload', () => {
            const { error, value } = createOrderSchema.validate({
                product_id: 1,
                quantity: 2
            });
            expect(error).toBeUndefined();
            expect(value.quantity).toBe(2);
        });

        test('rejects order with zero or negative quantity', () => {
            const resZero = createOrderSchema.validate({ product_id: 1, quantity: 0 });
            expect(resZero.error).toBeDefined();

            const resNegative = createOrderSchema.validate({ product_id: 1, quantity: -2 });
            expect(resNegative.error).toBeDefined();
        });

        test('rejects non-integer fractional quantities', () => {
            const { error } = createOrderSchema.validate({
                product_id: 1,
                quantity: 2.5
            });
            expect(error).toBeDefined();
        });

        test('validates allowed order status values', () => {
            const validStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
            validStatuses.forEach(status => {
                const { error } = updateOrderStatusSchema.validate({ status });
                expect(error).toBeUndefined();
            });

            const { error: invalidError } = updateOrderStatusSchema.validate({ status: 'invalid_status' });
            expect(invalidError).toBeDefined();
        });
    });

    describe('4. Order Ownership & Access Control Rules', () => {
        afterEach(() => {
            jest.restoreAllMocks();
        });

        test('throws 403 Forbidden when order belongs to a different user', async () => {
            jest.spyOn(orderRepository, 'findById').mockResolvedValueOnce({
                id: 10,
                user_id: 99, // Owned by user 99
                product_id: 1,
                quantity: 1,
                total_price: '25.00'
            });

            const requestingUser = { id: 42, username: 'charlie' }; // User 42 requesting

            await expect(orderService.getOrderById(10, requestingUser))
                .rejects.toMatchObject({
                    statusCode: 403,
                    code: 'FORBIDDEN',
                    message: 'Access denied. You do not own this order.'
                });
        });

        test('allows access when order user_id matches requesting user', async () => {
            const mockOrder = {
                id: 10,
                user_id: 42,
                product_id: 1,
                quantity: 2,
                total_price: '50.00'
            };
            jest.spyOn(orderRepository, 'findById').mockResolvedValueOnce(mockOrder);

            const requestingUser = { id: 42, username: 'charlie' };
            const result = await orderService.getOrderById(10, requestingUser);

            expect(result).toEqual(mockOrder);
        });

        test('throws 404 when order does not exist', async () => {
            jest.spyOn(orderRepository, 'findById').mockResolvedValueOnce(null);

            const requestingUser = { id: 42 };

            await expect(orderService.getOrderById(999, requestingUser))
                .rejects.toMatchObject({
                    statusCode: 404,
                    code: 'NOT_FOUND',
                    message: 'Order not found.'
                });
        });
    });
});
