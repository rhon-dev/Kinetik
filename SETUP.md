# Kinetik Setup Instructions

## Phase 0 Complete ✓

The project scaffolding is ready. Before you can run the application, you need to:

### 1. Set up PostgreSQL Database

You need a running PostgreSQL instance. Options:

**Option A: Local PostgreSQL**
```bash
# Install via Homebrew (macOS)
brew install postgresql@14
brew services start postgresql@14

# Create database
createdb kinetik
```

**Option B: Docker**
```bash
docker run --name kinetik-postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=kinetik -p 5432:5432 -d postgres:14
```

**Option C: Cloud (Supabase, Neon, etc.)**
- Create a database
- Copy the connection string

### 2. Update Database URL

Edit `server/.env` and update the `DATABASE_URL`:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/kinetik?schema=public"
```

Replace `username`, `password`, `localhost`, and `5432` with your actual database credentials.

### 3. Run Prisma Migrations

```bash
cd server
npx prisma migrate dev --name init
```

This will:
- Create all tables (users, refresh_tokens, profiles, time_logs, diary_entries, phrase_templates)
- Generate Prisma Client
- Verify database connectivity

**Expected output:**
```
✔ Generated Prisma Client
✔ Applied migrations
Your database is now in sync with your Prisma schema.
```

If this step fails, **STOP** — the database connection is not working. Check your `DATABASE_URL`.

### 4. Start Development Servers

From the project root:

```bash
npm run dev
```

This starts both:
- Server: http://localhost:5000
- Client: http://localhost:5173

Or run them separately:

```bash
# Terminal 1 - Server
cd server
npm run dev

# Terminal 2 - Client  
cd client
npm run dev
```

### 5. Verify Setup

Open http://localhost:5173 in your browser.

You should see:
- ✓ Server connected: kinetik-api
- A timestamp

If the health check fails, verify:
1. Server is running on port 5000
2. No firewall blocking localhost:5000
3. Check server terminal for errors

## Phase 0 Verification Checklist

- [x] Dependencies installed (`npm install` in root)
- [x] Server dependencies verified (Express, Prisma, bcrypt, JWT, etc.)
- [x] Client dependencies verified (React, Vite, axios)
- [x] Prisma schema created
- [ ] **PostgreSQL database running** (YOU MUST DO THIS)
- [ ] **`npx prisma migrate dev` succeeds** (YOU MUST DO THIS)
- [ ] Server boots without errors
- [ ] Client boots without errors
- [ ] Health check returns 200 OK

## Next Steps

Once Phase 0 is verified:

- **Phase 1:** Authentication (signup, login, JWT refresh, logout)
- **Phase 2:** Onboarding wizard (profile setup, target hours, holidays)
- **Phase 3:** Time tracking dashboard (log hours, circular progress ring)
- **Phase 4:** Quick-entry diary (template-based activity logging)
- **Phase 5:** Report exports (DOCX/PDF generation)
- **Phase 6:** Settings (edit profile, change password)
- **Phase 7:** Production hardening (error handling, validation, logging)

## Troubleshooting

### "Module not found" errors
```bash
npm install
cd server && npm install
cd ../client && npm install
```

### Prisma errors
```bash
cd server
npx prisma generate
npx prisma migrate dev
```

### Port conflicts
- Change `PORT=5000` in `server/.env` to another port
- Update `VITE_API_URL` in `client/.env` to match

### CORS errors
- Verify `CLIENT_ORIGIN` in `server/.env` matches your client URL
- Default: `http://localhost:5173`
