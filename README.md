# E-Commerce Inventory & Order API (Week 2)

A clean, robust modular monolithic REST API built with Node.js, Express, and PostgreSQL for small retail merchants to catalog products, authenticate users, and manage orders with atomic stock inventory control.

- **GitHub Repository**: [https://github.com/iyanuolakunle1-dot/ecommerce_api](https://github.com/iyanuolakunle1-dot/ecommerce_api)
- **Live Deployed API**: [https://ecommerce-api-6abw.onrender.com](https://ecommerce-api-6abw.onrender.com)
- **Release Tag**: `week-2`

---

## 📚 Project Documentation

All design and submission documents are organized in the [`/docs`](docs) directory:

- [Idea One-Pager](docs/IDEA_ONE_PAGER.md): Product problem, target user, 3 entities, core user flow, and scope.
- [One-Page Work Plan](docs/WORK_PLAN.md): 3-week deliverables roadmap and risk mitigation strategies.
- [Task 1.1: Data Model & API Spec](docs/DATA_MODEL_AND_API_SPEC.md): PostgreSQL schema, ERD diagram, and endpoint contracts.
- [Task 2 Issue Log](docs/ISSUE_LOG.md): 6 detailed entries documenting bugs found, options considered, and how they were solved.
- [Weekly Update Notes](docs/WEEK2_UPDATE_NOTE.md): Formatted submission note for Week 2.

---

## 🏛️ Architecture & Clean Modular Structure

The codebase follows a **modular monolithic architecture** where each business domain owns its own repository queries, business logic service, input validation, and controller handlers:

```text
ecommerce_stage1/
├── docs/                      # Submission documentation & specs
│   ├── IDEA_ONE_PAGER.md
│   ├── WORK_PLAN.md
│   ├── DATA_MODEL_AND_API_SPEC.md
│   ├── ISSUE_LOG.md           # Week 2 Issue Log (6 entries)
│   ├── WEEK1_UPDATE_NOTE.md
│   └── WEEK2_UPDATE_NOTE.md
├── src/
│   ├── config/
│   │   └── db.js              # PostgreSQL pool & automated DDL initialization
│   ├── middleware/
│   │   ├── auth.js            # JWT Bearer token verification (401 response)
│   │   └── validate.js        # Generic Joi request validation middleware
│   └── modules/
│       ├── auth/              # Authentication & User Management (Task 2.1)
│       │   ├── auth.controller.js
│       │   ├── auth.repository.js
│       │   ├── auth.routes.js
│       │   ├── auth.service.js
│       │   └── auth.validation.js
│       ├── products/          # Products Catalog (Main Entity)
│       │   ├── product.controller.js
│       │   ├── product.repository.js
│       │   ├── product.routes.js
│       │   └── product.service.js
│       └── orders/            # Relationships & Stock Tracking (Task 2.2)
│           ├── order.controller.js
│           ├── order.repository.js
│           ├── order.routes.js
│           ├── order.service.js
│           └── order.validation.js
├── tests/
│   └── api.test.js            # 23 Automated Integration Tests (Supertest)
├── .env.example               # Environment variables template
├── package.json
├── sample.http                # Executable REST client requests (Week 2 collection)
├── schema.sql                 # PostgreSQL relational schema
├── seed.js                    # Database seeder (users, products, orders)
└── server.js                  # Central application entry point & error handler
```

---

## 🗄️ Relational Data Model (3 Entities)

1. **`users`**: Customer and merchant accounts (`id`, `full_name`, `username`, `email`, `password` hashed with bcrypt, `created_at`).
2. **`products`**: Inventory catalog items (`id`, `name`, `description`, `price`, `stock`, `created_at`).
3. **`orders`**: Relational junction connecting users and products (`id`, `user_id` FK, `product_id` FK, `quantity`, `total_price`, `status`, `created_at`).

---

## 🚀 Local Setup Guide

### 1. Prerequisites
- **Node.js** (v18 or higher)
- **PostgreSQL** (local instance or cloud database such as Supabase / Render / Neon)

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Fill in your credentials:
```env
PORT=3000
DATABASE_URL=postgresql://postgres:password@localhost:5432/ecommerce_db
JWT_SECRET=your_jwt_secret_key_here
```

### 4. Seed Database
Run the seed script to create initial test records for users, catalog products, and sample orders:
```bash
npm run seed
```

### 5. Start the Server
```bash
# Production mode
npm start

# Development mode (with live reload)
npm run dev
```
The server will start listening at `http://localhost:3000`.

### 6. Run Automated Tests
Run the single-command automated test runner covering all 23 integration tests across Auth, Products CRUD, Orders, Stock Deduction, and Failure Modes:
```bash
npm test
```

---

## 📖 API Endpoints Reference

### 1. Authentication (`/auth`)
| Method | Endpoint | Description | Auth Required | Status Codes |
|---|---|---|---|---|
| `POST` | `/auth/register` | Register new user (hashes password with bcrypt) | No | `201 Created`, `400 Bad Request`, `409 Conflict` |
| `POST` | `/auth/login` | Login and receive JWT Bearer token | No | `200 OK`, `400 Bad Request`, `401 Unauthorized` |
| `GET` | `/auth/me` | Fetch authenticated user profile | **Yes** | `200 OK`, `401 Unauthorized` |

### 2. Products Catalog (`/products`)
| Method | Endpoint | Description | Auth Required | Status Codes |
|---|---|---|---|---|
| `GET` | `/products?page=1&limit=10` | List products (paginated) | No | `200 OK` |
| `GET` | `/products/:id` | Get single product by ID | No | `200 OK`, `404 Not Found` |
| `POST` | `/products` | Create a new catalog item | **Yes** | `201 Created`, `400 Bad Request`, `401 Unauthorized` |
| `PUT` | `/products/:id` | Update product details / stock | **Yes** | `200 OK`, `400 Bad Request`, `401 Unauthorized`, `404 Not Found` |
| `DELETE` | `/products/:id` | Delete product from catalog | **Yes** | `200 OK`, `401 Unauthorized`, `404 Not Found` |

### 3. Orders & Relationships (`/orders`)
| Method | Endpoint | Description | Auth Required | Status Codes |
|---|---|---|---|---|
| `POST` | `/orders` | Place an order (atomic transaction: verifies & deducts stock) | **Yes** | `201 Created`, `400 Bad Request` (Insufficient Stock), `401 Unauthorized` |
| `GET` | `/orders/my-orders` | Fetch logged-in user's orders (1:N relationship) | **Yes** | `200 OK`, `401 Unauthorized` |
| `GET` | `/orders/:id` | Get order details (ownership protected) | **Yes** | `200 OK`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found` |
| `PUT` | `/orders/:id/status` | Update order status | **Yes** | `200 OK`, `400 Bad Request`, `401 Unauthorized` |
| `POST` | `/orders/:id/cancel` | Cancel order & restore inventory stock | **Yes** | `200 OK`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found` |

---

## 🔒 Safe Error Handling & Edge Cases

All endpoints return a uniform error structure without exposing stack traces or internals:
```json
{
  "error": {
    "code": "INSUFFICIENT_STOCK",
    "message": "Insufficient stock. Only 3 units available."
  }
}
```

- **Stock Depletion**: Handled with `SELECT ... FOR UPDATE` inside PostgreSQL transactions.
- **Ownership Check**: Validated against `req.user.id`; returns `403 Forbidden` if a user attempts to access another customer's orders.
- **Input Validation**: Joi schemas sanitize and validate every incoming payload.