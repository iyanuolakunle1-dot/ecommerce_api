# Security & Performance Notes

**Project**: E-Commerce Inventory & Order API  
**Developer**: Iyanu Olakunle  
**Track**: Backend Development — Stage 1  

---

## 1. Security Architecture

### A. Environment Variable Protection & Secret Management
- All sensitive credentials — including `DATABASE_URL`, `JWT_SECRET`, and port configurations — are strictly managed via environment variables and loaded through `dotenv`.
- The `.env` file is excluded in `.gitignore` to prevent secret leakage in version control.
- An `.env.example` file is maintained in the repository root as a clean template for reviewers and contributors.

### B. Input Validation & SQL Injection Prevention
- **Schema Validation**: Request bodies for authentication, product management, and order placement are validated and sanitized using **Joi schemas** (`src/modules/*/validation.js` and `src/middleware/validate.js`). Malformed payloads, negative numbers, missing fields, or invalid types are rejected immediately with structured `400 Bad Request` responses before reaching the database.
- **Parameterized SQL Queries**: All database queries executed through the repository layer utilize PostgreSQL parameter markers (`$1`, `$2`, etc.). No dynamic string interpolation is permitted in SQL strings, completely neutralizing SQL injection vectors.

### C. HTTP Security Headers (Helmet)
- The application incorporates `helmet` middleware in `server.js` to set standard security headers:
  - `X-Content-Type-Options: nosniff`: Prevents MIME-type sniffing.
  - `X-Frame-Options: SAMEORIGIN`: Protects against clickjacking.
  - `Strict-Transport-Security`: Enforces secure HTTPS transport.
  - Removes the default `X-Powered-By: Express` header to avoid disclosing technology stack fingerprints.

### D. Rate Limiting on Authentication Endpoints
- Implemented with `express-rate-limit` on the `/auth` routes (`/auth/register`, `/auth/login`).
- Limits clients to 100 requests per 15-minute sliding window, mitigating automated credential-stuffing and password brute-force attacks.

### E. Password Hashing & Stateless Authentication
- User passwords are encrypted using `bcryptjs` with 10 salt rounds before persistence.
- JWT tokens are signed with HMAC SHA-256 using the server secret key, with a 24-hour expiration window.
- Sensitive user hashes are excluded from all query returns and JSON serializations.

---

## 2. Performance Architecture

### A. Database Indexes on Filtered Fields
To avoid sequential full-table scans ($O(n)$) as records scale, explicit B-Tree indexes are defined on relational foreign keys and high-frequency filtering columns:

```sql
-- Fast category-based product lookups (used in GET /categories/:id/products)
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);

-- Fast customer order history lookups (used in GET /orders/my-orders)
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);

-- Fast join resolution between orders and inventory products
CREATE INDEX IF NOT EXISTS idx_orders_product_id ON orders(product_id);
```

### B. Result Set Pagination
- All collection listing endpoints (`GET /products`, `GET /orders/my-orders`, `GET /orders`) enforce pagination parameters:
  - `page`: default `1`, sanitized to positive integer.
  - `limit`: default `10`, capped at a maximum of `100` to prevent memory exhaustion and excessive payload sizes.
- SQL queries utilize `LIMIT $1 OFFSET $2` parameterized queries alongside count aggregations for pagination metadata.

### C. Database Connection Pooling
- Configured using `pg.Pool` with connection reuse across HTTP requests.
- All transactional queries release acquired pool clients in `finally` blocks, preventing socket leaks under concurrent load.
- Dynamic SSL detection enables secure encrypted connections to cloud databases (Supabase, Render) while accommodating cloud certificate requirements with `rejectUnauthorized: false`.
