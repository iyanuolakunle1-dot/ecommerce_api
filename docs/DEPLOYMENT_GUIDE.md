# Production Deployment Guide

This guide details the deployment of the E-Commerce Inventory & Order API to **Render** using a hosted **PostgreSQL** database (Supabase).

---

## 1. Prerequisites

- A GitHub repository with the latest code on `main`.
- A cloud PostgreSQL instance (e.g. Supabase, Render PostgreSQL, or Neon).
- A free account on [Render](https://render.com).

---

## 2. Environment Variables

Configure the following environment variables in your hosting dashboard:

| Variable | Description | Example / Note |
|---|---|---|
| `PORT` | Web server port | Default `3000` (Render provides this automatically) |
| `NODE_ENV` | Application environment | Set to `production` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:password@aws-0-eu-west-1.pooler.supabase.com:5432/postgres` |
| `JWT_SECRET` | Secret key for signing tokens | Minimum 32-character random string |

---

## 3. Render Deployment Steps

1. **Create Web Service**:
   - Log in to your Render dashboard and click **New +** -> **Web Service**.
   - Connect your GitHub repository: `https://github.com/iyanuolakunle1-dot/ecommerce_api`.

2. **Configure Settings**:
   - **Name**: `ecommerce-inventory-api`
   - **Environment**: `Node`
   - **Branch**: `main`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: `Free`

3. **Add Environment Variables**:
   - Navigate to the **Environment** tab.
   - Add `DATABASE_URL`, `JWT_SECRET`, and `NODE_ENV=production`.

4. **Deploy**:
   - Click **Create Web Service**.
   - Render will build dependencies and start the app.
   - The database schema is initialized automatically on startup via `initDb()`.

5. **Verify Deployment**:
   - Visit `https://<your-render-subdomain>.onrender.com/` to see the health check response.
   - Visit `https://<your-render-subdomain>.onrender.com/api-docs/` to view and test interactive Swagger documentation.

---

## 4. Database SSL Handling

Hosted PostgreSQL instances require SSL connections. The API handles this transparently in `src/config/db.js`:
```javascript
const pool = new Pool({
    connectionString,
    ssl: connectionString && !connectionString.includes('localhost') && !connectionString.includes('127.0.0.1')
        ? { rejectUnauthorized: false }
        : false
});
```
This ensures secure, encrypted database communication without self-signed certificate rejection errors.
