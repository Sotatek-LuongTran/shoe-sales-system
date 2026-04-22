# Shoe Sales System – Backend API

Backend API for a shoe sales system built with **NestJS**, **TypeORM**, **PostgreSQL**, **Redis**, and **JWT**. It supports user registration and login, product (shoe) management, size-based inventory, orders, and order management with role-based access (USER / ADMIN).

---

## Goals

- Build a REST API for a shoe sales system.
- Apply **Authentication** and **Authorization** (JWT).
- Demonstrate the business flow: product management → inventory → orders → order management.

---

## System Scope

- Users can **register** and **log in**.
- Users can **browse** and **purchase** shoes.
- Admins **manage** shoes, brands, categories, and orders.

---

## Roles and Permissions

| Role   | Permissions |
|--------|-------------|
| **USER** | Register, login; view shoe list and details; create orders; pay for their own orders (simulated); view their own order list and details. |
| **ADMIN** | All USER permissions; create, update, delete shoes; manage brands and categories; manage sizes and inventory; view all users; view and manage all orders; update order status. |

- USER may only act on **their own** resources (orders, payments).
- ADMIN may act on **all** resources.
- Requests without sufficient permissions return an appropriate error (e.g. 403).

---

## Authentication

- Registration with **email** and **password** (unique email, password hashed before storage).
- Login returns an **access token** (JWT).
- Tokens have an **expiry** and contain **userId** and **role**.
- **Refresh token** and **blacklist** (logout) are supported via Redis.

---

## Authorization

- Access control is **role-based** (guards).
- USER: access only their own resources.
- ADMIN: access all resources.
- Authorization errors are returned in a consistent format (e.g. 403 Forbidden).

---

## Core Features

### Shoes (Product)

- Each shoe belongs to **one brand** and **one category**.
- Fields: name, price (per variant), description, sale status.
- Gender: **MEN**, **WOMEN**, **UNISEX**.
- USER: read-only. ADMIN: create, update, delete shoes; enable/disable sale status.

### Sizes and Inventory (Product Variant)

- Each shoe has **multiple sizes** (e.g. 38, 39, 40, 41, 42, 43).
- Each size has its own **stock quantity**.
- Users may only order sizes **in stock**; on successful order, stock is **decremented**.
- Negative stock is not allowed.
- Only ADMIN may **update inventory** per size.

### Brands

- Multiple brands; each has name and description.
- Only ADMIN can create, update, delete. **Cannot** delete a brand if it still has products.

### Categories

- Examples: Sneaker, Running, Basketball, Sandal...
- Only ADMIN can create, update, delete. **Cannot** delete a category if it still has products.

### Orders

- Users create orders with **one or more items** (shoe + size + quantity).
- Only shoes that are **on sale** and **in stock** may be ordered.
- Price is stored **at order time**; **order total** is calculated and stored.
- USER may only view and pay **their own** orders; ADMIN may view and manage **all** orders.

### Order Status

- **PENDING** → **PAID** → **SHIPPED** → **COMPLETED** or **CANCELLED**.
- Only orders in **PENDING** may be paid.
- Only **ADMIN** may update order status; USER cannot.

---

## Tech Stack

- **NestJS** (Node.js)
- **TypeORM** + **PostgreSQL**
- **Redis** (session/blacklist, refresh token)
- **JWT** (Passport)
- **class-validator** / **class-transformer** (DTOs)

---

## Project Structure (Overview)

```
src/
├── app.module.ts
├── main.ts
├── auth/                     # Auth module (login, registration, OTP, password reset)
├── admin/                    # Admin side features
│   ├── auth/                 # Admin authentication
│   ├── management/           # CRUD for brands, categories, products, variants, users, orders, payments
│   └── ...
├── order/                    # Order handling (DTOs, repository, services)
├── user/                     # User profile and password management
├── workers/                  # Bull workers (mailer, order, file handling)
│   ├── mailer/               # Email sending worker
│   ├── order/                # Background order processing
│   └── file/                 # File upload / MinIO worker
├── shared/                   # Shared utilities, modules, DTOs, guards, enums, filters
│   ├── modules/              # Common modules (brand, category, product, user, etc.)
│   ├── decorators/           # Custom decorators (role, etc.)
│   ├── guards/               # Role and refresh‑token guards
│   ├── enums/                # Application enums (order, payment, user, etc.)
│   ├── dto/                  # Common response & pagination DTOs
│   └── ...
├── database/                 # TypeORM entities, migrations, seeds, data‑source config
│   ├── entities/             # Entity definitions (user, product, order, payment, ...)
│   ├── migrations/           # Migration scripts
│   └── seeds/                # Seed data scripts
└── ...
```

---

## Setup and Run

### 1. Install dependencies

```bash
npm install
```

### 2. Environment variables

Copy `.env.example` to `.env` and set values (database, JWT, Redis, MinIO, Mailer):

```bash
cp .env.example .env
```

Important variables include:
- `DATABASE_*` – PostgreSQL connection settings
- `JWT_SECRET`, `JWT_EXPIRES_IN` – authentication tokens
- `REDIS_HOST`, `REDIS_PORT` – Redis for session/blacklist and Bull queues
- `MINIO_ENDPOINT`, `MINIO_ACCESS_KEY`, `MINIO_SECRET_KEY` – MinIO object storage
- `MAILER_HOST`, `MAILER_PORT`, `MAILER_USER`, `MAILER_PASS` – email service configuration

### 3. Run supporting services (Docker)

```bash
docker compose up -d
```

This brings up PostgreSQL, Redis, and MinIO (for file storage) as defined in `docker-compose.yml`.

### 4. Run database migrations

```bash
npm run migration:run
```

### 5. Seed data (optional)

```bash
npm run seed:run
```

### 6. Start the application

```bash
# Development (watch mode)
npm run start:dev

# Production build and run
npm run build
npm run start:prod
```

### 7. Run background workers (optional)

The project includes several Bull‑based workers for asynchronous tasks:

```bash
# Mailer worker (sends emails)
npm run worker:mailer

# Order processing worker
npm run worker:order

# File handling worker (e.g., uploads to MinIO)
npm run worker:file
```

API is available at `http://localhost:3000` (or the port defined in `.env`).

---

## Useful Scripts

| Script | Description |
|--------|-------------|
| `npm run start:dev` | Run in development with watch |
| `npm run build` | Production build |
| `npm run migration:run` | Run migrations |
| `npm run migration:revert` | Revert last migration |
| `npm run migration:create <MigrationName>` | Create a new migration file |
| `npm run seed:run` | Run seed |
| `npm run lint` | Run ESLint |

---

## License

UNLICENSED (private project).
