# NovaSuite — Full Documentation

This is the single, consolidated reference for the NovaSuite platform. It combines the
project's architecture, database, authentication, authorization, multi-tenancy, API,
inventory, POS, HR, realtime, migration, operation, and deployment documentation into one file.

**Table of contents**

1. [Overview](#1-overview)
2. [Architecture](#2-architecture)
3. [Database](#3-database)
4. [Authentication](#4-authentication)
5. [Authorization](#5-authorization)
6. [Multi-Tenancy](#6-multi-tenancy)
7. [API](#7-api)
8. [Inventory](#8-inventory)
9. [Point of Sale (POS)](#9-point-of-sale-pos)
10. [Human Resources (HR)](#10-human-resources-hr)
11. [Real-time](#11-real-time)
12. [Migration](#12-migration)
13. [Operating the app](#13-operating-the-app)
14. [Deployment](#14-deployment)

---

## 1. Overview

NovaSuite is a multi-tenant SaaS platform for **POS, inventory, HR, sales, purchasing, and reporting**.
It is designed as a **platform**, not a single-business app: multiple independent businesses can use the
same deployment, and each business's data is fully isolated (**Business A can never see Business B**).

### Feature highlights

- Modern, fast POS with barcode support, split payments, and real-time inventory updates.
- Store-aware inventory with movements, transfers, low-stock alerts, and valuations.
- HR module: employees, attendance, leave, and payroll.
- Multi-store support under one business.
- Sales/purchases/customers/suppliers management.
- Reports & analytics with powerful filters.
- Granular role-based access control (RBAC).

---

## 2. Architecture

### 2.1 Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, Turbopack) |
| UI | React 19, TypeScript (strict), Tailwind CSS v4 + shadcn/ui |
| State | Redux Toolkit (client state) |
| Database | MongoDB + Mongoose |
| Auth | jose (JWT) + bcryptjs (password hashing) |

### 2.2 Directory layout

```
app/(landing)      Marketing site
app/(auth)         Login / register / forgot-password
app/(platform)     Authenticated app shell + feature pages
app/api/**         Tenant-scoped REST endpoints
components/ui      shadcn/ui primitives
components/layout  Sidebar, top nav, app shell, auth provider
components/logo    Reusable logo component (uses /logo.png)
lib                db, auth, validators, api-response, audit, utils
models             Mongoose models (all tenant-scoped via businessId)
store              Redux Toolkit slices + provider
types              Shared types + permission constants
config             App constants (hero image, logo, pagination, currencies)
scripts            Seed / clear data
docs               Documentation
```

### 2.3 Route groups & layouts

- `(landing)/page.tsx` → public SaaS landing page (uses `logo.png`, `hero.png`, `herobackground.jpg`).
- `(auth)/*` → unauthenticated auth pages (login, register, forgot-password).
- `(platform)/layout.tsx` → `AuthProvider` + `AppShell` (sidebar + top nav + content).

### 2.4 Middleware / Proxy

`proxy.ts` guards routes by the session cookie:

- Redirects unauthenticated visitors from platform pages to `/login`.
- Redirects authenticated visitors browsing public pages to `/dashboard`.
- Returns `401` for authenticated API calls with no session cookie.
- **Never intercepts static assets** (images, fonts, CSS, JS) — the matcher excludes file extensions.

> **Note (Next 16):** `middleware.ts` was renamed to `proxy.ts` exporting the `proxy` function.

### 2.5 Services layer

Feature pages call REST endpoints under `/app/api/**`. Each route:

1. Resolves the authenticated context (`getAuthContext`).
2. Checks the required permission server-side.
3. Runs a query scoped by `businessId` / `storeId`.
4. Returns JSON with a consistent envelope (`{ success, data, error, pagination }`).

### 2.6 Initial architecture analysis (historical)

The repo began as a minimal single-page inventory prototype (Next.js + raw MongoDB driver, no auth,
no models, no tenancy). The build converted it into the full multi-tenant platform while preserving the
Tailwind v4 + shadcn/ui styling foundation, the App Router structure, the `@/*` alias, and the
`MONGODB_URI` environment naming. The legacy prototype components (`SearchBar`, `AddItems`, `ItemList`)
are no longer referenced by any live page and can be removed in a cleanup phase.

---

## 3. Database

MongoDB via Mongoose. All models are in `models/`.

### 3.1 Connection

`lib/db.ts` exposes `connectDB()`, a cached Mongoose connection using `MONGODB_URI`.

### 3.2 Models

Each tenant-scoped model includes a `businessId` field and is indexed by it.

| Model | Key fields | Indexes |
|-------|-----------|---------|
| User | name, email (unique), password (hashed, hidden) | email unique |
| Business | name, currency, timezone, taxRate | status |
| Membership | userId + businessId (unique), roleId, storeIds | user+business unique |
| Session | token (unique), userId, businessId, expiresAt (TTL) | token unique |
| Role | businessId + name (unique), permissions[] | businessId |
| Store | businessId + code (unique), manager | businessId |
| Category | businessId, name | businessId |
| Product | businessId + sku (unique), variants[] | text on name/sku/barcode |
| Inventory | businessId+storeId+productId+variantSku (unique), quantity | businessId+store |
| InventoryMovement | type, quantity, reference | businessId, type |
| Customer | name, phone, email | text search |
| Supplier | name, company | text search |
| Sale | receiptNumber, items[], payments[], totals | businessId+store+createdAt |
| Purchase | purchaseOrderNumber, items[] | businessId+store |
| Department | businessId + name (unique) | businessId |
| Employee | businessId + employeeNumber (unique) | businessId |
| Attendance | businessId+employeeId+date (unique) | businessId |
| Leave | leaveType, status | businessId |
| Payroll | payPeriod, baseSalary, allowances, deductions, netPay | businessId |
| Expense | amount, categoryId, status | businessId+store+date |
| AuditLog | businessId, userId, action, resource | businessId+createdAt |
| Notification | businessId, userId, type, read | businessId+user |

### 3.3 Tenant uniqueness

Uniqueness is scoped per tenant (e.g. `Product` SKU is unique within a `businessId`, `Store` code within
a `businessId`, `Employee` number within a `businessId`) via compound unique indexes.

### 3.4 Money

Financial fields are stored as numbers. In-memory calculations use integer-safe rounding. The server
recalculates all totals; values from the client are never trusted.

### 3.5 Concurrency

Inventory quantity changes use atomic `findOneAndUpdate` / `$inc` operations (see [§8 Inventory](#8-inventory))
rather than read-modify-write, to prevent double-sale corruption.

---

## 4. Authentication

Secure, server-side authentication via cookie session + signed JWT + DB session record.

### 4.1 Flow

1. **Register** (`POST /api/auth/register`): creates a `User` (bcrypt-hashed password), a `Business`,
   a default `Store`, a "Business Owner" `Role`, and an active `Membership`.
2. **Login** (`POST /api/auth/login`): verifies credentials, picks the first active membership,
   invalidates old sessions, creates a `Session` record and sets the `nova_session` cookie.
3. **Session cookie**: `nova_session` is `httpOnly`, `sameSite=lax`, `secure` in production,
   signed by `AUTH_SECRET`.
4. **Context** (`GET /api/auth/me`): `getAuthContext()` validates the JWT, checks the DB session expiry,
   loads the user + membership + role, returns user + permissions + allowed store IDs.
5. **Logout** (`POST /api/auth/logout`): deletes the server session and clears the cookie.

### 4.2 Password security

- Hashed with bcrypt (12 rounds) — plaintext is never stored.
- Passwords are `select: false` by default; only login selects the hashed value to compare.

### 4.3 Environment

- `AUTH_SECRET` — required, signs JWTs. Must be a long random secret in production.
- `MONGODB_URI` — database connection.

### 4.4 Security properties

- Password never sent/logged.
- The active business is always derived server-side from the session, never from the client.
- Sessions have a TTL (7 days) and expiry is re-checked on every request.

### 4.5 Email verification / password reset

Foundation is present in the UI (`forgot-password`) and an email abstraction is outlined.
Actual SMTP delivery and tokenized reset links are **not yet wired** (see "Not yet implemented").
The UI shows a graceful message.

---

## 5. Authorization

Permission-based authorization. Roles are business-scoped and map to a list of permission strings.
Authorization is enforced **server-side** on every API route; the frontend only filters navigation/UI for UX.

### 5.1 Permissions

Defined in `types/index.ts` as `PERMISSIONS`. Examples:

```
products.view | create | update | delete
inventory.view | adjust | transfer
sales.view | create | update | refund
purchases.view | create | receive
customers.view | create | update
suppliers.view | create | update
stores.view | create | update | delete
users.view | invite | manage
roles.view | manage
employees.view | create | update
attendance.view | manage
leave.view | manage
payroll.view | manage
expenses.view | create | manage
reports.view | export
settings.view | manage
audit_logs.view
notifications.view
pos.use
```

### 5.2 Default roles

Business Owner, Admin, Manager, Cashier, Inventory Manager, HR Manager, Employee — each seeded with a set
of permissions. Roles are stored per business in the `roles` collection.

### 5.3 Enforcement pattern

Every route must:

1. Resolve `getAuthContext()` (returns the user, `businessId`, and `permissions[]`).
2. Check the required permission with `hasPermission(ctx.permissions, "x.y")`.
3. Return `403 Forbidden` if missing.

Permissions are never inferred from role names alone; they are checked against the role's stored array.

### 5.4 Role & membership model

- `Membership.userId + businessId + roleId + storeIds`
- A user belongs to a business via membership; effective permissions come from the membership's role.
- `storeIds` on the membership restrict which stores a user may operate in.

---

## 6. Multi-Tenancy

The platform hosts many independent businesses. **Business A must never see Business B data.**

### 6.1 Core principle

- Every tenant-scoped entity has a `businessId`.
- The active tenant is derived **server-side** from the authenticated session/membership.
- The client never supplies a `tenantId`/`businessId` for authorization purposes.

### 6.2 How the tenant is resolved

`getAuthContext()`:

1. Reads the signed session cookie.
2. Loads the `Session` (contains `businessId`).
3. Loads the user's active `Membership` for that business.
4. Returns `{ user, businessId, membershipId, roleId, permissions, storeIds }`.

All subsequent queries use `ctx.businessId` from this context.

### 6.3 Tenant-safe query patterns

```
// Safe
Product.find({ businessId: ctx.businessId })

// UNSAFE / forbidden
Product.find({})                       // cross-tenant leak
Product.findById(clientProvidedId)     // IDOR unless also filtered by businessId
```

Resource lookups by ID always include the tenant scope, e.g.:

```
Product.findOne({ _id: id, businessId: ctx.businessId })
```

### 6.4 Store scoping

`storeId` further scopes data where relevant (inventory, sales, purchases, expenses). Users are limited to
stores present in their membership's `storeIds`.

### 6.5 Tests / verification

The canonical test: register Business A and Business B; create a product under A; authenticate as B; attempt
to access A's product — the request **must** fail (404 or 403). This applies across all sensitive resources.

---

## 7. API

All endpoints return a consistent envelope:

```json
{ "success": true, "data": ..., "pagination": { "page", "limit", "total", "totalPages" } }
```
or
```json
{ "success": false, "error": "message" }
```

### 7.1 Authentication endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/register` | Create account + business + membership |
| POST | `/api/auth/login` | Log in, set session |
| POST | `/api/auth/logout` | End session, clear cookie |
| GET | `/api/auth/me` | Current auth context (user, permissions, stores) |

### 7.2 Tenant resources (all require auth + matching permission)

| Method | Path | Permission |
|--------|------|-----------|
| GET/POST | `/api/products` (+ `/api/products/[id]`) | products.view / products.create |
| GET/POST | `/api/categories` | categories.view / categories.manage |
| GET/POST | `/api/inventory` | inventory.view / inventory.adjust |
| GET/POST | `/api/sales` ; POST `/api/sales/create` | sales.view / sales.create |
| GET/POST | `/api/purchases` | purchases.view / purchases.create |
| GET/POST | `/api/customers` | customers.view / customers.create |
| GET/POST | `/api/suppliers` | suppliers.view / suppliers.create |
| GET/POST | `/api/stores` | stores.view / stores.create |
| GET/POST | `/api/employees` | employees.view / employees.create |
| GET/POST | `/api/departments` | employees.view / employees.create |
| GET/POST | `/api/attendance` | attendance.view / attendance.manage |
| GET/POST | `/api/leave` | leave.view / leave.manage |
| GET/POST | `/api/payroll` | payroll.view / payroll.manage |
| GET/POST | `/api/expenses` | expenses.view / expenses.create |
| GET | `/api/reports/dashboard` | any authenticated user |
| GET | `/api/audit-logs` | audit_logs.view |
| GET | `/api/notifications` | (own notifications) |
| GET/POST | `/api/roles` | roles.view / roles.manage |
| GET | `/api/users` | users.view |

### 7.3 List query params

- `page`, `limit` (pagination, capped at 100)
- `search` (text search where supported)
- resource-specific filters: `storeId`, `status`, `categoryId`, `departmentId`, `date`, `lowStock`, etc.

### 7.4 Sale creation (`POST /api/sales/create`)

The server recalcs subtotal, tax, and total from product data and received quantity/prices. It rejects a
sale whose received payment total does not match the computed total, ensuring money integrity.

### 7.5 Error handling

Routes never leak stack traces, MongoDB internals, or secrets. User-facing errors are returned in the
`error` field with appropriate HTTP status (400/401/403/404/500).

---

## 8. Inventory

Real, store-aware inventory with an auditable movement ledger.

### 8.1 Position model

Inventory is keyed by `businessId + storeId + productId (+ variantSku)`:

```
Product + Store ====> Inventory position (quantity, reserved, incoming)
```

Products are not limited to a single global `product.stock`; each store maintains its own position.

### 8.2 Inventory movements

Every stock change writes an `InventoryMovement` record with a `type`:

```
PURCHASE_RECEIVED, SALE, SALE_RETURN, ADJUSTMENT,
TRANSFER_OUT, TRANSFER_IN, DAMAGE, EXPIRY, OPENING_BALANCE
```

Each movement stores: business, store, product, variantSku, quantity (signed), type, reference, user, and
timestamp — providing full traceability of why stock changed and by whom.

### 8.3 Concurrency

Stock changes use atomic DB operations (`findOneAndUpdate` / `$inc`) rather than read → subtract → write.
This prevents two cashiers selling the final unit from corrupting stock. Sales deduct inventory server-side
within the sale creation flow.

### 8.4 Low stock

`inventory.view` supports a `lowStock=true` filter; the dashboard aggregates product inventory where
`quantity <= product.minimumStock`.

### 8.5 Not yet implemented

- Full store-to-store transfer workflow (API foundation via TRANSFER_OUT / TRANSFER_IN exists).
- Expiry / damage multi-step workflows.
- Incoming (purchase) stock reservation pipelines.

---

## 9. Point of Sale (POS)

Located at `/pos`. Responsive layout: product grid on the left, cart on the right.

### 9.1 Current capabilities

- Browse/search products (fetched from `/api/products`, tenant + permission scoped).
- Add items to cart with quantity controls.
- Per-line and cart-level totals (subtotal, tax, total) computed in the UI.
- Checkout flow posts to `POST /api/sales/create`, which:
  - Recalculates totals server-side from product data.
  - Verifies received payments match the sale total.
  - Creates the `Sale`, decrements inventory via an atomic `$inc`, and writes a `SALE` `InventoryMovement`.

### 9.2 Payment

`POST /api/sales/create` accepts an array of payments (`method`, `amount`). Methods: cash, card,
bank_transfer, mobile, other. Split payment is supported structurally.

### 9.3 Not yet implemented

- Barcode-hardware intake focus flow.
- Receipt printing / PDF generation.
- Hold-sale persistence (cart is client-side for now).
- Offline mode.

---

## 10. Human Resources (HR)

HR module includes Employees, Departments, Attendance, Leave, and Payroll.

### 10.1 Employees

- Scoped by business; `employeeNumber` unique per business.
- Fields: names, contact, hire date, department, position, employment type/status, base salary, emergency contact.
- Sensitive HR fields are gated behind `employees.view/create/update` permissions.

### 10.2 Departments

- Business-scoped departments with optional manager and description.

### 10.3 Attendance

- Records per employee + date (unique). Status: present, absent, late, early_leave, holiday, leave.
- `POST /api/attendance` upserts by employee+date (check-in/out supported).

### 10.4 Leave

- Leave requests with type, date range, reason, status (pending/approved/rejected/cancelled).
- Approval/notes tracked. `leave.manage` controls who can approve.

### 10.5 Payroll

- Flexible pay-period records: base salary, allowances, deductions, gross, net.
- **No hardcoded country tax law**; gross/net computation is simple (gross = base + allowances;
  net = gross − deductions), ready for a future flexible tax-rules layer.

### 10.6 Not yet implemented

- Full leave-balance accrual engine.
- Biometric / device / mobile attendance integration hooks.
- Payslip generation / PDFs.

---

## 11. Real-time

Real-time is designed as a modular event architecture for future delivery (WebSockets/SSE).

### 11.1 Conceptual events

```
SALE_CREATED, SALE_REFUNDED, INVENTORY_CHANGED, STOCK_TRANSFER_CREATED,
STOCK_TRANSFER_COMPLETED, LOW_STOCK, USER_INVITED, LEAVE_REQUESTED,
LEAVE_APPROVED, PAYROLL_APPROVED
```

### 11.2 Current state

- **Notifications** are stored server-side (`Notification` model) and exposed via `GET /api/notifications`.
- **Audit logs** are written on key actions (`AuditLog`) via `createAuditLog()`.
- **Realtime push (WebSocket/SSE) is not yet implemented.** Nothing broadcasts events yet; the taxonomy
  above is the target contract.

### 11.3 Tenancy

Any future real-time delivery MUST be tenant-aware. Messages scoped to a business are only delivered to that
business's connected clients; cross-business broadcasts are forbidden.

---

## 12. Migration

### 12.1 Existing data

The original prototype stored arbitrary documents in an `inventory.data` collection
(fields: `name`, `category`, `price`, `quantity`, `description`, `stockStatus`). This collection is
**not deleted**.

### 12.2 Strategy

The new application introduces a fully typed, tenant-scoped schema. There was no production data to
preserve from the prototype. If legacy prototype documents must be imported:

1. Create/identify a default `Business` and a default `Store`, plus an owner `User` and `Membership`.
2. Map each legacy document to a `Product` with `businessId` = default business, and a default store
   `Inventory` position with an `OPENING_BALANCE` movement.
3. Do this via a one-time script; the old `inventory.data` collection can then be archived or dropped.

### 12.3 Seed data (dev)

`npm run seed` creates demo tenant "Demo Retail", two stores, five demo users, roles, products, inventory,
customers, suppliers, employees, sales, expenses, and notifications. `npm run clear-seed` removes all seed
collections.

Seed accounts (all password `Password123!`): `owner@demoretail.com`, `manager@demoretail.com`,
`cashier@demoretail.com`, `inventory@demoretail.com`, `hr@demoretail.com`.

### 12.4 Safety

Migration never silently destroys existing data. Deletions only happen through explicit scripts
(`clear-seed.mjs`).

---

## 13. Operating the app

### 13.1 Prerequisites

- **Node.js 20+** (project targets 24.x; 20+ works)
- **MongoDB** — MongoDB Atlas (cloud) or a self-hosted server

### 13.2 First-time setup

```bash
npm install
cp .env.example .env        # then edit .env with real values
```

`.env.example`:

```
MONGODB_URI="mongodb+srv://USER:PASS@cluster.mongodb.net/?appName=... "
AUTH_SECRET="<random 64-char hex>"
```

> `AUTH_SECRET` signs login sessions. **Never** commit it. Changing it logs everyone out.

### 13.3 Development

```bash
npm run dev
```

Open http://localhost:3000. The first person to register becomes that business's **Owner**.

Seed demo data (optional, local dev only):

```bash
npm run seed         # create "Demo Retail" tenant + 5 demo users
npm run clear-seed   # remove demo data
```

### 13.4 Production

```bash
npm run build
npm start            # listens on http://localhost:3000
```

Best handled by a process manager.

### 13.5 Process managers

**PM2:**
```bash
npm install -g pm2
npm run build
pm2 start npm --name novasuite -- start
pm2 save
pm2 startup
```

**systemd** (`/etc/systemd/system/novasuite.service`):
```ini
[Unit]
Description=NovaSuite
After=network.target
[Service]
Type=simple
User=www-data
WorkingDirectory=/opt/novasuite
ExecStart=/usr/bin/npm start
Environment=NODE_ENV=production
Restart=on-failure
RestartSec=10
[Install]
WantedBy=multi-user.target
```
```bash
sudo systemctl daemon-reload && sudo systemctl enable --now novasuite
journalctl -u novasuite -f
```

### 13.6 Backups

MongoDB data is your business data. Back it up regularly.

- **Atlas:** enable automated backups, or `mongodump --uri "$MONGODB_URI" --out ./backup-$(date +%F)`.
- **Self-hosted:** periodic `mongodump` + off-site copy.

Also back up `.env` (securely) — it is not part of the database.

### 13.7 Common operations

| Task | How |
|------|-----|
| Deploy new code | `git pull`, `npm install`, `npm run build`, restart service |
| Rotate auth secret | change `AUTH_SECRET`, restart — everyone re-logs in |
| Add a new business | they register → fully isolated tenant |
| Check logs | `pm2 logs novasuite` or `journalctl -u novasuite -f` |

### 13.8 Health checks

- `/api/auth/me` returns `401 Not authenticated` anonymously, `200` when logged in.
- Sign in at `/login`, then browse `/products`, `/pos`, `/dashboard`.

---

## 14. Deployment

### 14.1 Environment variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `MONGODB_URI` | Yes | MongoDB connection string (Atlas or self-hosted) |
| `AUTH_SECRET` | Yes | Signs session JWTs. Use a long random string. |
| `EMAIL_HOST/PORT/USER/PASS` | No | SMTP for future password reset / verification |
| `STORAGE_DRIVER` | No | `local` (default) or `s3` for file uploads |
| `REALTIME_URL` | No | Future realtime endpoint |

Secrets must never be committed; `.env*` is gitignored.

### 14.2 Option A — VPS (recommended for a client server)

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
git clone <your-repo> /opt/novasuite && cd /opt/novasuite
npm install && cp .env.example .env && nano .env && npm run build
npm install -g pm2 && pm2 start npm --name novasuite -- start && pm2 save && pm2 startup
```

Serve HTTPS with Nginx reverse proxy (see the `server {}` block in the original DEPLOYMENT.md) plus
`certbot --nginx`.

### 14.3 Option B — Docker

A multi-stage `Dockerfile` (deps → build → runtime) plus a `docker-compose.yml` with a `mongo:7` service
and the app service (ports `3000:3000`, `env_file: .env`, volume `mongo-data`). Run `docker compose up -d --build`.

### 14.4 Option C — Container platforms (Render / Railway / Fly.io)

- Connect the GitHub repo → create a Web Service. Build `npm install && npm run build`, start `npm start`,
  set `NODE_ENV=production`, add env vars, add a MongoDB (or Atlas) service.

### 14.5 Option D — Vercel (serverless, MVP-friendly)

- Import the repo at vercel.com → framework **Next.js**. Add `MONGODB_URI` and `AUTH_SECRET`. Deploy.
  `proxy.ts` is recognized as the route guard. Free-tier Atlas works for MVP traffic; scale later.

### 14.6 Verification before ship

```bash
npm run typecheck
npm run lint
npm run build
```

Then smoke-test: register → login → browse `/products` / `/pos` / `/dashboard`.

### 14.7 Production hardening checklist

- Set a strong, unique `AUTH_SECRET`.
- HTTPS everywhere (secure cookie auto-enabled in production).
- Configure real SMTP email delivery before enabling password reset links.
- Move file uploads from local to object storage (`S3`).
- Add automated tenant-isolation tests before multi-business deployment.
- Schedule MongoDB backups.

### 14.8 Scaling path (future)

The app is architected for growth without a rewrite:

1. **MVP → plans/paywall:** add a `plan`/`subscriptionStatus` field on `Business`, gate features by plan
   (a `PERMISSIONS`-style flag system exists). Switch the DB to a bigger cluster or Postgres if preferred.
2. **More traffic:** add caching, move to a managed Postgres, offload realtime to the planned WebSocket service.

The tenant model is DB-agnostic in structure, so migrating to a larger database is a data-migration +
connection change, not a redesign.

---

### End of consolidated documentation
