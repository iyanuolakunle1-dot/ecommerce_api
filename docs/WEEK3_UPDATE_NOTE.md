# Week 3 Update Note — BuildLab Stage 1

**Student Name**: Iyanu Olakunle  
**Track**: Backend Development  
**Product Idea**: E-Commerce Inventory & Order API  
**Week**: Week 3 (Quality and Delivery)  
**Public Repository**: [https://github.com/iyanuolakunle1-dot/ecommerce_api](https://github.com/iyanuolakunle1-dot/ecommerce_api)  
**Release Tag**: `week-3`  

---

## 1. Delivered Tasks

- **Task 3.1 — Testing & Quality Assurance**:
  - Implemented unit tests (`tests/unit/businessRules.test.js`) testing pure business logic isolated from database dependencies:
    - Product price constraints (rejection of negative, non-numeric, and missing values).
    - Stock quantity non-negativity and integer checks.
    - Two-decimal monetary calculations (`price * quantity`).
    - Inventory availability verification and stock deduction calculations.
    - Input validation schema tests with Joi for orders and status updates.
    - Ownership and access control checks returning `403 Forbidden` for cross-user operations.
  - Integration test suite (`tests/api.test.js`) covering full HTTP flows, status codes (`200`, `201`, `400`, `401`, `403`, `404`, `409`), and health/docs endpoints.
  - Added single-command test runners in `package.json`:
    - `npm test`: Runs all unit and integration test suites.
    - `npm run test:unit`: Fast runner for isolated business rules.
    - `npm run test:coverage`: Generates code coverage metrics across modules.
  - All 47 tests passing (100% green).

- **Task 3.2 — Documentation, Security & Deployment**:
  - **OpenAPI / Swagger 3.0 Documentation**:
    - Created OpenAPI 3.0 specification in `src/docs/swagger.json`.
    - Integrated `swagger-ui-express` served interactively at `GET /api-docs` with JWT Bearer authentication support.
  - **Postman Collection**:
    - Exported complete, structured Postman collection with environments and variables in `docs/ecommerce_api.postman_collection.json`.
  - **Production Security Hardening**:
    - Configured `helmet` middleware in `server.js` to enforce secure HTTP headers (X-Content-Type-Options, Frameguard, HSTS, etc.).
    - Implemented API rate limiting with `express-rate-limit` on sensitive authentication endpoints to mitigate brute-force attempts.
    - Secured CORS configuration and validated that no secrets or credentials are leaked in production responses.
  - **Deployment Configuration**:
    - Documented deployment steps in `docs/DEPLOYMENT_GUIDE.md` for deploying on Render with Supabase PostgreSQL connection pooling and SSL encryption handling.
  - **5-Minute Presentation Script**:
    - Prepared detailed walkthrough script in `presentation_notes_week3.txt` for the mentor demo and technical reflection.

---

## 2. Changed After Feedback

| Week 2 Feedback / Assessment Point | Action Taken in Week 3 |
|---|---|
| **Separate business rule unit tests from network-dependent integration tests** | Created dedicated unit tests in `tests/unit/businessRules.test.js` that mock data layers and run quickly without remote DB network latency. |
| **Provide interactive API documentation** | Embedded Swagger UI at `/api-docs` so any reviewer can test authentication and endpoints directly in the browser. |
| **Apply defense-in-depth security headers** | Integrated `helmet` and IP rate-limiting on auth routes to prevent brute-force attacks. |
| **Export ready-to-test Postman collection** | Created `docs/ecommerce_api.postman_collection.json` containing organized folders, headers, and request bodies. |

---

## 3. Key Technical Decisions

1. **Dual Testing Strategy (Unit + Integration)**:
   - Split testing into isolated unit tests for pure domain logic (pricing math, stock limits, state validation) and comprehensive integration tests using Supertest against a live PostgreSQL instance. This ensures both algorithmic correctness and relational data integrity.
2. **Interactive OpenAPI Integration with Swagger UI**:
   - Serving the Swagger UI directly through Express at `/api-docs` provides instant interactive access for reviewers and frontend consumers without requiring external software installations.
3. **Application Security Layering**:
   - Layered `helmet` HTTP headers and route-level rate limiting on top of existing bcrypt hashing and JWT middleware, hardening the backend against common web vulnerabilities (XSS, clickjacking, brute-force).

---

## 4. Blockers / Risks & Resolutions

- **Remote Database Latency during Integration Runs**:
  - Remote cloud PostgreSQL instances over public network connections occasionally exceeded Jest's default 5-second timeout.
  - *Resolution*: Configured Jest timeout to 20 seconds for integration suites while keeping unit tests sub-second.

---

## 5. Summary of Overall Deliverables

- 4 relational entities: `users`, `products`, `categories`, `orders`.
- 4-layer modular monolith architecture (Routes -> Controllers -> Services -> Repositories).
- Robust transactional stock management preventing overselling and race conditions (`SELECT FOR UPDATE`).
- Interactive Swagger documentation at `/api-docs` and Postman collection.
- 47 passing automated tests with test coverage reporting.
