# E-Commerce REST API (Week 1: Core CRUD)

> A modular monolithic RESTful API built with **Node.js**, **Express**, and **SQLite**. Designed for an e-commerce platform managing product inventories for small merchants.

**Live Deployed URL**: [https://ecommerce-api-6abw.onrender.com](https://ecommerce-api-6abw.onrender.com)  
**GitHub Repository**: [https://github.com/iyanuolakunle1-dot/ecommerce_api](https://github.com/iyanuolakunle1-dot/ecommerce_api)  
**Release Tag**: `week-1`

---

## 📌 Problem & Target User

- **Target User**: Small online retail store owners and independent merchants.
- **Problem Solved**: Small merchants struggle with manual spreadsheets and messy notes, leading to accidental overselling, stockout disputes, and inventory discrepancies.
- **Pain Removed**: Provides a fast, automated API to reliably catalog products, maintain accurate inventory stock counts, and safely execute CRUD operations.
- **Full Week 1 Package**: See [WEEK1_SUBMISSION.md](WEEK1_SUBMISSION.md) for the Idea One-Pager, Work Plan, ERD diagram, and 5-minute presentation script.

---

## 🏛️ Architecture: Modular Monolith

This project adheres to a **modular monolithic architecture** designed for high cohesion, separation of concerns, and effortless future expansion:

```text
ecommerce_stage1/
├── src/
│   ├── config/
│   │   └── db.js                 # Database connection & schema migration manager
│   └── modules/
│       └── products/             # Main Product domain module (Week 1)
│           ├── product.repository.js   # Direct database queries & data access layer
│           ├── product.service.js      # Business rules & input validation layer
│           ├── product.controller.js   # HTTP request parsing & response serialization
│           └── product.routes.js       # Express route definitions
├── tests/
│   └── api.test.js               # Supertest integration tests for Week 1 endpoints
├── .env.example                  # Environment configuration template
├── ecommerce.sqlite              # Zero-setup local SQLite database
├── package.json                  # Dependencies & scripts
├── sample.http                   # Executable REST client requests
├── seed.js                       # Dummy test data seeder
├── server.js                     # Monolith application entry point
└── WEEK1_SUBMISSION.md           # Formal Week 1 submission deliverable document
```

---

## 🗄️ Entities & Data Model (Week 1 Design)

The 3-week design includes 3 related entities:

1. **Users (`users`)**: Merchant & customer accounts (Planned for Week 2).
2. **Products (`products`)**: **Main entity built in Week 1** — catalog items, descriptions, prices, and stock counts.
3. **Orders (`orders`)**: Relational junction connecting users and products (Planned for Week 2).

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** (v18+)
- **Zero external database installation required**: Runs entirely on local SQLite (`ecommerce.sqlite`).

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Create or verify your `.env` file:
```env
PORT=3000
```

### 4. Seed Dummy Data
Populate the database with sample products:
```bash
node seed.js
```

### 5. Start the Server
```bash
# Production mode
node server.js

# Development mode (with live reload)
npx nodemon server.js
```
The server will start listening at `http://localhost:3000`.

### 6. Run Automated Tests
Execute the automated test suite verifying all CRUD operations and HTTP status codes (`201`, `200`, `400`, `404`):
```bash
npm test
```

---

## 📖 Week 1 Core CRUD Endpoints (`/products`)

| Method | Endpoint | Purpose | Request Body | Response Status Codes |
|---|---|---|---|---|
| `GET` | `/` | API status & welcome check | None | `200 OK` |
| `POST` | `/products` | Create a new product | `{"name": "Mouse", "price": 29.99, "stock": 20}` | `201 Created`<br>`400 Bad Request` |
| `GET` | `/products?page=1&limit=10` | List products with pagination | None | `200 OK` |
| `GET` | `/products/:id` | Get single product by ID | None | `200 OK`<br>`404 Not Found` |
| `PUT` | `/products/:id` | Update product details | `{"price": 24.99, "stock": 18}` | `200 OK`<br>`400 Bad Request`<br>`404 Not Found` |
| `DELETE` | `/products/:id` | Delete product by ID | None | `200 OK`<br>`404 Not Found` |

---

## 🧪 Sample Testing Requests

You can execute requests using [sample.http](sample.http) (VS Code REST Client) or via `curl`:

```bash
# 1. Create a product (201 Created)
curl -X POST http://localhost:3000/products \
  -H "Content-Type: application/json" \
  -d '{"name": "Wireless Mouse", "description": "Ergonomic 2.4GHz", "price": 29.99, "stock": 20}'

# 2. Validation failure (400 Bad Request)
curl -X POST http://localhost:3000/products \
  -H "Content-Type: application/json" \
  -d '{"description": "Missing name and price"}'

# 3. Get all products (200 OK)
curl -X GET "http://localhost:3000/products?page=1&limit=10"

# 4. Get single product by ID (200 OK)
curl -X GET http://localhost:3000/products/1

# 5. Non-existent product (404 Not Found)
curl -X GET http://localhost:3000/products/9999

# 6. Update product (200 OK)
curl -X PUT http://localhost:3000/products/1 \
  -H "Content-Type: application/json" \
  -d '{"price": 24.99, "stock": 18}'

# 7. Delete product (200 OK)
curl -X DELETE http://localhost:3000/products/1
```