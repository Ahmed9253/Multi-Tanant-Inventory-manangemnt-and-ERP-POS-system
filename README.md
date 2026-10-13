# WorkNest POS and ERP

WorkNest is a branch-first point of sale and operations workspace created by Quibble Byte. It is designed for a trusted store operator who needs checkout, inventory, branches, sales reporting, and MongoDB persistence in one focused application.

- **Frontend** — React 19 + TypeScript + Vite (static SPA)
- **Backend** — Express 5 + Mongoose 9 (routed as a single serverless function on Vercel)
- **Database** — MongoDB / MongoDB Atlas

## First launch

WorkNest starts from the customer workspace, not from demo data.

1. Start the frontend and API.
2. Open the browser at `http://localhost:5173`.
3. Sign in as admin, then create the first branch on the setup page.
4. Enter the new branch workspace.
5. Add products from Inventory.
6. Create the first POS order.

The first branch becomes the active workspace. The active branch is saved in browser storage for that browser, and the Branches module can be used to create or enter another branch later.

## Requirements

- Node.js 20 or newer
- npm
- MongoDB Atlas or a local MongoDB server

## Installation

```bash
npm install
```

Create your local environment file:

```bash
cp .env.example .env
```

Then edit `.env` if you need a different MongoDB connection string or admin login.

## Development

Run the frontend and backend together:

```bash
npm run dev:full
```

| Service  | URL                     |
| -------- | ----------------------- |
| Frontend | `http://localhost:5173` |
| Backend  | `http://localhost:4000` |

Run the services separately when needed:

```bash
npm run dev      # frontend only
npm run server   # backend only
```

The Vite dev server proxies `/api` requests to the Express server (see `vite.config.ts`).

## Environment variables

| Variable                | Used by | Local value                                     | Vercel value                                              |
| ----------------------- | ------- | ----------------------------------------------- | --------------------------------------------------------- |
| `MONGODB_URI`           | API     | `mongodb://127.0.0.1:27017/worknest_pos`        | Atlas string `mongodb+srv://<user>:<pass>@<cluster>/...`  |
| `PORT`                  | API     | `4000`                                          | not needed (ignored by serverless)                        |
| `ADMIN_NAME`            | API     | `Administrator`                                 | same                                                      |
| `ADMIN_EMAIL`           | API     | `admin@worknest.com`                            | a real admin email                                        |
| `ADMIN_PASSWORD`        | API     | `admin123`                                      | a strong password                                         |
| `CLIENT_ORIGIN`         | API     | empty (Vite proxies same-origin)                | empty for one domain, or your deployed URL                |
| `VITE_API_BASE_URL`     | Web     | empty (Vite proxy)                              | empty for same origin, or your API origin                 |
| `VITE_API_PROXY_TARGET` | Web dev | `http://localhost:4000`                         | not needed                                                |

**What changes between local and Vercel**

- **`MONGODB_URI`** must point at a hosted database (MongoDB Atlas). A local `127.0.0.1` address does not exist on Vercel.
- **`VITE_API_BASE_URL`** — keep it **empty** on Vercel because the frontend and API share the same domain (`/api/*` is rewritten to the serverless function). Only set it if you host the API on a different domain.
- **`VITE_API_PROXY_TARGET`** and **`PORT`** are local-only; Vercel does not need them.
- Set every variable in **Project → Settings → Environment Variables** on Vercel. Variables are not read from a committed `.env` file.

Only variables prefixed with `VITE_` are bundled into the browser build.

## API access from the frontend

All API calls go through `src/lib/api.ts`. The base URL comes from `VITE_API_BASE_URL` and every path lives in the exported `endpoints` map, so no component hardcodes a URL.

```ts
import { api, endpoints } from "../lib/api";

await api.get(endpoints.products.list);
await api.post(endpoints.products.create, form);
await api.patch(endpoints.products.update(id), patch);
```

## Scripts

