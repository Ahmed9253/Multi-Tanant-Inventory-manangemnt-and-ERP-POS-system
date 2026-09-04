# Morrow POS and ERP

Morrow is a browser-based point of sale and operations system for a retail store. It combines checkout, product management, inventory control, branches, sales reporting, and MongoDB persistence in one application.

## Current capabilities

### Point of sale

- Product search and category filtering
- Barcode and SKU lookup from the product search field
- Cart quantity controls
- Customer name and discount entry
- Automatic subtotal, tax, discount, and total calculations
- Card, cash, and other payment methods
- Sale creation through the backend
- Automatic inventory reduction after a completed sale

### Dashboard

- Revenue totals
- Order totals
- Inventory value
- Units on hand
- Low-stock count
- Revenue pulse chart
- Product catalog overview

### Inventory management

- Product creation form
- Product name, category, price, stock, barcode, and generated SKU
- Search by product name, SKU, or barcode
- Inline price updates
- Inline stock updates
- Inventory value calculations
- Low-stock highlighting
- Permanent product deletion with confirmation

### Branch management

- Branch overview page
- Main branch empty state for a new installation
- Branch creation form
- Branch code, manager, address, phone, and status
- MongoDB-backed branch records

### Interface

- Light and dark themes
- Theme preference saved in browser storage
- Responsive layout for desktop and mobile screens
- Operator workspace without authentication

## Technology

- React 19
- TypeScript
- Vite
- Express
- Mongoose
- MongoDB
- Oxlint

## Requirements

- Node.js 20 or newer
- npm
- MongoDB Atlas or a local MongoDB server

## Configuration

Create a `.env` file in the project root:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/morrow_pos
PORT=4000
```

For MongoDB Atlas, replace `MONGODB_URI` with the connection string supplied by Atlas. Keep the `.env` file private and do not commit it.

## Installation

Install dependencies:

```bash
npm install
```

## Development

Run the frontend and backend together:

```bash
npm run dev:full
```

Open the application at:

```text
http://localhost:5173
```

The API runs at:

```text
http://localhost:4000
```

## Separate development processes

Start only the frontend:

```bash
npm run dev
```

Start only the backend:

```bash
npm run server
```

## Production build

Run the client build:

```bash
npm run build
```

Run linting:

```bash
npm run lint
```

Check the backend types:

```bash
npx tsc server.ts --noEmit --ignoreConfig --target ES2022 --module NodeNext --moduleResolution NodeNext --esModuleInterop
```

## API routes

### Health

```text
GET /api/health
```

### Products

```text
GET    /api/products
POST   /api/products
PATCH  /api/products/:id
DELETE /api/products/:id
```

### Sales

```text
GET  /api/sales
POST /api/sales
```

Creating a sale stores the transaction and decreases stock for every product in the sale.

### Branches

```text
GET    /api/branches
POST   /api/branches
PATCH  /api/branches/:id
```

### Dashboard

```text
GET /api/dashboard
```

The dashboard route calculates revenue, order count, inventory value, units on hand, low-stock count, and daily sales data from MongoDB.

## Product setup after reset

This installation starts with an empty product collection and an empty sales collection. The first POS order is `#0001`. Use the Inventory page to create the first product. Enter its name, category, price, stock quantity, and optional barcode. A SKU is generated automatically when one is not supplied by the API request.

The branch collection is separate from products. Create the main branch first, then add other operating locations as needed.

## MongoDB data safety

The backend removes one obsolete product index named `businessId_1_sku_1` during startup. This migration only removes the outdated index and does not delete branches, sales, or other collections.

Product deletion is available from the Inventory page and requires browser confirmation. Deleting a product removes its product record and removes it from any currently open local cart. Historical sales are stored separately.

## Project structure

```text
src/App.tsx       React application and module views
src/App.css       Application styles and responsive layouts
src/index.css     Global document styles
server.ts         Express API and Mongoose models
vite.config.ts    Vite configuration and API proxy
.env              Local MongoDB configuration
```

## Notes

Authentication is intentionally not included in this version. The application is designed for a trusted internal operator environment. Add authentication and role permissions before exposing it to a public network.
