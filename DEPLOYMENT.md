# Isibuwa Festival 2025 — Deployment Guide

Step-by-step instructions for deploying to production.

---

## 1. DATABASE — Supabase

1. Create a free project at [supabase.com](https://supabase.com)
2. Go to **Settings → Database** and copy the **Connection String** (URI format)
3. Open the **SQL Editor** and run the migration files in order:
   - `backend/src/db/migrations/001_init.sql`
   - `backend/src/db/migrations/002_seed_event.sql`
4. Set `DATABASE_URL` in your backend environment with the Supabase URI
5. Run the admin seeder against the production DB:
   ```bash
   NODE_ENV=production node scripts/seedAdmin.js
   ```

> ⚠️ **Free tier pauses after 1 week of inactivity.** Before the event day,
> upgrade to the **Pro plan (~$25/mo)** to prevent downtime. Alternatively,
> use a cron ping service to keep the DB active.

---

## 2. FILE STORAGE — Cloudinary

1. Sign up at [cloudinary.com](https://cloudinary.com) (free tier: 25 GB)
2. Go to **Dashboard** → copy `Cloud Name`, `API Key`, `API Secret`
3. Set these as environment variables in the backend:
   ```
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```
4. Files are automatically uploaded to the `payment_slips` folder.
   No manual upload preset required — the backend uses Signed uploads.

---

## 3. EMAIL — Gmail SMTP

1. Use a **dedicated Gmail account** (not your personal one)
2. Enable **2-Step Verification** on the account
3. Go to **Google Account → Security → 2-Step Verification → App Passwords**
4. Create an app password for "Mail" on "Other (custom name)"
5. Set in backend environment:
   ```
   MAIL_USER=youreventname@gmail.com
   MAIL_PASS=xxxx xxxx xxxx xxxx   ← the 16-char app password (no spaces)
   ```

---

## 4. BACKEND — Render

1. Push `Isibuwa_BE/` to a GitHub repository
2. Go to [render.com](https://render.com) → **New → Web Service**
3. Connect your GitHub repo
4. Configure:
   - **Root Directory**: `Isibuwa_BE` (or `.` if it's the repo root)
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `node src/app.js`
5. Add all backend environment variables in the **Environment** tab
6. Click **Deploy**

After deploy, your API URL will be: `https://your-service-name.onrender.com`

> ⚠️ **Free tier cold starts**: Render free tier spins down after 15 minutes of
> inactivity. The first request after spin-down takes ~30 seconds. For an event
> site, use a cron ping service (e.g., UptimeRobot) to ping `/health` every
> 5 minutes to keep the service warm.

---

## 5. FRONTEND — Vercel

1. Push `Isibuwa_FE/` to a GitHub repository
2. Go to [vercel.com](https://vercel.com) → **Import Project**
3. Connect your GitHub repo
4. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `Isibuwa_FE` (or `.`)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Add environment variable:
   - `VITE_API_URL` = `https://your-service-name.onrender.com`
6. Click **Deploy**

Vercel automatically handles HTTPS, CDN, and preview deployments.

---

## 6. POST-DEPLOYMENT CHECKLIST

- [ ] Visit the live frontend URL — hero loads with event info
- [ ] Submit a test booking with a sample PDF — verify email arrives
- [ ] Log in to `/admin/login` with seeded credentials
- [ ] Approve the test booking — verify approval email with ticket code
- [ ] Reject a booking — verify rejection email
- [ ] Check stats at `/api/admin/stats`
- [ ] Verify rate limiting by submitting > 5 bookings rapidly (expect 429)
- [ ] Confirm CORS rejects requests from unauthorized origins
- [ ] Change the default admin password via a new `seedAdmin.js` run with `ADMIN_PASSWORD` set

---

## 7. UPDATING EVENT DETAILS

To change the event name, date, venue, or artists, update the `events` table
directly in Supabase:

```sql
UPDATE events
SET
  title       = 'Isibuwa Festival 2025',
  date        = '2025-12-20 18:00:00+05:30',
  venue       = 'Nelum Pokuna Theatre, Colombo',
  ticket_price = 4500.00,
  artists     = '[
    {"name": "Artist Name", "genre": "Genre", "bio": "Short bio"}
  ]'::jsonb
WHERE id = 1;
```
