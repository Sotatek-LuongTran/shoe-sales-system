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
├── auth/                 # Registration, login, JWT
├── common/               # Guards (JWT, Role), decorators
├── database/            # Entities, migrations, repositories, seed
├── product/             # Shoe API (and related variant/brand/category)
├── redis/               # Redis service (blacklist, refresh)
├── app.module.ts
└── main.ts
```

---

## Setup and Run

### 1. Install dependencies

```bash
npm install
```

### 2. Environment variables

Copy `.env.example` to `.env` and set values (database, JWT, Redis):

```bash
cp .env.example .env
```

Important variables: `DATABASE_*`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `REDIS_HOST`, `REDIS_PORT`.

### 3. Database and Redis (Docker)

```bash
docker compose up -d
```

Starts PostgreSQL and Redis as defined in `docker-compose.yml`.

### 4. Run migrations

```bash
npm run migration:run
```

### 5. Seed (optional – create admin or sample data)

```bash
npm run seed:run
```

### 6. Start the application

```bash
# Development (watch)
npm run start:dev

# Production build and run
npm run build
npm run start:prod
```

API runs at `http://localhost:3000` by default (or the `PORT` in `.env`).

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
