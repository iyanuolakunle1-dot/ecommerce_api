Week 1 - Iyanu Olakunle - Backend - E-Commerce Inventory & Order API

Delivered:
- Idea One-Pager & Work Plan: [docs/IDEA_ONE_PAGER.md](docs/IDEA_ONE_PAGER.md) and [docs/WORK_PLAN.md](docs/WORK_PLAN.md)
- Task 1.1 Data Model (ERD) & REST API Spec: [docs/DATA_MODEL_AND_API_SPEC.md](docs/DATA_MODEL_AND_API_SPEC.md)
- Task 1.2 Core CRUD Endpoints for Products entity: [src/modules/products](src/modules/products)
- Database schema and PostgreSQL connection pool: [schema.sql](schema.sql) and [src/config/db.js](src/config/db.js)
- Database seed script and sample requests: [seed.js](seed.js) and [sample.http](sample.http)
- Automated test suite for CRUD operations: [tests/api.test.js](tests/api.test.js)
- Repository release tag: `week-1`

Changed after feedback:
- Initial project setup: Finalized database choice as PostgreSQL to provide production-grade relational data types and foreign key constraints across `users`, `products`, and `orders`.

Key technical decisions:
- PostgreSQL with connection pooling (`pg.Pool`): Configured dynamic SSL settings so the API connects seamlessly to both local PostgreSQL and hosted cloud providers like Render and Supabase.
- Layered module structure: Separated products domain into repository (SQL execution), service (business logic & validation), and controller (HTTP response handling) to keep codebase organized and easily testable.
- Input validation: Implemented explicit type and value checks on name, non-negative price, and non-negative stock returning status `400 Bad Request` prior to database queries.

Blockers / risks:
- Risk of overselling when orders entity is implemented in Week 2. Will mitigate using SQL transactions and conditional stock checks.
- Managing database migrations cleanly between local development and cloud hosting as entities grow in Week 2 and Week 3.

AI and sources used:
- Official Express and node-pg documentation for connection pool and SSL configuration.
- Markdown table and mermaid ERD syntax guides.
