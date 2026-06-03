# Isibuwa Music Event Booking

A full-stack web application for managing music event bookings, built for **Isibuwa Festival 2025**.

## Tech Stack

| Layer      | Technology |
|------------|------------|
| Frontend   | React + Vite + Tailwind CSS |
| Backend    | Node.js + Express |
| Database   | PostgreSQL (Supabase) |
| File Storage | Cloudinary |
| Email      | Nodemailer (Gmail SMTP) |
| Auth       | JWT (admin only) |
| Deploy     | Frontend → Vercel · Backend → Render |

## Project Structure

```
Isibuwa_FE/   ← React + Vite frontend
Isibuwa_BE/   ← Node.js + Express backend
```

## Local Development

### Prerequisites
- Node.js ≥ 18
- A PostgreSQL database (Supabase free tier works)
- Cloudinary account
- Gmail account with App Password

### 1. Clone & set up environment variables

```bash
# Backend
cd Isibuwa_BE
cp .env.example .env
# Fill in all values in .env

# Frontend
cd ../Isibuwa_FE
cp .env.example .env
# Set VITE_API_URL=http://localhost:3000
```

### 2. Set up the database

Run both migration files in your Supabase SQL editor:
1. `src/db/migrations/001_init.sql`
2. `src/db/migrations/002_seed_event.sql`

Then seed the admin user:
```bash
cd Isibuwa_BE
node scripts/seedAdmin.js
# Default: admin@yourevent.com / CHANGE_THIS_PASSWORD
# Override via ADMIN_EMAIL, ADMIN_NAME, ADMIN_PASSWORD in .env
```

### 3. Start the backend

```bash
cd Isibuwa_BE
npm install
npm run dev     # Starts on port 3000
```

### 4. Start the frontend

```bash
cd Isibuwa_FE
npm install
npm run dev     # Starts on port 5173
```

Open http://localhost:5173 for the event site.
Open http://localhost:5173/admin/login for the admin portal.

## Environment Variables

### Backend (`Isibuwa_BE/.env`)

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Secret for signing JWTs (min 32 chars) |
| `JWT_EXPIRES_IN` | Token expiry, e.g. `8h` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `MAIL_HOST` | SMTP host (e.g. `smtp.gmail.com`) |
| `MAIL_PORT` | SMTP port (e.g. `587`) |
| `MAIL_SECURE` | `false` for STARTTLS, `true` for SSL |
| `MAIL_USER` | Gmail address |
| `MAIL_PASS` | Gmail App Password |
| `FRONTEND_URL` | Frontend origin for CORS |
| `PORT` | Server port (default `3000`) |
| `NODE_ENV` | `development` or `production` |

### Frontend (`Isibuwa_FE/.env`)

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend API base URL |

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/event` | Public | Get event info + remaining capacity |
| POST | `/api/bookings` | Public | Submit booking with payment slip |
| POST | `/api/admin/login` | Public | Admin login → JWT |
| POST | `/api/admin/logout` | Public | Client-side logout |
| GET | `/api/admin/bookings` | JWT | List bookings (search/filter/paginate) |
| GET | `/api/admin/bookings/:id` | JWT | Get booking detail + signed slip URL |
| PATCH | `/api/admin/bookings/:id/approve` | JWT | Approve booking, generate ticket |
| PATCH | `/api/admin/bookings/:id/reject` | JWT | Reject booking |
| GET | `/api/admin/stats` | JWT | Get aggregate stats |

## Security Features

- bcrypt (12 rounds) for admin password hashing
- JWT signed with `JWT_SECRET`, 8h expiry
- Server-side MIME type validation for uploads
- 5MB file size limit
- Parameterized SQL queries (no string interpolation)
- Joi validation on all POST/PATCH bodies
- Rate limiting: 5 req/15min on booking submit and login
- CORS restricted to `FRONTEND_URL`
- `helmet()` security headers
- Capacity check inside DB transaction with advisory lock
- Signed Cloudinary URLs (1h expiry) for payment slips
- `.env` files excluded from Git

## Capacity Rules

- Maximum 150 **non-rejected** bookings
- New submissions that exceed this limit receive a `409 Conflict` response
- The capacity check uses a PostgreSQL advisory lock to prevent race conditions
