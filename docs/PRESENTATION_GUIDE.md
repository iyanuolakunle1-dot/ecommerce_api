# Week 1 Mentor Presentation Guide (5-Minute Walkthrough)

Project: E-Commerce Inventory & Order API  
Presenter: Iyanu Olakunle  
Track: Backend Development  

---

## 5-Minute Presentation Outline

### Minute 1: Idea and Problem Statement
- **Goal**: Introduce the product, target audience, and core problem.
- **Talking points**:
  - "Hello mentors. My project is an E-Commerce Inventory & Order REST API built for small online store owners."
  - "Small merchants often run into inventory mismatch and accidentally oversell items when using spreadsheets or manual paper notes."
  - "This API provides an automated catalog and inventory management backend with strict status codes and data validation."

### Minute 2: Data Model and Design Decisions (Task 1.1)
- **Goal**: Walk through the ERD and PostgreSQL schema.
- **Talking points**:
  - Show the 3 related entities: `users`, `products` (main entity built in Week 1), and `orders`.
  - Explain relationships: One user places many orders; one order references products.
  - Highlight design decision: Selected PostgreSQL for relational ACID transactions, strict foreign keys, and accurate decimal handling (`NUMERIC(10, 2)`).

### Minute 3: Live Demo — Create and Read Endpoints (Task 1.2)
- **Goal**: Demonstrate functional CRUD and input validation.
- **Action**:
  1. Trigger `POST /products` with valid payload:
     ```bash
     curl -X POST http://localhost:3000/products \
       -H "Content-Type: application/json" \
       -d '{"name": "Mechanical Keyboard", "description": "Tactile switch keyboard", "price": 89.99, "stock": 15}'
     ```
     -> Mentors see `201 Created` with created product object and database ID.
  2. Trigger `POST /products` with missing fields (e.g. missing name):
     ```bash
     curl -X POST http://localhost:3000/products \
       -H "Content-Type: application/json" \
       -d '{"description": "Missing required fields"}'
     ```
     -> Mentors see `400 Bad Request` with descriptive message.
  3. Trigger `GET /products?page=1&limit=10`:
     -> Mentors see `200 OK` with paginated array and total count.

### Minute 4: Live Demo — Single, Update and Delete Endpoints (Task 1.2)
- **Goal**: Demonstrate full lifecycle and error handling.
- **Action**:
  1. Trigger `GET /products/1`:
     -> Shows single item (`200 OK`).
  2. Trigger `GET /products/99999`:
     -> Shows `404 Not Found`.
  3. Trigger `PUT /products/1` with updated price/stock:
     ```bash
     curl -X PUT http://localhost:3000/products/1 \
       -H "Content-Type: application/json" \
       -d '{"price": 79.99, "stock": 20}'
     ```
     -> Shows `200 OK` and updated fields.
  4. Trigger `DELETE /products/1`:
     -> Shows `200 OK` (`"message": "Product deleted successfully"`).

### Minute 5: Summary, Repo Tag, and Feedback Collection
- **Goal**: Highlight repo hygiene and record mentor feedback.
- **Talking points**:
  - "All code is structured cleanly into modules (`src/modules/products`) with separate route, controller, service, and repository layers."
  - "We have a seed script (`npm run seed`), automated tests (`npm test`), sample HTTP requests (`sample.http`), and git tag `week-1`."
  - "Now, I would love to hear your feedback to incorporate into Week 2."

---

## Mentor Feedback Log (To record during presentation)

| Mentor Name | Feedback / Suggestion | Planned Action for Week 2 |
|---|---|---|
| Mentor 1 | *(Record feedback here)* | *(e.g., Add auth or index on product names)* |
| Mentor 2 | *(Record feedback here)* | *(e.g., Refine error response shape)* |
