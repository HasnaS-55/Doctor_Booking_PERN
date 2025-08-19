# BookDoctor

A minimal full-stack app where **patients** search & book doctors, and **doctors** manage profiles, availability, and appointments. Built with **React + Vite + Redux**, **Express**, and **PostgreSQL (Neon)**. Tailwind UI with an animated pill-navigation and responsive hero.

---

## Features

* **Doctor discovery**

  * Debounced search input (waits **1000 ms** after user stops typing).
  * Server-side pagination with **fixed `limit=9`** per page.
  * Query string keeps **`page`** and **`limit=9`** in sync.

* **Doctor registration**

  * Captures: `first_name`, `last_name`, `email`, `password`, `field`, `location`, `phone_number`, `about`, **`skills[]`**, **`image`**.
  * Drag & drop **ImageUploader** (only the **selected** image is uploaded **on Register**).
  * Server stores a single image URL per doctor.

* **Auth**

  * Email/password with **bcrypt**.
  * **HTTP-only JWT cookie**; server reads it to identify a doctor.
  * Separate patient/doctor auth flows (patients book, doctors manage).

* **Doctor dashboard**

  * **Appointments list** with actions **confirm / reject**.
  * **Calendar** view of appointments.
  * **Availability planner**

    * Weekly rules (`weekday`, `start_time`, `end_time`, `slot_minutes`, `is_active`).
    * UI navigates **current week** and **next 3 weeks** (4-week planning).
    * DB prevents double-booking with `UNIQUE (doctor_id, date, time)`.

* **Polished UI**

  * **PillNav**:

    * **Desktop:** `HOME (#home)`, `ABOUT (#about)`, `BOOK (#doctor)`.
    * **Mobile menu:** same + `REGISTER (/register)` + `LOG IN (/login)`.
    * Hamburger toggles; **click outside or icon** closes the menu.
  * **Hero**:

    * Desktop: original two-panel layout.
    * Mobile: compact hero; desktop content hidden via Tailwind `lg:hidden` / `lg:flex`.
  * **Tailwind theming**: custom `tree` palette, Onest font; consistent color usage.

---

## Project structure

```
server/               # Express API
  src/
    routes/
    middleware/
    ...
  sql/                # SQL files (schema, seeds, helpers)
    001_init.sql
    002_seed.sql
client/               # Vite + React app
  src/
    components/
    pages/
    slices/
    ...
```

> SQL for tables lives in **`server/sql/001_init.sql`**.

---

## Quick start

### Requirements

* Node.js 18+
* PostgreSQL 13+ (local **or** hosted — e.g. **Neon**)

### 1) Install

```bash
git clone <your-repo-url>
cd <your-repo>

# server
cd server
npm install

# client
cd ../client
npm install
```

### 2) Configure backend env

Create `server/.env`:

```
PORT=4000
# Works with Neon too (use the connection string from the Neon dashboard)
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DBNAME?sslmode=require
JWT_SECRET=<strong-secret>
COOKIE_NAME=bookdoctor_auth
CORS_ORIGIN=http://localhost:5173
NODE_ENV=development
```

> **No env in the frontend.** Vite dev server proxies `/api` to the backend.

### 3) Prep database (local or Neon)

```bash
# Apply schema (creates extensions, tables, indexes)
psql "$DATABASE_URL" -f server/sql/001_init.sql

# (optional) seed
# psql "$DATABASE_URL" -f server/sql/002_seed.sql
```

> Schema includes `CREATE EXTENSION IF NOT EXISTS pgcrypto;` so `gen_random_uuid()` works on Neon and local Postgres.

### 4) Run

```bash
# server
cd server
npm run dev   # http://localhost:4000

# client
cd ../client
npm run dev   # http://localhost:5173
```

Vite development proxy → `/api` → `http://localhost:4000`.

---

## API

Base URL: `/api`

* **Auth (doctor)**

  * `POST /doctor/register` → creates account, sets auth cookie.

* **Availability**

  * `GET /doctor/availability`
  * `POST /doctor/availability` — body:

    ```json
    [
      { "weekday": 0, "start_time": "09:00", "end_time": "13:00", "slot_minutes": 30, "is_active": true }
    ]
    ```

* **Appointments**

  * `GET /doctor/appointments?status=pending|confirmed|rejected&from=YYYY-MM-DD&to=YYYY-MM-DD`
  * `PATCH /doctor/appointments/:id` → `{ "status": "confirmed" | "rejected" }`

* **Uploads**

  * `POST /upload` — multipart field **`image`**, returns `{ "url": "https://..." }` used by ImageUploader (**upload happens on submit**).

---

## Frontend notes

* **Tools:** React Router, Redux Toolkit, Tailwind, GSAP, lucide-react.
* **Vite config:** dev proxy `{ "/api": "http://localhost:4000" }`.
* **Tailwind colors:** `tree.light #EBF0FE`, `tree.dark #0B0A0A`, `tree.blue #246AFE`.

---

## Scripts

**server**

* `npm run dev` — start API in watch mode

**client**

* `npm run dev` — start Vite dev server
* `npm run build` — production build
* `npm run preview` — preview prod build

---
