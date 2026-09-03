<div align="center">

# NovaSuite

**A multi-tenant POS · Inventory · HR · ERP platform — every business isolated.**

Build for retail, wholesale, and service businesses. One deployment serves many independent
businesses, and each business's data is fully isolated (Business A can never see Business B).

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js_16-000000?style=flat-square&logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React_19-61DAFB?style=flat-square&logo=react&logoColor=black)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat-square&logo=mongodb&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS_v4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-2ea44f?style=flat-square)

</div>

---

## What is this?

NovaSuite is a full-stack SaaS **business management platform** covering the everyday operations of a
retail/wholesale business:

- **Point of Sale** (POS) with split payments and live inventory.
- **Inventory** across multiple stores, with an auditable movement ledger.
- **HR**: employees, departments, attendance, leave, and payroll.
- **Sales / Purchases / Customers / Suppliers / Stores**.
- **Reports & analytics**, roles & permissions, audit logs, notifications.

It is architected as a **platform**: a single codebase and database serve many independent businesses,
each scoped and secured so no tenant can read another tenant's data.

> **Status: functional MVP.** Core modules work end-to-end. Several advanced features are designed but
> not yet implemented — see [What's missing](#-whats-missing--roadmap). We welcome contributors.

---

## ✨ Feature highlights

- **Multi-tenant by design** — server-side tenant resolution, per-business scoping on every query.
- **Role-based access control** — granular permission strings enforced server-side on every route.
- **Financially correct** — totals recalculated on the server; client values are never trusted.
- **Concurrency-safe inventory** — atomic stock updates prevent double-sale corruption.
- **Auditable** — every sensitive action writes an audit log.
- **Light/dark theme** — toggleable, persisted.
- **Modern UI** — shadcn/ui + Tailwind CSS v4, Inter/Outfit typography.

---

## 🧱 Tech stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, Turbopack) |
| UI | React 19, TypeScript (strict), Tailwind CSS v4, shadcn/ui |
| State | Redux Toolkit |
| Database | MongoDB + Mongoose |
| Auth | jose (JWT), bcryptjs (hashing), cookie sessions |

---

## 🚀 Getting started

### Prerequisites

- **Node.js 20+**
- **MongoDB** — a free [Atlas](https://www.mongodb.com/atlas) cluster or a local/self-hosted instance.

### Setup

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
#    Edit .env:
#      MONGODB_URI  -> your MongoDB connection string
#      AUTH_SECRET  -> run: openssl rand -hex 32

# 3. (Optional) Load demo data
npm run seed

# 4. Start the dev server
npm run dev
```

Open **http://localhost:3000**.

- Register any account to create your own isolated business (owner account, default store, and default
  roles are created automatically).
- Or log in with a seeded demo account (password `Password123!`):
  `owner@demoretail.com`, `manager@demoretail.com`, `cashier@demoretail.com`,
  `inventory@demoretail.com`, `hr@demoretail.com`.

### Common scripts

```bash
npm run dev          # dev server
npm run build        # production build
npm start            # run production build
npm run lint         # eslint
npm run typecheck    # tsc --noEmit
npm run seed         # create demo data
npm run clear-seed   # remove demo data
```

---

## 📁 Project structure

```
app/(landing)       Marketing site
app/(auth)          Login / register / forgot-password
app/(platform)      Authenticated app shell + feature pages
app/api/**          Tenant-scoped REST endpoints
components/         UI primitives, layout (sidebar/nav/app shell), logo
lib/                db, auth, validators, api-response, audit, utils
models/             Mongoose models (all tenant-scoped via businessId)
store/              Redux Toolkit slices + provider
types/              Shared types + permission constants
config/             App constants (hero image, logo, pagination, currencies)
scripts/            Seed / clear data
docs/               Consolidated documentation (DOCUMENTATION.md)
```

See **[docs/DOCUMENTATION.md](docs/DOCUMENTATION.md)** for the full consolidated reference — architecture,
database schema, auth, authorization, multi-tenancy, API, inventory, POS, HR, realtime, migration,
operation, and deployment.

---

## 🔒 Multi-tenancy & security model

The core guarantee: **Business A can never see Business B.**

- Every tenant-scoped entity carries a `businessId`.
- The active tenant is derived **server-side** from the signed session/membership — never from the client.
- Every query filters by the resolved `businessId`; resource lookups by ID are also tenant-scoped.
- Permissions are checked server-side on every API route; the UI only filters navigation for UX.
- Sales/purchase totals are recomputed on the server; inventory changes are atomic.

---

## 🗺 What's missing & roadmap

We track this honestly — these are designed but **not yet implemented**:

**Planned / in progress:**
- [ ] WebSocket/SSE realtime push (event taxonomy defined; notifications stored server-side already)
- [ ] Full store-to-store transfer workflow (API foundation exists)
- [ ] Purchase receiving / incoming-stock reservation pipeline
- [ ] Automated tenant-isolation + authorization test suite

**Backlog / future:**
- [ ] SMTP-delivered password reset & email verification (UI + abstraction present)
- [ ] Receipt / PDF printing, hold-sale persistence, offline POS
- [ ] Barcode-hardware intake focus flow
- [ ] Full leave-balance accrual engine & payslip generation
- [ ] File-upload storage driver beyond the abstraction (S3)
- [ ] Plans / paywall layer (architected to add a `plan` field without a rewrite)

---

## 🤝 Contributing

Contributions are welcome! Here's how to get started:

1. **Fork** the repo and clone your fork.
2. **Branch** off `main` (e.g. `feat/store-transfers`).
3. Set up the project locally (see [Getting started](#-getting-started)).
4. Make your changes and **verify** with:
   ```bash
   npm run typecheck
   npm run lint
   npm run build
   ```
5. Write/update tests where applicable (a test runner is not yet configured — see note below).
6. Commit with a clear message, push, and open a **pull request**.

### Guidelines

- Keep tenant isolation sacred: never add a query without a `businessId` scope.
- Enforce authorization server-side; don't rely on the frontend alone.
- Follow the existing code style (shadcn/ui `render` prop pattern, strict TS, no `any`).
- Update **docs/DOCUMENTATION.md** when you add or change behavior.

> **Note on tests:** no test framework is configured yet. Setting one up (e.g. Vitest + a MongoDB test
> container) and writing the tenant-isolation suite is one of the highest-value contributions.

---

## 📄 License

MIT — see [LICENSE](LICENSE) (add one if not present).

---

<div align="center">
Built with care. Star the repo if you find it useful, and PRs are always welcome!
</div>
