# E-Commerce Inventory & Order API (Week 1)

A modular REST API built with Node.js, Express, and PostgreSQL for small retail merchants to catalog products and manage inventory.

- **GitHub Repository**: [https://github.com/iyanuolakunle1-dot/ecommerce_api](https://github.com/iyanuolakunle1-dot/ecommerce_api)
- **Live Deployed API**: [https://ecommerce-api-6abw.onrender.com](https://ecommerce-api-6abw.onrender.com)
- **Release Tag**: `week-1`

---

## Documentation

All Week 1 submission deliverables are organized in the [`/docs`](docs) directory:

- [Idea One-Pager](docs/IDEA_ONE_PAGER.md): Problem, target user, 3 entities, core flow, scope, and top 3 risks.
- [One-Page Work Plan](docs/WORK_PLAN.md): 3-week deliverables roadmap and risk mitigations.
- [Task 1.1: Data Model & API Spec](docs/DATA_MODEL_AND_API_SPEC.md): PostgreSQL schemas, ERD diagram, and endpoint contracts.
- [Weekly Update Note](docs/WEEK1_UPDATE_NOTE.md): Formatted submission note.

---

## Tech Stack & Architecture

- **Runtime**: Node.js (v18+)
- **Framework**: Express.js
- **Database**: PostgreSQL (via `pg` connection pool)
- **Architecture**: Modular Monolith

```text
ecommerce_stage1/
├── docs/                      # Week 1 documentation & submission files
│   ├── IDEA_ONE_PAGER.md
│   ├── WORK_PLAN.md
│   ├── DATA_MODEL_AND_API_SPEC.md
│   ├── PRESENTATION_GUIDE.md
│   └── WEEK1_UPDATE_NOTE.md
├── src/
│   ├── config/
│   │   └── db.js              # PostgreSQL pool & table initialization
│   └── modules/
│       └── products/          # Products domain module (Week 1 Core Entity)
│           ├── product.repository.js  # SQL queries (pg)
│           ├── product.service.js     # Validation & business logic
│           ├── product.controller.js  # HTTP request/response handlers
│           └── product.routes.js      # Express route definitions
├── tests/
│   └── api.test.js            # Integration test suite (Supertest)
├── .env.example               # Environment variables template
├── package.json
├── sample.http                # Executable HTTP requests
├── schema.sql                 # PostgreSQL DDL table definitions
├── seed.js                    # Dummy catalog data seeder
└── server.js                  # Application entry point
```

---

## Local Setup Guide

### 1. Prerequisites
- Node.js (v18 or higher)
- PostgreSQL (local instance or cloud database such as Supabase / Render / Neon)

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Update `DATABASE_URL` with your PostgreSQL credentials:
```env
PORT=3000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/ecommerce_db
```

### 4. Create Tables & Seed Data
You can initialize the schema using `schema.sql` or run the seed script which initializes the table and inserts sample records:
```bash
# Seed sample catalog items
npm run seed
```

### 5. Start the Server
```bash
# Production mode
npm start

# Development mode (auto-reload)
npm run dev
```
The server will start listening at `http://localhost:3000`.

### 6. Run Tests
```bash
npm test
```

---

## Core CRUD Endpoints (`/products`)

| Method | Endpoint | Purpose | Status Codes |
|---|---|---|---|
| `GET` | `/` | API Health & Welcome | `200 OK` |
| `POST` | `/products` | Create a new product | `201 Created`, `400 Bad Request` |
| `GET` | `/products?page=1&limit=10` | List products (paginated) | `200 OK` |
| `GET` | `/products/:id` | Get single product by ID | `200 OK`, `400 Bad Request`, `404 Not Found` |
| `PUT` | `/products/:id` | Update product details | `200 OK`, `400 Bad Request`, `404 Not Found` |
| `DELETE` | `/products/:id` | Delete product by ID | `200 OK`, `404 Not Found` |

---

## Sample Testing Requests

Test using [sample.http](sample.http) (REST Client / Postman) or `curl`:

```bash
# 1. Create a product (201 Created)
curl -X POST http://localhost:3000/products \
  -H "Content-Type: application/json" \
  -d '{"name": "Wireless Mouse", "description": "Ergonomic rechargeable mouse", "price": 29.50, "stock": 50}'

# 2. Validation failure (400 Bad Request)
curl -X POST http://localhost:3000/products \
  -H "Content-Type: application/json" \
  -d '{"description": "Missing name and price"}'

# 3. List all products (200 OK)
curl -X GET "http://localhost:3000/products?page=1&limit=10"

# 4. Get single product by ID (200 OK)
curl -X GET http://localhost:3000/products/1

# 5. Non-existent product (404 Not Found)
curl -X GET http://localhost:3000/products/99999

# 6. Update product (200 OK)
curl -X PUT http://localhost:3000/products/1 \
  -H "Content-Type: application/json" \
  -d '{"price": 24.99, "stock": 45}'

# 7. Delete product (200 OK)
curl -X DELETE http://localhost:3000/products/1
```