| Command                   | Description                                       |
| ------------------------- | ------------------------------------------------- |
| `npm run dev`             | Start the Vite dev server                         |
| `npm run server`          | Start the Express API with `tsx`                  |
| `npm run dev:full`        | Start frontend and API together                   |
| `npm run build`           | Type-check web + server, then build the SPA       |
| `npm run typecheck:server`| Type-check only the API (`tsconfig.server.json`)  |
| `npm run preview`         | Preview the production build locally              |
| `npm run lint`            | Run Oxlint                                        |

## Project structure

```text
src/                        React application
  lib/api.ts                API base URL + endpoint map (single source of truth)
  context/                  Auth and store providers
  pages/                    Landing, login, and module pages
  styles/                   Design tokens and stylesheets
server/                     Express application (routes / controllers / models)
  app.ts                    Express app, middleware, error handling
  index.ts                  Local server bootstrap + connectDB export
  config/env.ts             Environment variables
  db/connect.ts             Cached MongoDB connection
  models/                   Mongoose models
  controllers/              Route handler logic
  routes/                   Express routers
  middleware/               DB guard, async handler, error handler
api/index.ts                Vercel serverless entry point
server-run.ts               Local API launcher
vercel.json                 Vercel build, function, and rewrite config
```

## API routes

```text
GET    /api/health

POST   /api/auth/login

GET    /api/products
POST   /api/products
PATCH  /api/products/:id
DELETE /api/products/:id

GET    /api/branches
POST   /api/branches
PATCH  /api/branches/:id
DELETE /api/branches/:id

GET    /api/sales
POST   /api/sales

GET    /api/dashboard
GET    /api/reports/monthly

GET    /api/customers
POST   /api/customers
PATCH  /api/customers/:id
DELETE /api/customers/:id

GET    /api/settings
PATCH  /api/settings

GET    /api/employees
POST   /api/employees
PATCH  /api/employees/:id
DELETE /api/employees/:id

GET    /api/payroll
POST   /api/payroll
POST   /api/payroll/generate
PATCH  /api/payroll/:id
DELETE /api/payroll/:id
```

## Deploying to Vercel

1. Push the project to a Git repository and import it at [vercel.com/new](https://vercel.com/new).
2. Vercel reads `vercel.json`:
   - **Framework**: Vite
   - **Build command**: `npm run build`
   - **Output directory**: `dist`
   - **Function**: `api/index.ts` (the whole Express app)
   - `/api/*` is rewritten to the function while keeping the original path.
3. Add the environment variables from the table above in **Project → Settings → Environment Variables**. At minimum:
   - `MONGODB_URI` (Atlas connection string)
   - `ADMIN_NAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`
   - `VITE_API_BASE_URL` = empty
4. Deploy. Or use the CLI:

```bash
npm i -g vercel
vercel          # preview deployment
vercel --prod   # production deployment
```

To pull the deployed environment variables for local development:

```bash
vercel link
vercel env pull
```

### MongoDB Atlas checklist

- Create a database user and allow access from everywhere (`0.0.0.0/0`) or from Vercel's IPs.
- Use the SRV connection string and include the database name, e.g. `.../worknest_pos`.
- Never commit the connection string. `.env` is git-ignored; `.env.example` contains placeholders only.

## Data behavior

The backend saves the first-use timestamp in the settings collection. Monthly reports begin on that month and continue through the current month. Months without sales still appear with zero values, so the report is a complete operating calendar rather than only a list of active months.

Sales are stored separately from products. Completing a sale reduces the stock of each referenced product. Deleting a product does not delete historical sales.

The backend removes the obsolete `businessId_1_sku_1` product index during startup if it exists.

## License & Legal Disclaimer

This project is licensed under the [MIT License](LICENSE) by **Quibble Byte** and **Muhammad Ahmed**.

> **DISCLAIMER:**  
> Any illegal, unauthorized, or illicit use of this product, codebase, or software is strictly prohibited and not entertained. The author, repository holder, and copyright owner (**Muhammad Ahmed** / Quibble Byte) shall not be held liable or responsible for any damages, misuse, regulatory breaches, or unlawful activities arising from the use, deployment, or modification of this code.
