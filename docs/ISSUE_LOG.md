# Week 2 Issue Log

Project: E-Commerce Inventory & Order API  
Developer: Iyanu Olakunle  
Track: Backend Development (BuildLab Stage 1)  

---

## Overview
This issue log documents bugs found, architectural challenges considered, and the solutions implemented during Week 2 (Authentication, Authorisation, Relationships, Validation, and Robustness).

---

### Issue 1: Race Conditions in Concurrent Orders & Negative Inventory Stock
- **Problem**: When two users simultaneously order the last remaining inventory item, both requests read the available stock as valid before updating, resulting in negative stock values and overselling.
- **Options Considered**:
  1. *Application-level JavaScript in-memory locks*: Fragile and ineffective when the server runs in multiple worker processes or instances.
  2. *Database row-level locking with ACID transaction (`FOR UPDATE`)*: Standard SQL solution supported natively by PostgreSQL.
- **Resolution**: Implemented an explicit database transaction in `src/modules/orders/order.repository.js` using `SELECT ... FOR UPDATE` on the product row. The query acquires an exclusive row lock, verifies `stock >= requested_quantity`, deducts the stock, inserts the order, and commits atomically. If insufficient stock is detected, the transaction immediately rolls back and returns `400 Bad Request` with error code `INSUFFICIENT_STOCK`.

---

### Issue 2: Plaintext vs. Structured Error Responses Across Endpoints
- **Problem**: Early error handling returned disparate string messages or uncaught exception stacks (e.g., `res.status(500).send(err.message)`), exposing server internals to API clients.
- **Options Considered**:
  1. Handling errors ad-hoc within each controller `catch` block.
  2. Centralized Express error-handling middleware enforcing a uniform contract.
- **Resolution**: Created a global centralized error handler in `server.js` with the unified contract specified in the rubric:
  ```json
  {
    "error": {
      "code": "ERROR_CODE",
      "message": "Human-readable explanation"
    }
  }
  ```
  All services throw custom errors with `.statusCode` and `.code` properties, guaranteeing clients receive consistent responses without leaked internals.

---

### Issue 3: Insecure Mutation of Catalog Products Without Authentication
- **Problem**: In Week 1, `POST`, `PUT`, and `DELETE` on `/products` were public endpoints so reviewers could test core CRUD without an auth system. Leaving these public allows arbitrary users or scrapers to delete catalog records.
- **Options Considered**:
  1. Relying on an API key header.
  2. Protecting mutating endpoints with standard Bearer JWT authentication while keeping `GET /products` public for catalog browsing.
- **Resolution**: Applied `authenticate` middleware to `POST /products`, `PUT /products/:id`, and `DELETE /products/:id` in `src/modules/products/product.routes.js`. Unauthenticated requests immediately receive `401 Unauthorized` (`code: 'UNAUTHORIZED'`).

---

### Issue 4: Broken Referential Integrity When Cancelling Orders
- **Problem**: When a customer cancels a pending order, simply updating the order status leaves the deducted physical stock missing from the products table, causing inventory count leakage.
- **Options Considered**:
  1. Manually requiring store administrators to adjust stock numbers later.
  2. Automating atomic stock restoration inside a database transaction during cancellation.
- **Resolution**: Created `cancelOrderAndRestoreStock` in `src/modules/orders/order.repository.js`. Within a single transaction, the order is verified, ownership is checked, the order status is set to `'cancelled'`, and the exact quantity is restored (`stock = stock + quantity`) back to the `products` table.

---

### Issue 5: Unauthorized Access to Order Records Across Different Users
- **Problem**: If orders are accessed solely by numeric ID (`GET /orders/:id`), User A could guess the ID of User B's order and inspect their order items and contact details.
- **Options Considered**:
  1. Obfuscating order IDs with UUIDs.
  2. Enforcing explicit ownership checks in the service layer against the verified JWT token (`req.user.id`).
- **Resolution**: Implemented ownership validation in `src/modules/orders/order.service.js`. When fetching or cancelling an order, `order.user_id` is strictly compared with `currentUser.id`. If they do not match, the API immediately responds with `403 Forbidden` (`code: 'FORBIDDEN'`).

---

### Issue 6: Strict Regex Validation Rejecting Realistic Usernames
- **Problem**: The initial Joi registration schema used `.alphanum()` which strictly rejected valid usernames containing underscores (e.g. `ada_lovelace` or `buyer_1792403837`).
- **Options Considered**:
  1. Removing username validation completely.
  2. Updating the schema to support standard alphanumeric strings with underscores using regex `/^[a-zA-Z0-9_]+$/`.
- **Resolution**: Updated `src/modules/auth/auth.validation.js` with regex pattern validation. All valid merchant/customer handles now pass validation seamlessly while still guarding against injection attacks.
