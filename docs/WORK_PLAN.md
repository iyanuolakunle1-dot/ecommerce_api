# One-Page Work Plan

Project: E-Commerce Inventory & Order API  
Developer: Iyanu Olakunle  
Track: Backend Development  

---

## 3-Week Deliverables Roadmap

### Week 1 — Design and Build (Current Week)
- [x] Product Idea One-Pager and 3-week work plan.
- [x] Task 1.1 Data Model: ERD diagram with 3 related entities (`users`, `products`, `orders`).
- [x] Task 1.1 API Design: Complete REST specification with methods, paths, request/response bodies, and HTTP status codes.
- [x] Task 1.2 Core CRUD Endpoints: Working endpoints for the main entity (`products`) using Node.js, Express, and PostgreSQL.
- [x] Seed script with dummy catalog records.
- [x] Automated integration tests covering status codes (`201`, `200`, `400`, `404`).
- [x] Git repository setup, documentation in `/docs`, and release tag `week-1`.
- [x] 5-minute mentor walkthrough presentation guide.

### Week 2 — Auth and Robustness
- [x] Task 2.1 Authentication & Authorisation:
  - User registration (`POST /auth/register`) and login (`POST /auth/login`).
  - Password hashing with `bcryptjs`.
  - JWT token generation and authentication middleware.
  - Ownership protection: only authenticated users can modify products/orders.
  - Return `401 Unauthorized` and `403 Forbidden` accurately.
- [x] Task 2.2 Relationships, Validation & Error Handling:
  - Relational endpoints linking users, products, and orders (`POST /orders`, `GET /orders/my-orders`, `GET /orders/:id`, `POST /orders/:id/cancel`).
  - Input validation schemas with Joi.
  - Global centralized error handler with consistent error format: `{ "error": { "code": "...", "message": "..." } }`.
  - Edge cases: stock deduction, prevention of negative inventory, non-existent foreign keys, stock restoration on cancellation.
- [x] Maintain issue log with 6 resolved issues and bug fixes in `docs/ISSUE_LOG.md`.
- [x] Git release tag `week-2`.

### Week 3 — Quality and Delivery
- [x] Task 3.1 Testing:
  - Unit tests for business rules (price, inventory availability).
  - Integration tests for auth, CRUD, and failure modes (`400`, `401`, `403`, `404`).
  - Single-command test runner (`npm test`) with coverage notes (`npm run test:coverage`).
- [x] Task 3.2 Documentation, Security & Deployment:
  - Exported Postman collection and complete OpenAPI / Swagger documentation (`/api-docs`).
  - Security headers (Helmet), rate limiting, CORS configuration, and environment variable protection.
  - Production deployment guide for Render with live PostgreSQL connection.
  - 5-minute recorded video walkthrough script and technical reflection.
- [x] Git release tag `week-3` and final package submission.

---

## Top 3 Risks & Mitigation Strategies

| Risk | Impact | Mitigation Strategy |
|---|---|---|
| **1. Inventory Race Conditions** | High: Multiple concurrent orders could oversell items beyond available physical stock. | Use database transactions and check `stock >= requested_quantity` during order creation before committing. |
| **2. Production PostgreSQL SSL & Connectivity** | Medium: Cloud providers (e.g. Render, Supabase) require specific SSL configurations that can break default Node.js database connections. | Configure `pg.Pool` with flexible SSL options (`rejectUnauthorized: false` for hosted environments) and verify with health-check scripts. |
| **3. Scope Creep on Payments & File Storage** | High: Implementing image uploads or live payment APIs would jeopardize timely delivery of the core backend requirements. | Explicitly keep image hosting and payment gateways out of scope; focus entirely on clean data modeling, auth, and relational API robustness. |
