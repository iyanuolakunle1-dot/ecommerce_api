const request = require('supertest');
const app = require('../server');
const { initDb, pool } = require('../src/config/db');

let productId;

describe('Week 1 Core CRUD Endpoints: Products Entity', () => {
    beforeAll(async () => {
        if (process.env.DATABASE_URL) {
            await initDb();
        }
    });

    afterAll(async () => {
        await pool.end();
    });

    test('GET / - returns welcome message and status 200', async () => {
        const res = await request(app).get('/');
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({ message: 'Welcome to the ecommerce API' });
    });

    test('POST /products - fails with 400 when required fields are missing', async () => {
        const res = await request(app).post('/products').send({
            description: 'Missing name and price'
        });
        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('message');
    });

    test('POST /products - creates new product with 201 Created', async () => {
        const res = await request(app).post('/products').send({
            name: 'Ergonomic Desk Mat',
            description: 'Large smooth felt desk mat',
            price: 24.99,
            stock: 40
        });
        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty('product');
        expect(res.body.product).toHaveProperty('id');
        expect(res.body.product.name).toBe('Ergonomic Desk Mat');
        productId = res.body.product.id;
    });

    test('GET /products - returns paginated product list with 200 OK', async () => {
        const res = await request(app).get('/products?page=1&limit=10');
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('data');
        expect(Array.isArray(res.body.data)).toBe(true);
        expect(res.body).toHaveProperty('total');
    });

    test('GET /products/:id - returns single product with 200 OK', async () => {
        const res = await request(app).get(`/products/${productId}`);
        expect(res.statusCode).toBe(200);
        expect(Number(res.body.id)).toBe(Number(productId));
    });

    test('GET /products/:id - returns 404 when product is not found', async () => {
        const res = await request(app).get('/products/999999');
        expect(res.statusCode).toBe(404);
        expect(res.body).toHaveProperty('message', 'Product not found');
    });

    test('PUT /products/:id - updates product with 200 OK', async () => {
        const res = await request(app).put(`/products/${productId}`).send({
            price: 29.99,
            stock: 35
        });
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('message', 'Product updated successfully');
        expect(parseFloat(res.body.product.price)).toBe(29.99);
    });

    test('PUT /products/:id - returns 404 when updating non-existent product', async () => {
        const res = await request(app).put('/products/999999').send({
            price: 50.00
        });
        expect(res.statusCode).toBe(404);
    });

    test('DELETE /products/:id - deletes product with 200 OK', async () => {
        const res = await request(app).delete(`/products/${productId}`);
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('message', 'Product deleted successfully');
    });

    test('DELETE /products/:id - returns 404 when deleting non-existent product', async () => {
        const res = await request(app).delete('/products/999999');
        expect(res.statusCode).toBe(404);
    });
});
