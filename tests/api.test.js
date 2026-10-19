const request = require('supertest');
const app = require('../server');
const { initDb, pool } = require('../src/config/db');

let authToken;
let testUserId;
let testProductId;
let testOrderId;
let otherUserToken;

describe('BuildLab Stage 1 Integration Tests (Week 1 & Week 2)', () => {
    const timestamp = Date.now();

    beforeAll(async () => {
        if (process.env.DATABASE_URL) {
            await initDb();
        }
    });

    afterAll(async () => {
        await pool.end();
    });

    describe('1. Health Check', () => {
        test('GET / - returns welcome message and status 200', async () => {
            const res = await request(app).get('/');
            expect(res.statusCode).toBe(200);
            expect(res.body).toEqual({ message: 'Welcome to the ecommerce API' });
        });
    });

    describe('2. Authentication & Authorization (Task 2.1)', () => {
        test('POST /auth/register - successfully registers a new user (201)', async () => {
            const res = await request(app).post('/auth/register').send({
                full_name: 'Test Buyer',
                username: `buyer_${timestamp}`,
                email: `buyer_${timestamp}@example.com`,
                password: 'password123'
            });

            expect(res.statusCode).toBe(201);
            expect(res.body).toHaveProperty('data');
            expect(res.body.data).toHaveProperty('token');
            expect(res.body.data.user).toHaveProperty('id');
            expect(res.body.data.user.email).toBe(`buyer_${timestamp}@example.com`);
            expect(res.body.data.user).not.toHaveProperty('password');

            authToken = res.body.data.token;
            testUserId = res.body.data.user.id;
        });

        test('POST /auth/register - rejects duplicate email registration (409)', async () => {
            const res = await request(app).post('/auth/register').send({
                full_name: 'Duplicate Person',
                username: `dupe_${timestamp}`,
                email: `buyer_${timestamp}@example.com`,
                password: 'password123'
            });

            expect(res.statusCode).toBe(409);
            expect(res.body).toHaveProperty('error');
            expect(res.body.error.code).toBe('DUPLICATE_EMAIL');
        });

        test('POST /auth/register - rejects invalid input missing fields (400)', async () => {
            const res = await request(app).post('/auth/register').send({
                email: 'notanemail'
            });

            expect(res.statusCode).toBe(400);
            expect(res.body.error.code).toBe('VALIDATION_ERROR');
        });

        test('POST /auth/login - successfully logs in registered user (200)', async () => {
            const res = await request(app).post('/auth/login').send({
                email: `buyer_${timestamp}@example.com`,
                password: 'password123'
            });

            expect(res.statusCode).toBe(200);
            expect(res.body.data).toHaveProperty('token');
            expect(res.body.data.user.email).toBe(`buyer_${timestamp}@example.com`);
        });

        test('POST /auth/login - rejects incorrect password with 401', async () => {
            const res = await request(app).post('/auth/login').send({
                email: `buyer_${timestamp}@example.com`,
                password: 'wrongpassword'
            });

            expect(res.statusCode).toBe(401);
            expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
        });

        test('GET /auth/me - returns user profile with valid Bearer token (200)', async () => {
            const res = await request(app)
                .get('/auth/me')
                .set('Authorization', `Bearer ${authToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.data.id).toBe(testUserId);
            expect(res.body.data.email).toBe(`buyer_${timestamp}@example.com`);
        });

        test('GET /auth/me - rejects request without token (401)', async () => {
            const res = await request(app).get('/auth/me');
            expect(res.statusCode).toBe(401);
            expect(res.body.error.code).toBe('UNAUTHORIZED');
        });

        // Register a second user to test ownership protection
        test('Register second user for ownership check', async () => {
            const res = await request(app).post('/auth/register').send({
                full_name: 'Second Buyer',
                username: `second_${timestamp}`,
                email: `second_${timestamp}@example.com`,
                password: 'password123'
            });
            expect(res.statusCode).toBe(201);
            otherUserToken = res.body.data.token;
        });
    });

    describe('3. Products CRUD & Protected Mutating Endpoints (Week 1 & 2)', () => {
        test('GET /products - public access lists products (200)', async () => {
            const res = await request(app).get('/products?page=1&limit=10');
            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('data');
            expect(Array.isArray(res.body.data)).toBe(true);
        });

        test('POST /products - rejects unauthenticated product creation (401)', async () => {
            const res = await request(app).post('/products').send({
                name: 'Unauthorized Product',
                price: 50.00,
                stock: 10
            });
            expect(res.statusCode).toBe(401);
            expect(res.body.error.code).toBe('UNAUTHORIZED');
        });

        test('POST /products - creates new product with valid auth token (201)', async () => {
            const res = await request(app)
                .post('/products')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    name: `Wireless Keyboard ${timestamp}`,
                    description: 'Low-profile mechanical keyboard',
                    price: 89.99,
                    stock: 15
                });

            expect(res.statusCode).toBe(201);
            expect(res.body).toHaveProperty('product');
            expect(res.body.product.name).toBe(`Wireless Keyboard ${timestamp}`);
            testProductId = res.body.product.id;
        });

        test('GET /products/:id - retrieves product details (200)', async () => {
            const res = await request(app).get(`/products/${testProductId}`);
            expect(res.statusCode).toBe(200);
            expect(Number(res.body.id)).toBe(Number(testProductId));
        });

        test('GET /products/:id - returns 404 for non-existent product', async () => {
            const res = await request(app).get('/products/999999');
            expect(res.statusCode).toBe(404);
        });

        test('PUT /products/:id - updates product with token (200)', async () => {
            const res = await request(app)
                .put(`/products/${testProductId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    price: 79.99,
                    stock: 20
                });

            expect(res.statusCode).toBe(200);
            expect(parseFloat(res.body.product.price)).toBe(79.99);
            expect(res.body.product.stock).toBe(20);
        });
    });

    describe('4. Relationships, Orders & Stock Deduction (Task 2.2)', () => {
        test('POST /orders - rejects unauthenticated order placement (401)', async () => {
            const res = await request(app).post('/orders').send({
                product_id: testProductId,
                quantity: 2
            });
            expect(res.statusCode).toBe(401);
        });

        test('POST /orders - rejects order when quantity exceeds available stock (400)', async () => {
            const res = await request(app)
                .post('/orders')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    product_id: testProductId,
                    quantity: 999
                });

            expect(res.statusCode).toBe(400);
            expect(res.body.error.code).toBe('INSUFFICIENT_STOCK');
        });

        test('POST /orders - places order, deducts stock atomically, and calculates total price (201)', async () => {
            const res = await request(app)
                .post('/orders')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    product_id: testProductId,
                    quantity: 2
                });

            expect(res.statusCode).toBe(201);
            expect(res.body).toHaveProperty('data');
            expect(res.body.data.quantity).toBe(2);
            expect(Number(res.body.data.total_price)).toBeCloseTo(79.99 * 2, 2);
            expect(res.body.data.status).toBe('pending');
            testOrderId = res.body.data.id;

            // Verify stock was decremented in database (20 - 2 = 18)
            const productCheck = await request(app).get(`/products/${testProductId}`);
            expect(productCheck.body.stock).toBe(18);
        });

        test('GET /orders/my-orders - returns list of orders belonging to the authenticated user (200)', async () => {
            const res = await request(app)
                .get('/orders/my-orders')
                .set('Authorization', `Bearer ${authToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('data');
            expect(Array.isArray(res.body.data)).toBe(true);
            expect(res.body.data.length).toBeGreaterThan(0);
            expect(res.body.data[0].id).toBe(testOrderId);
        });

        test('GET /orders/:id - allows owner to fetch order details (200)', async () => {
            const res = await request(app)
                .get(`/orders/${testOrderId}`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.data.id).toBe(testOrderId);
            expect(res.body.data).toHaveProperty('customer_name');
            expect(res.body.data).toHaveProperty('product_name');
        });

        test('GET /orders/:id - rejects access from another user with 403 Forbidden', async () => {
            const res = await request(app)
                .get(`/orders/${testOrderId}`)
                .set('Authorization', `Bearer ${otherUserToken}`);

            expect(res.statusCode).toBe(403);
            expect(res.body.error.code).toBe('FORBIDDEN');
        });

        test('POST /orders/:id/cancel - cancels order and restores inventory stock (200)', async () => {
            const res = await request(app)
                .post(`/orders/${testOrderId}/cancel`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.data.status).toBe('cancelled');

            // Verify stock was restored (18 + 2 = 20)
            const productCheck = await request(app).get(`/products/${testProductId}`);
            expect(productCheck.body.stock).toBe(20);
        });

        test('POST /orders/:id/cancel - prevents non-owner from cancelling someone else\'s order (403)', async () => {
            const res = await request(app)
                .post(`/orders/${testOrderId}/cancel`)
                .set('Authorization', `Bearer ${otherUserToken}`);

            expect(res.statusCode).toBe(403);
            expect(res.body.error.code).toBe('FORBIDDEN');
        });
    });
});
