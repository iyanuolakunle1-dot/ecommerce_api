# Final Package Case Study & Technical Reflection

**Project Name**: E-Commerce Inventory & Order API  
**Developer**: Iyanu Olakunle  
**Track**: Backend Development — BuildLab Stage 1  
**Repository**: [https://github.com/iyanuolakunle1-dot/ecommerce_api](https://github.com/iyanuolakunle1-dot/ecommerce_api)  
**Release Tag**: `week-3`  

---

## 1. Case Study Overview

### The Problem
Small retail merchants frequently manage catalog inventory and incoming customer orders across manual spreadsheets or disparate chat channels. This leads to critical operational failures:
- **Overselling**: Simultaneous customer orders exceed physical inventory, resulting in cancelled transactions, merchant financial loss, and customer dissatisfaction.
- **Data Inconsistencies**: Manual stock adjustments cause discrepancies between actual warehouse quantities and advertised availability.
- **Untracked Orders**: Lack of relational data tracking obscures which customer purchased which items, preventing reliable order history tracking and returns management.

### The Solution
A production-ready REST API built with Node.js, Express, and PostgreSQL that provides a centralized, secure platform for customer authentication, catalog management, and transactional order fulfillment with atomic stock control.

---

## 2. Relational Data Model

The database model is built around four relational entities designed to enforce data integrity at the database layer:

1. **`users`**:
   - Stores customer and admin records (`id`, `full_name`, `username`, `email`, `password`, `created_at`).
   - Passwords stored as one-way bcrypt hashes (10 salt rounds). Email and username carry unique constraints.
2. **`categories`**:
   - Groups related products (`id`, `name`, `description`, `created_at`).
   - Unique name constraint prevents duplicate groupings.
3. **`products`**:
   - Represents catalog inventory (`id`, `name`, `description`, `price`, `stock`, `category_id`, `created_at`).
   - Monetary values use `NUMERIC(10, 2)` to eliminate floating-point arithmetic rounding errors.
   - Stock is restricted to non-negative integers (`CHECK (stock >= 0)`).
   - Foreign key links to `categories(id)` with `ON DELETE SET NULL`.
4. **`orders`**:
   - Relational bridge linking authenticated users to products (`id`, `user_id`, `product_id`, `quantity`, `total_price`, `status`, `created_at`).
   - Foreign key to `users(id)` with `ON DELETE CASCADE`.
   - Foreign key to `products(id)` with `ON DELETE RESTRICT`, preventing accidental catalog deletion while active orders exist.

---

## 3. System Architecture

The application adopts a **Modular Monolith** pattern organized into domain features (`src/modules/auth`, `src/modules/products`, `src/modules/categories`, `src/modules/orders`). Each module enforces strict four-layer separation of concerns:

```
[ Client Request ]
       │
       ▼
1. Routes Layer          ───► URL mapping, HTTP verbs, auth & validation middleware
       │
       ▼
2. Controller Layer      ───► HTTP request parsing, status codes, uniform JSON envelopes
       │
       ▼
3. Service Layer         ───► Business validation, pricing math, authorization rules
       │
       ▼
4. Repository Layer       ───► Parameterized SQL queries, ACID transactions, row locking
       │
       ▼
[ PostgreSQL Database ]
```

---

## 4. Key Technical Decisions

1. **ACID Transactions with `SELECT ... FOR UPDATE` Row Locking**:
   - *Decision*: During order placement, the database transaction acquires an exclusive row lock on the target product record before checking stock.
   - *Rationale*: Relying on JavaScript-level checks introduces race conditions under concurrent requests. Database-level row locking ensures sequential, atomic execution, guaranteeing that stock can never drop below zero.
2. **Stateless JWT Authentication with Resource Ownership Enforcement**:
   - *Decision*: Signed JWT tokens contain user identifiers verified on each protected request.
   - *Rationale*: Eliminates server-side session memory overhead while enabling strict ownership checks (e.g. `order.user_id !== req.user.id` returns `403 Forbidden`).
3. **Two-Tier Testing Strategy**:
   - *Decision*: Separated test suite into pure isolated unit tests (`tests/unit/`) and end-to-end integration tests (`tests/api.test.js`).
   - *Rationale*: Unit tests provide sub-second feedback for algorithmic business rules, while integration tests verify Express middleware wiring and live PostgreSQL transactions.
4. **Defense-in-Depth Security**:
   - *Decision*: Integrated Helmet HTTP security headers and rate limiting on authentication routes alongside strict Joi schema validation.
   - *Rationale*: Protects the API against common vulnerabilities (MIME sniffing, clickjacking, brute-force credential stuffing, and SQL injection).

---

## 5. System Limitations

1. **Single-Instance Database Connection Pooling**:
   - The application currently relies on a single PostgreSQL connection pool. Sustained traffic bursts exceeding cloud free-tier connection limits could lead to temporary pool starvation.
2. **Synchronous Fulfillment Processing**:
   - Order creation and cancellation execute synchronously within the HTTP request lifecycle. A high-scale production deployment would benefit from asynchronous background workers (e.g., BullMQ/Redis) for decoupled invoice generation and notification dispatch.
3. **In-Memory Rate Limiting**:
   - Rate limiting is currently managed in application memory per node instance. Multi-container deployments would require a shared Redis store to enforce distributed rate limits.

---

## 6. Technical Reflection (3-Week Retrospective)

### What Changed Over Three Weeks
- **Week 1**: Established core modular structure, PostgreSQL schema, and baseline CRUD operations for products.
- **Week 2**: Shifted focus to robustness — adding secure authentication, relational order placement, database transactions, input validation schemas, and structured error handling.
- **Week 3**: Elevated quality, delivery, and hardening — implementing comprehensive unit tests for business rules, interactive OpenAPI Swagger documentation, security headers with Helmet, rate limiting, and deployment configuration.

### What Remains Risky
- **Database Connection Management on Serverless/PaaS Platforms**:
  - Free cloud PostgreSQL tiers enforce tight connection limits. Ensuring connection pool sizing and client release hygiene in `finally` blocks remains critical to prevent connection exhaustion.
- **Inventory Contention on Hot Items**:
  - Extremely popular products subjected to high concurrency could experience transaction serialization delays due to row locks.

### What I Would Do Next
1. **Redis Caching Layer**: Cache catalog listings (`GET /products`) with cache invalidation on catalog mutations to reduce database read load.
2. **Asynchronous Background Processing**: Implement message queues for sending order confirmation emails and generating downloadable PDF invoices asynchronously.
3. **Automated Migration Tooling**: Transition raw DDL schema management to an enterprise migration tool (such as Knex or Prisma Migrate) for versioned database migrations.

---

## 7. Submission Declaration

- **Individual Work**: I declare that this project is my own work completed during the BuildLab Stage 1 Backend Development program.
- **Libraries Used**: Express, pg, bcryptjs, jsonwebtoken, joi, helmet, express-rate-limit, swagger-ui-express, dotenv, cors, nodemon, jest, supertest.
- **Boilerplates Used**: No starter templates or boilerplates were used. The project was initialized from scratch using `npm init` and built according to the modular monolith architectural design described in `/docs`.
- **AI Tool Usage Disclosure**: AI tools (such as ChatGPT/Copilot) were utilized as an assistive programming companion for syntax references, regex pattern lookups, and reviewing test edge cases. All architectural designs, database schemas, business logic implementations, and final code integrations were designed, implemented, and verified independently by me.
