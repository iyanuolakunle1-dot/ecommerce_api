const request = require('supertest');
const app = require('../server');

let token = '';
let userId = '';
let productId = '';
let orderId = '';

describe('E-commerce API Integration Tests', () => {

    // --- USERS ---
    describe('Users Endpoints', () => {
        test('POST /users/register - creates new user', async () => {
            const res = await request(app).post('/users/register').send({
                full_name: 'Grace Hopper',
                username: `grace_${Date.now()}`,
                email: `grace_${Date.now()}@example.com`,
                password: 'password123'
            });
            expect(res.statusCode).toBe(201);
            expect(res.body).toHaveProperty('user');
            expect(res.body.user).not.toHaveProperty('password');
            userId = res.body.user.id;
        });

        test('POST /users/register - fails with missing fields', async () => {
            const res = await request(app).post('/users/register').send({
                email: 'incomplete@example.com'
            });
            expect(res.statusCode).toBe(400);
        });

        test('POST /users/login - returns JWT token', async () => {
            const email = `testlogin_${Date.now()}@example.com`;
            const username = `testlogin_${Date.now()}`;
            await request(app).post('/users/register').send({
                full_name: 'Test Login User',
                username,
                email,
                password: 'password123'
            });

            const res = await request(app).post('/users/login').send({
                email,
                password: 'password123'
            });
            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('token');
            token = res.body.token;
        });

        test('POST /users/login - fails with wrong password', async () => {
            const res = await request(app).post('/users/login').send({
                email: 'invalid@example.com',
                password: 'wrongpassword'
            });
            expect(res.statusCode).toBe(404);
        });

        test('GET /users - returns paginated list of users', async () => {
            const res = await request(app).get('/users?page=1&limit=5');
            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('data');
            expect(Array.isArray(res.body.data)).toBe(true);
        });

        test('GET /users/:id - returns one user', async () => {
            const res = await request(app).get(`/users/${userId}`);
            expect(res.statusCode).toBe(200);
            expect(res.body.id).toBe(userId);
        });
    });

    // --- PRODUCTS ---
    describe('Products Endpoints', () => {
        test('POST /products - rejects without auth token', async () => {
            const res = await request(app).post('/products').send({
                name: 'Laptop Stand',
                price: 25.00,
                stock: 10
            });
            expect(res.statusCode).toBe(401);
        });

        test('POST /products - creates product with valid token', async () => {
            const res = await request(app)
                .post('/products')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    name: 'Ergonomic Desk Mat',
                    description: 'Large smooth felt desk mat',
                    price: 24.99,
                    stock: 40
                });
            expect(res.statusCode).toBe(201);
            expect(res.body.product).toHaveProperty('id');
            productId = res.body.product.id;
        });

        test('GET /products - returns paginated products', async () => {
            const res = await request(app).get('/products');
            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('data');
            expect(Array.isArray(res.body.data)).toBe(true);
        });

        test('GET /products/:id - returns one product', async () => {
            const res = await request(app).get(`/products/${productId}`);
            expect(res.statusCode).toBe(200);
            expect(res.body.id).toBe(productId);
        });

        test('PUT /products/:id - updates product with token', async () => {
            const res = await request(app)
                .put(`/products/${productId}`)
                .set('Authorization', `Bearer ${token}`)
                .send({
                    price: 29.99
                });
            expect(res.statusCode).toBe(200);
            expect(parseFloat(res.body.product.price)).toBe(29.99);
        });
    });

    // --- ORDERS ---
    describe('Orders Endpoints', () => {
        test('POST /orders - creates order and updates stock with token', async () => {
            const res = await request(app)
                .post('/orders')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    product_id: productId,
                    quantity: 2
                });
            expect(res.statusCode).toBe(201);
            expect(res.body).toHaveProperty('order');
            expect(res.body.order.quantity).toBe(2);
            orderId = res.body.order.id;
        });

        test('POST /orders - rejects if quantity exceeds stock', async () => {
            const res = await request(app)
                .post('/orders')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    product_id: productId,
                    quantity: 999999
                });
            expect(res.statusCode).toBe(400);
            expect(res.body.message).toContain('stock');
        });

        test('GET /orders - returns paginated orders', async () => {
            const res = await request(app).get('/orders');
            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('data');
            expect(Array.isArray(res.body.data)).toBe(true);
        });

        test('GET /orders/:id - returns single order details', async () => {
            const res = await request(app).get(`/orders/${orderId}`);
            expect(res.statusCode).toBe(200);
            expect(res.body.id).toBe(orderId);
        });

        test('PUT /orders/:id - updates order status with token', async () => {
            const res = await request(app)
                .put(`/orders/${orderId}`)
                .set('Authorization', `Bearer ${token}`)
                .send({
                    status: 'shipped'
                });
            expect(res.statusCode).toBe(200);
            expect(res.body.order.status).toBe('shipped');
        });
    });
});
