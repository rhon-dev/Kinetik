# Kinetik Quick Start

**Get Kinetik running in under 5 minutes.**

---

## Prerequisites

- Node.js 18+ and npm installed
- PostgreSQL 14+ (see installation options below)

---

## 1. Install PostgreSQL

### Option A: Homebrew (macOS)
```bash
brew install postgresql@14
brew services start postgresql@14
createdb kinetik
```

### Option B: Docker
```bash
docker run --name kinetik-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=kinetik \
  -p 5432:5432 -d postgres:14
```

### Option C: Use Existing Postgres
Make sure you have:
- A running Postgres instance
- Database name: `kinetik` (or create one: `createdb kinetik`)
- Connection details: host, port, username, password

---

## 2. Configure Database

Edit `server/.env` and update the `DATABASE_URL`:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/kinetik?schema=public"
```

Replace `postgres:postgres` with your actual username:password.

---

## 3. Run Database Migration

```bash
cd server
npx prisma migrate dev --name init
```

**Expected output:**
```
✔ Generated Prisma Client
✔ Applied migrations
Your database is now in sync with your Prisma schema.
```

**If this fails:**
- Check PostgreSQL is running: `psql -U postgres -l`
- Verify `DATABASE_URL` credentials
- Test connection: `psql "postgresql://user:pass@localhost:5432/kinetik"`

---

## 4. Start Development Servers

From the project root:

```bash
npm run dev
```

This starts both:
- **API Server:** http://localhost:5001
- **React Client:** http://localhost:5173

Or run them separately in two terminals:

```bash
# Terminal 1 - Server
cd server
npm run dev

# Terminal 2 - Client
cd client
npm run dev
```

---

## 5. Verify Installation

Open **http://localhost:5173** in your browser.

You should see:

```
Kinetik
Continuous movement, career momentum.

✓ Server connected: kinetik-api
2026-06-25T...
```

✅ **Phase 0 is complete!** You're ready to build Phase 1.

---

## Troubleshooting

### "Module not found" errors
```bash
npm install
```

### Database connection fails
```bash
# Test your database connection
psql "postgresql://postgres:postgres@localhost:5432/kinetik"

# Regenerate Prisma Client
cd server
npx prisma generate
```

### Port already in use
Edit `server/.env` and change `PORT=5001` to another port.
Then update `client/.env` to match: `VITE_API_URL=http://localhost:<NEW_PORT>/api`

### CORS errors in browser console
Verify `CLIENT_ORIGIN` in `server/.env` matches your client URL (default: `http://localhost:5173`)

---

## What's Next?

- **Phase 1:** Authentication (signup, login, JWT refresh, logout)
- **Phase 2:** Onboarding wizard (profile setup)
- **Phase 3:** Time tracking dashboard (log hours, circular progress)
- **Phase 4:** Quick-entry diary (template-based activity logs)
- **Phase 5:** Report exports (DOCX/PDF generation)
- **Phase 6:** Settings (edit profile, change password)
- **Phase 7:** Production hardening (validation, logging, monitoring)

See **STATUS.md** for detailed phase-by-phase status.

---

## Key Commands

```bash
# Install dependencies
npm install

# Run database migrations
cd server && npx prisma migrate dev

# Start both servers
npm run dev

# Run server only
cd server && npm run dev

# Run client only
cd client && npm run dev

# Open Prisma Studio (database GUI)
cd server && npm run db:studio

# Lint code
npm run lint --workspace=server
npm run lint --workspace=client

# Format code
npm run format --workspace=server
npm run format --workspace=client
```

---

**Kinetik is ready. Complete the database setup above, then start building.**
