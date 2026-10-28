# Testing Strategy & Coverage Note

**Project**: E-Commerce Inventory & Order API  
**Developer**: Iyanu Olakunle  
**Track**: Backend Development — Stage 1  

---

## 1. Testing Architecture & Approach

This project implements a **two-tier testing strategy** using **Jest** and **Supertest**:

1. **Isolated Unit Tests (`tests/unit/businessRules.test.js`)**:
   - Focus: Pure domain logic, pricing calculations, inventory availability limits, input sanitization, and access control policies.
   - Execution: Fully isolated from external systems and databases. Uses Jest function spies/mocks (`jest.spyOn`) where repository methods are referenced.
   - Speed: Runs in milliseconds.

2. **End-to-End Integration Tests (`tests/api.test.js`)**:
   - Focus: Full HTTP request/response lifecycles through Express routing, middleware (auth, validation, error handler), and real PostgreSQL transactions.
   - Execution: Runs sequentially (`--runInBand`) to preserve relational state and transactional assertions across user registration, catalog creation, order placement, and cancellation.

### Single-Command Test Execution
```bash
# Run all test suites
npm test

# Run isolated business rules unit tests only
npm run test:unit

# Run test coverage analysis
npm run test:coverage
```

### Test Database Isolation
The database connector in `src/config/db.js` inspects `NODE_ENV`:
```javascript
const connectionString = (process.env.NODE_ENV === 'test' && process.env.DATABASE_URL_TEST)
    ? process.env.DATABASE_URL_TEST
    : process.env.DATABASE_URL;
```
When running in automated CI environments or local test setups, developers can define `DATABASE_URL_TEST` in `.env` to execute tests against a completely isolated test database without impacting development or production records.

---

## 2. What Is Tested

### Authentication & Authorization (Task 2.1)
- User registration (`POST /auth/register`):
  - Returns `201 Created` with JWT token and user profile.
  - Ensures password hash is never returned in response payloads.
  - Rejects duplicate email registration with `409 Conflict`.
  - Rejects malformed payloads with missing fields with `400 Bad Request`.
- User login (`POST /auth/login`):
  - Valid credentials return `200 OK` and valid JWT token.
  - Incorrect password returns `401 Unauthorized`.
  - Non-existent user email returns `401 Unauthorized`.
- Profile verification (`GET /auth/me`):
  - Valid Bearer token retrieves user details.
  - Missing or invalid token returns `401 Unauthorized`.

### Categories CRUD (Relational Entity 4)
- Public access to category listing (`200 OK`).
- Unauthenticated creation rejected with `401 Unauthorized`.
- Authenticated creation with valid payload returns `201 Created`.
- Duplicate category name rejected with `409 Conflict`.
- Category retrieval by valid ID (`200 OK`) and non-existent ID (`404 Not Found`).
- Category update with auth token (`200 OK`).

### Products Catalog CRUD (Main Entity)
- Public paginated product catalog retrieval (`GET /products` returns `200 OK` with pagination metadata).
- Category filtering (`GET /categories/:id/products`).
- Protected product mutations: unauthenticated `POST`, `PUT`, `DELETE` return `401 Unauthorized`.
- Price validation: negative numbers or non-numeric strings return `400 Bad Request`.
- Stock validation: negative numbers return `400 Bad Request`.
- Non-existent product lookups return `404 Not Found`.

### Orders, Transactions & Inventory Management (Task 2.2)
- Atomic order placement (`POST /orders`):
  - Calculates total price accurately with 2-decimal money precision.
  - Rejects orders when requested quantity exceeds available physical stock (`400 Bad Request`).
  - Atomically deducts inventory stock inside a PostgreSQL transaction (`SELECT FOR UPDATE`).
- Ownership protection & access control:
  - `GET /orders/my-orders`: Returns only orders belonging to the authenticated customer.
  - `GET /orders/:id`: Owner can view order details (`200 OK`).
  - `GET /orders/:id`: Cross-user access returns `403 Forbidden`.
- Order cancellation (`POST /orders/:id/cancel`):
  - Owner cancellation restores inventory stock back to the products catalog atomically.
  - Non-owner cancellation attempt returns `403 Forbidden`.
- Failure status codes verified across all modules: `200`, `201`, `400`, `401`, `403`, `404`, `409`.

---

## 3. What Is NOT Tested & Why

To maintain an honest engineering perspective, the following edge areas are not covered in automated tests:

1. **Extreme Database Pool Exhaustion under Massive Concurrency**:
   - *Why*: Free-tier cloud PostgreSQL instances (e.g. Supabase connection poolers) enforce strict maximum client limits. Bombarding the remote pooler with hundreds of parallel concurrent connections in CI causes network socket drops unrelated to application correctness. Concurrency safety is instead proven and guaranteed architecturally using PostgreSQL row locking (`SELECT FOR UPDATE`) within ACID transactions.
2. **Third-Party Payment Gateway Integration**:
   - *Why*: Payment webhooks (e.g. Stripe, Paystack) were explicitly documented as out of scope in the Week 1 Idea One-Pager to prioritize core transactional integrity.
3. **Automated Rate Limit Threshold Blocking in Integration Tests**:
   - *Why*: Rate limiting is explicitly bypassed during automated test runs (`skip: () => process.env.NODE_ENV === 'test'`) so that 40+ rapid HTTP requests in the test suite do not trigger false positive 429 errors against the test runner. The rate limiter is verified manually and configured with standard Express middleware.
4. **PDF Invoice Binary Stream Verification**:
   - *Why*: PDF document generation using PDFKit was tested manually during development; parsing binary PDF streams in automated integration assertions introduces brittle test dependencies with minimal payoff for core REST API reliability.

---

## 4. Test Summary

| Metric | Result |
|---|---|
| Total Test Suites | 2 passed, 2 total |
| Total Tests | **47 passed, 0 failed (100% green)** |
| Execution Time | ~20 seconds |
| Code Coverage | ~80% Statements / ~80% Functions across all modules |
