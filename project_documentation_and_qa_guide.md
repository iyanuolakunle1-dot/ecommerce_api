# BUILDLAB STAGE 1: BACKEND DEVELOPMENT
## E-Commerce REST API — Project Documentation & Mentor Q&A Guide

---

## Part 1: Project Overview & Architecture

### 1. The Problem & Target User
- **Target User**: Small online retail store owners and independent merchants.
- **Problem Solved**: Replaces manual spreadsheets with an automated backend that safely tracks product inventory, prevents overselling out-of-stock items, and records customer purchases.
- **Live Deployed API**: `https://ecommerce-api-6abw.onrender.com`
- **GitHub Repository**: `https://github.com/iyanuolakunle1-dot/ecommerce_api`

---

### 2. The 3 Related Entities (Data Model)

1. **Users (`users`)**
   - `id` (INTEGER PRIMARY KEY)
   - `full_name` (TEXT)
   - `username` (TEXT UNIQUE)
   - `email` (TEXT UNIQUE)
   - `password` (TEXT — hashed with bcrypt)
   - `created_at` (DATETIME)

2. **Products (`products`)**
   - `id` (INTEGER PRIMARY KEY)
   - `name` (TEXT)
   - `description` (TEXT)
   - `price` (REAL)
   - `stock` (INTEGER)
   - `created_at` (DATETIME)

3. **Orders (`orders`)** — *Relational Junction*
   - `id` (INTEGER PRIMARY KEY)
   - `user_id` (INTEGER — Foreign Key to `users.id`)
   - `product_id` (INTEGER — Foreign Key to `products.id`)
   - `quantity` (INTEGER)
   - `total_price` (REAL)
   - `status` (TEXT — default 'pending')
   - `created_at` (DATETIME)

---

### 3. Tech Stack & Choices
- **Node.js + Express**: Fast, lightweight, standard industry framework for REST APIs.
- **SQLite (`ecommerce.sqlite`)**: A fully self-contained local database. No cloud sign-ups, no external accounts, runs on any laptop out of the box (meeting the mentor's explicit requirement).
- **Security**: 
  - `bcryptjs`: Password hashing with salt rounds = 10 (passwords never stored or returned in plain text).
  - `jsonwebtoken`: Stateless authentication with 1-day expiration tokens.
- **Automated Testing**: Jest + Supertest (16 integration tests covering registration, login, stock validation, and orders).

---

### 4. Endpoints Summary Table

| Method | Endpoint | Auth Required? | Purpose |
|---|---|:---:|---|
| `GET` | `/` | No | Health check & welcome message |
| `POST` | `/users/register` | No | Creates new account (hashes password) |
| `POST` | `/users/login` | No | Returns JWT token |
| `GET` | `/users` | No | Lists paginated users |
| `GET` | `/users/:id` | No | Gets single user profile |
| `PUT` | `/users/:id` | **Yes (Bearer)** | Updates user profile |
| `DELETE` | `/users/:id` | **Yes (Bearer)** | Deletes user profile |
| `GET` | `/products` | No | Lists all products (paginated) |
| `GET` | `/products/:id` | No | Gets single product details |
| `POST` | `/products` | **Yes (Bearer)** | Adds a new product |
| `PUT` | `/products/:id` | **Yes (Bearer)** | Updates price or stock |
| `DELETE` | `/products/:id` | **Yes (Bearer)** | Deletes a product |
| `POST` | `/orders` | **Yes (Bearer)** | Places order (checks stock & deducts) |
| `GET` | `/orders` | No | Lists all orders (joins user & product info) |
| `GET` | `/orders/:id` | No | Gets order details by ID |
| `PUT` | `/orders/:id` | **Yes (Bearer)** | Updates status (`pending`, `paid`, `shipped`) |
| `DELETE` | `/orders/:id` | **Yes (Bearer)** | Cancels/deletes order |

---

## Part 2: Mentor Defense — Questions & Answers

### Q1: "What problem does your API solve, and who is it for?"
> **Answer**: "It is an inventory and order management API built for small online store merchants. It gives them an automated backend to manage products, prevent overselling by automatically validating and deducting stock, and track customer orders."

---

### Q2: "Walk me through how your code is organized."
> **Answer**: "I kept the architecture clean and modular:
> - `server.js`: The entry point that sets up Express, CORS, JSON parsing, and connects the routes.
> - `db.js`: Initializes the SQLite database and sets up the tables for users, products, and orders.
> - `middleware/auth.js`: A middleware that verifies the JWT token from the `Authorization` header on protected routes.
> - `routes/`: Contains three clean route files: `userRoutes.js`, `productRoutes.js`, and `orderRoutes.js`."

---

### Q3: "Why did you use SQLite instead of PostgreSQL or Supabase?"
> **Answer**: "The project guidelines explicitly stated not to rely on third-party cloud services like Supabase, and to use a local database that runs without signups. Because SQLite stores data in a local file (`ecommerce.sqlite`), any mentor or assessor can clone the repo and run it instantly with zero configuration, while still getting full relational SQL support like foreign keys."

---

### Q4: "How do your 3 entities relate to each other?"
> **Answer**: "I have three normalized tables:
> - `users`: stores customer details.
> - `products`: stores catalog items, prices, and stock counts.
> - `orders`: acts as the relational bridge. It has a `user_id` foreign key referencing `users(id)` and a `product_id` foreign key referencing `products(id)`."

---

### Q5: "How does your order logic prevent selling out-of-stock items?"
> **Answer**: "When someone calls `POST /orders`, the API first queries the `products` table to check if `stock >= quantity`. If there isn't enough stock, it returns `400 Bad Request` ('Not enough stock available'). If valid, it saves the order and immediately runs an `UPDATE products SET stock = stock - quantity` to keep inventory accurate."

---

### Q6: "How do you handle password security and authentication?"
> **Answer**: "Passwords are never saved in plain text. On registration, I hash the password with `bcryptjs` using 10 salt rounds. On login, `bcrypt.compare()` verifies the credentials. If valid, the server signs a JWT token containing the user ID with a 1-day expiration. Protected routes verify this token using the `verifyToken` middleware."

---

### Q7: "How did you test your API?"
> **Answer**: "I wrote automated integration tests using Jest and Supertest in `tests/api.test.js`. It runs 16 tests covering user registration, failed logins with wrong passwords, token protection, stock deduction on orders, and status updates. All 16 tests pass completely."

---

### Q8: "Why didn't you add Categories or Reviews?"
> **Answer**: "The rubric explicitly stated that a small API built well scores higher than an overly complex one. I kept the scope tightly focused on perfecting the 3 core entities, relational integrity, and stock validation. Categories can easily be added in future iterations as a new table linked to `products`."
