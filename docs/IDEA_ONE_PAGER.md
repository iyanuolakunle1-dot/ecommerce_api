# E-Commerce Inventory & Order API

Track: Backend Development   Stack: JavaScript, Node.js, Express, PostgreSQL

Target user: Small online store owners and independent merchants managing their own product catalog and customer orders.

Problem: Small retailers often track inventory and orders with messy spreadsheets or manual paper notes. This leads to stock discrepancies, accidental overselling of out-of-stock products, and untracked sales records.

Entities:
- Users (`users`): Store admins and customers (ID, full name, username, email, hashed password, created timestamp).
- Products (`products`): Catalog items (ID, name, description, price, stock count, created timestamp). Main entity built for Week 1.
- Orders (`orders`): Relational bridge recording purchases (ID, user foreign key, product foreign key, quantity, total price, status, created timestamp).

Core flow:
1. Store owner creates a product in catalog: `POST /products`
2. Customer or merchant views available stock: `GET /products`
3. Merchant updates price or restocks inventory: `PUT /products/:id`
4. (Planned for Week 2) Customer places an order: `POST /orders` -> deducts product stock

In scope:
- Full CRUD operations for products catalog (Week 1).
- Strict schema validation and correct HTTP status codes (200, 201, 400, 404).
- Relational data model with foreign key constraints in PostgreSQL.
- User authentication and role/ownership checks (Week 2).
- Order placement and relational integrity (Week 2).

Out of scope:
- Payment gateway integration (Stripe/PayPal).
- Real-time chat or push notifications.
- Image or file upload handling (external S3 storage).
- Complex multi-vendor marketplace functionality.

Top 3 risks:
1. Inventory overselling: Concurrent orders might request more items than are physically in stock.
   - Mitigation: Enforce strict database validation and transactional stock checks before order completion.
2. Production database connectivity & SSL errors: Connecting hosted Node.js instances to cloud PostgreSQL can fail due to SSL configuration differences.
   - Mitigation: Configure standard connection pooling in `pg` with dynamic SSL handling for cloud hosts.
3. Feature creep: Attempting checkout workflows and payment APIs within the 3-week timeframe.
   - Mitigation: Restrict feature scope strictly to core catalog management, authenticated access, and basic order processing.

---

Resources:
- GitHub Repository: https://github.com/iyanuolakunle1-dot/ecommerce_api
- Postman Collection: https://olakunleiyanu993-6589025.postman.co/workspace/olakunle-iyanu's-Workspace~87bc85c7-48f4-4bfa-8b46-9fb1827a98a4/collection/56179105-f0169917-8156-432b-a24f-3d7aade8b556?action=share&source=copy-link&creator=56179105
