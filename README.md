# Tillora POS and ERP

Tillora is a branch-first point of sale and operations workspace created by Quibble Byte. It is designed for a trusted store operator who needs checkout, inventory, branches, sales reporting, and MongoDB persistence in one focused application.

## First launch

Tillora starts from the customer workspace, not from demo data.

1. Start the frontend and API.
2. Open the browser at `http://localhost:5173`.
3. Create the first branch on the setup page.
4. Enter the new branch workspace.
5. Add products from Inventory.
6. Create the first POS order.

The first branch becomes the active workspace. The active branch is saved in browser storage for that browser, and the Branches module can be used to create or enter another branch later.

There are no seeded products, sample sales, or hardcoded main branch records. New installations begin with an empty product collection and an empty sales collection.

## Modules

### Sell

- Search products by name
- Search or scan by SKU and barcode
- Add products to a cart
- Adjust quantities
- Add an optional customer
- Apply a discount
- Calculate subtotal, tax, discount, and total dynamically
- Select card, cash, or other payment
- Complete a sale and decrease product stock
- Start from order `#0001` when the sales collection is empty

### Dashboard

- Total revenue
- Total order count
- Inventory value
- Units on hand
- Low-stock count
- Revenue pulse chart
- Product catalog overview

### Inventory

- Add products
- Set category, price, stock, and barcode
- Generate a SKU automatically when one is not supplied
- Search by name, SKU, or barcode
- Edit price inline
- Edit stock inline
- See calculated inventory value
- See low-stock warnings
- Delete products with browser confirmation

### Branches

- First-run branch setup page
- First branch becomes the initial active workspace
- Branch name and unique code
- Manager, address, and phone fields
- Branch overview cards
- Enter any branch as the active workspace
- Create additional branches after setup

### Reports

- Dynamic monthly billing ledger
- Starts from the first-use month saved in MongoDB
- Bill count by month
- Items sold by month
- Revenue by month
- Tax by month
- Discounts by month
- All-time totals
- CSV spreadsheet export

### Interface

- Tillora POS and ERP branding
- Quibble Byte footer credit
- Light and dark theme
- Local date and time display
- Responsive desktop and mobile layouts
- Help command center
- No authentication in this trusted-operator version

## Keyboard controls

Tillora detects the operating system and displays the correct shortcut labels.

| Action                | macOS         | Windows and Linux |
| --------------------- | ------------- | ----------------- |
| Open or close help    | `Command + /` | `Ctrl + /`        |
| Search products       | `Command + K` | `Ctrl + K`        |
| Close the help dialog | `Esc`         | `Esc`             |

The footer and help dialog always show the platform-appropriate label. The browser clock uses the current machine locale and time zone.

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

Create a private `.env` file in the project root:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/tillora_pos
PORT=4000
```

For MongoDB Atlas, replace `MONGODB_URI` with the Atlas connection string. Do not commit `.env` or share the connection string publicly.

## Installation

```bash
npm install
```

## Development

Run the frontend and backend together:

```bash
npm run dev:full
```

Frontend:

```text
http://localhost:5173
```

Backend:

```text
http://localhost:4000
```

Run the services separately when needed:

```bash
npm run dev
npm run server
```

The Vite development server proxies `/api` requests to the Express server on port `4000`.

## Validation

Build the frontend:

```bash
npm run build
```

Run linting:

```bash
npm run lint
```

Check backend TypeScript:

```bash
npx tsc server.ts --noEmit --ignoreConfig --target ES2022 --module NodeNext --moduleResolution NodeNext --esModuleInterop
```

## API routes

Health:

```text
GET /api/health
```

Products:

```text
GET    /api/products
POST   /api/products
PATCH  /api/products/:id
DELETE /api/products/:id
```

Sales:

```text
GET  /api/sales
POST /api/sales
```

Branches:

```text
GET    /api/branches
POST   /api/branches
PATCH  /api/branches/:id
```

Dashboard:

```text
GET /api/dashboard
```

Monthly reports:

```text
GET /api/reports/monthly
```

## Data behavior

The backend saves the first-use timestamp in the settings collection. Monthly reports begin on that month and continue through the current month. Months without sales still appear with zero values, so the report is a complete operating calendar rather than only a list of active months.

Sales are stored separately from products. Completing a sale reduces the stock of each referenced product. Deleting a product does not delete historical sales.

The backend removes the obsolete `businessId_1_sku_1` product index during startup if it exists. This migration only removes that outdated index and does not delete branches, sales, or settings.

## Project structure

```text
src/App.tsx       React application, onboarding, modules, and workflows
src/App.css       Application styles and responsive layouts
src/index.css     Global document styles
server.ts         Express API, Mongoose models, and reports
vite.config.ts    Vite configuration and API proxy
index.html        Browser document title and app entry point
.env              Local MongoDB configuration
```

## Deployment notes

Set `MONGODB_URI` and `PORT` in the deployment environment. Build the client with `npm run build`, serve the generated `dist` directory using your preferred web server, and run the API with `npm run server`.

Configure the frontend server to proxy `/api` requests to the running Express API, or serve the API and client behind the same origin. Before exposing the system publicly, add authentication, user roles, audit logging, validation limits, and production error monitoring.
