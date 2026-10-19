# Week 2 Update Note — BuildLab Stage 1

**Student Name**: Iyanu Olakunle  
**Track**: Backend Development  
**Product Idea**: E-Commerce Inventory & Order API  
**Week**: Week 2 (Auth and Robustness)  
**Public Repository**: [https://github.com/iyanuolakunle1-dot/ecommerce_api](https://github.com/iyanuolakunle1-dot/ecommerce_api)  
**Release Tag**: `week-2`  

---

## 1. Delivered Tasks

- **Task 2.1 — Authentication and Authorisation**:
  - Implemented user sign-up (`POST /auth/register`) and login (`POST /auth/login`) with `bcryptjs` password hashing (salt rounds = 10).
  - Implemented JWT token generation with 24-hour expiration and verification middleware (`src/middleware/auth.js`).
  - Added user profile retrieval (`GET /auth/me`).
  - Protected catalog mutations (`POST /products`, `PUT /products/:id`, `DELETE /products/:id`) and all order operations with `401 Unauthorized` for missing/invalid tokens.
  - Implemented strict ownership checks returning `403 Forbidden` if a user attempts to view or cancel an order belonging to another customer.

- **Task 2.2 — Relationships, Validation, and Error Handling**:
  - Implemented the 1:N relational bridge between `users`, `products`, and `orders`:
    - `POST /orders`: Places an order, checks stock availability, deducts inventory, and records transaction details.
    - `GET /orders/my-orders`: Fetches all orders belonging to the authenticated customer.
    - `GET /orders/:id`: Fetches detailed order information including joined product details with ownership verification.
    - `POST /orders/:id/cancel`: Cancels an order and automatically restores stock back to inventory inside an ACID transaction.
    - `PUT /orders/:id/status`: Updates fulfillment status (`pending`, `confirmed`, `shipped`, `delivered`, `cancelled`).
  - Implemented input validation across all endpoints using Joi schemas (`src/middleware/validate.js`).
  - Enforced a uniform error format `{ "error": { "code": "...", "message": "..." } }` with a centralized Express error handler.
  - Implemented 6 documented issue log entries in `docs/ISSUE_LOG.md`.

---

## 2. Changed After Feedback

| Week 1 Feedback / Assessment Point | Action Taken in Week 2 |
|---|---|
| **Ensure all endpoints are protected from unauthorized mutations** | Applied `authenticate` middleware to mutating product endpoints (`POST`, `PUT`, `DELETE /products`) and all order routes. |
| **Validate all incoming request bodies** | Added Joi validation schemas for user registration, user login, order placement, and status updates, returning structured `400 Bad Request` messages. |
| **Prevent invalid order quantities from breaking inventory** | Handled stock validation atomically using database row locking (`FOR UPDATE`) within PostgreSQL transactions. |
| **Return consistent error envelopes across all endpoints** | Standardized all error responses to `{ "error": { "code": "...", "message": "..." } }`. |

---

## 3. Key Technical Decisions

1. **Database Row Locking (`FOR UPDATE`) for Inventory Management**:
   - Rather than relying on fragile application-level checks, PostgreSQL transactions lock the product row during order placement, completely preventing race conditions and overselling when concurrent requests arrive.
2. **Modular Monolithic Layering**:
   - Divided the project into domain modules (`src/modules/auth`, `src/modules/products`, `src/modules/orders`). Each module encapsulates its own routing, controller logic, business validation service, and data repository queries.
3. **Stateless JWT Authentication with Ownership Enforcement**:
   - Stored customer IDs inside signed JWT tokens. When queries for sensitive resources like orders are executed, the token ID is matched against the database foreign key, cleanly enforcing `403 Forbidden` if access is attempted by a different user.

---

## 4. Blockers / Risks

- **Concurrent Connections on Free PostgreSQL Tiers**: Free cloud database pools have strict client limits.
  - *Mitigation*: Used a properly configured `pg.Pool` that releases clients promptly in `finally` blocks.

---

## 5. References and Sources

- **PostgreSQL Documentation** — `FOR UPDATE` row locking and transaction isolation levels.
- **Joi Documentation** — Schema validation API, custom regex rules, and error formatting.
- **JWT.io / jsonwebtoken README** — Token signing options and expiry configuration.
- **Express.js Docs** — Centralized error handling middleware pattern.
- **Stack Overflow / Node.js community** — Debugging `pg.Pool` connection release edge cases.
