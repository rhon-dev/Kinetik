# ✅ Phase 0: Scaffolding & Environment — COMPLETE

## Summary

All dependencies are installed and verified. The toolchain is ready. The server boots successfully on port 5001, and all imports resolve correctly.

## What Was Done

### 1. Project Structure Created
```
/Kinetik
├── /server               - Express API (Node.js)
├── /client               - React + Vite frontend
├── package.json          - Root workspace with npm scripts
├── .gitignore            - Protects secrets and build artifacts
├── README.md             - Project overview
├── SETUP.md              - Detailed setup instructions
├── STATUS.md             - Development phase tracker
└── PHASE_0_COMPLETE.md   - This file
```

### 2. Dependencies Installed & Verified

**Server (all ✓ verified):**
- express, cors, cookie-parser, dotenv
- @prisma/client, prisma (5.22.0)
- bcrypt (5.1.1)
- jsonwebtoken (9.0.2)
- express-rate-limit (7.1.5)
- zod (3.22.4) — input validation
- multer (1.4.5) — file uploads
- docx (8.5.0) — DOCX generation
- pdfkit (0.14.0) — PDF generation
- mustache (4.2.0) — template engine
- ESLint + Prettier

**Client (all ✓ installed):**
- react (18.2.0), react-dom (18.2.0)
- react-router-dom (6.21.1)
- axios (1.6.5)
- vite (5.0.11), @vitejs/plugin-react
- ESLint + Prettier

### 3. Database Schema (Prisma)

Complete schema covering all 7 phases:

```prisma
User {
  id, email, passwordHash, fullName, createdAt
  Relations: RefreshToken[], Profile, TimeLog[], DiaryEntry[], PhraseTemplate[]
}

RefreshToken {
  id, userId, tokenHash, expiresAt, revokedAt, createdAt
}

Profile {
  id, userId, school, company, companyLogoUrl, position,
  assignedOffice, courseYear, supervisorName, targetHours,
  startDate, hoursPerDayDefault, weeklyWorkDays, phHolidays,
  onboardingComplete, createdAt, updatedAt
}

TimeLog {
  id, userId, date, hoursLogged, note, createdAt, updatedAt
  Unique: [userId, date]
}

DiaryEntry {
  id, userId, date, category, detail, tags, composedText,
  createdAt, updatedAt
}

PhraseTemplate {
  id, userId, category, templateText, isUserSaved,
  createdAt, lastUsedAt
}
```

### 4. API Endpoints (Phase 0 Only)

- **`GET /api/health`** — Returns 200 with `{ status, timestamp, service }`
- **`GET /`** — Welcome message
- Global error handler (no stack traces in production)
- CORS configured: `CLIENT_ORIGIN` only, `credentials: true`

### 5. Configuration Files

- **.env files** created for both server and client
- **ESLint + Prettier** configured for code quality
- **Vite proxy** configured: `/api` → `http://localhost:5001`
- **JWT secrets** set (MUST change in production)
- **File upload limits** configured (1MB max, MIME validation)

### 6. Server Boot Test

```bash
✓ Kinetik API running on http://localhost:5001
✓ Health check: http://localhost:5001/api/health
✓ Environment: development
```

All imports verified:
```
✓ @prisma/client
✓ express
✓ cors
✓ bcrypt
✓ jsonwebtoken
✓ express-rate-limit
✓ zod
✓ multer
✓ docx
✓ pdfkit
✓ mustache
✓ cookie-parser
✓ dotenv
```

---

## ⚠️ Before Phase 1: YOU MUST Complete Database Setup

Phase 0 is complete **except for the database migration**, which requires a running PostgreSQL instance.

### Required Steps (DO THIS NOW)

#### Step 1: Start PostgreSQL

Choose one:

**Option A: Homebrew (macOS)**
```bash
brew install postgresql@14
brew services start postgresql@14
createdb kinetik
```

**Option B: Docker**
```bash
docker run --name kinetik-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=kinetik \
  -p 5432:5432 -d postgres:14
```

**Option C: Cloud (Supabase, Neon, Railway)**
- Create a database
- Copy the connection string

#### Step 2: Update Database URL

Edit `server/.env` and replace the `DATABASE_URL`:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/kinetik?schema=public"
```

Use your actual credentials!

#### Step 3: Run Prisma Migration

```bash
cd server
npx prisma migrate dev --name init
```

**Expected output:**
```
Environment variables loaded from .env
Prisma schema loaded from prisma/schema.prisma

✔ Generated Prisma Client (v5.22.0)
✔ The following migration(s) have been applied:

migrations/
  └─ 20XX0XXX000000_init/
    └─ migration.sql

Your database is now in sync with your Prisma schema.
```

**If this fails:**
- Verify PostgreSQL is running
- Check `DATABASE_URL` credentials
- Test connection: `psql "postgresql://user:pass@localhost:5432/kinetik"`

#### Step 4: Start Development Servers

From project root:
```bash
npm run dev
```

This starts:
- **Server:** http://localhost:5001
- **Client:** http://localhost:5173

Or run separately:
```bash
# Terminal 1
cd server && npm run dev

# Terminal 2
cd client && npm run dev
```

#### Step 5: Verify Health Check

Open **http://localhost:5173** in your browser.

You should see:
```
Kinetik
Continuous movement, career momentum.

✓ Server connected: kinetik-api
2026-06-25T...
```

If the health check fails:
1. Verify server is running on port 5001
2. Check server terminal for errors
3. Verify no firewall blocking localhost:5001

---

## Phase 0 Checklist

- [x] Root workspace created with npm workspaces
- [x] Server dependencies installed (Express, Prisma, bcrypt, JWT, etc.)
- [x] Client dependencies installed (React, Vite, axios, react-router-dom)
- [x] Prisma schema created (all 6 models for all phases)
- [x] Prisma Client generated
- [x] Server boots without errors
- [x] All package imports verified
- [x] Health check endpoint implemented
- [x] CORS configured with credentials
- [x] Environment variables configured
- [x] ESLint + Prettier configured
- [x] .gitignore protecting secrets
- [ ] **PostgreSQL database running** — YOU MUST DO THIS
- [ ] **`npx prisma migrate dev` succeeded** — YOU MUST DO THIS
- [ ] **Client boots and shows health check** — TEST AFTER MIGRATION

---

## Next Phase: Phase 1 — Authentication

Once the database migration succeeds and both servers boot correctly, you're ready for **Phase 1: Authentication**.

Phase 1 will implement:
- `POST /api/auth/signup` — User registration
- `POST /api/auth/login` — JWT access + refresh tokens (httpOnly cookies)
- `POST /api/auth/refresh` — Token rotation (revoke old, issue new)
- `POST /api/auth/logout` — Server-side token revocation
- `GET /api/auth/me` — Current user info
- Rate limiting (5 attempts / 10 min / IP)
- Frontend: Signup/Login pages, Auth context, Route guards

**Phase 1 is a launch-blocker.** Do not skip auth testing:
- Signup → Login → Refresh → Logout cycle must work end-to-end
- Passwords never returned in responses
- Rate limiting verified with burst test
- Refresh token rotation prevents replay attacks

---

## Project Health

**Status:** ✅ Phase 0 Complete (pending DB setup)

**No blockers** — all dependencies resolve, server boots, schema is correct.

**Next action:** Set up PostgreSQL and run `npx prisma migrate dev`.

**Estimated time to Phase 1 start:** 5-10 minutes (database setup + migration)

---

## Notes for Future Phases

### Phase 2: Onboarding
- Use the existing Profile schema
- Server-side MIME validation for logo uploads (client-side is not validation)
- PH holidays: hardcode a JSON list for 2026 before launch

### Phase 3: Dashboard
- Auto vs Manual projection: visually distinguish them in the UI
- Auto mode fabricates data that looks identical to manual logs — this is a trust problem if not clearly indicated

### Phase 4: Diary
- No external AI/API — everything is deterministic mustache templates
- Template preview is client-side (no network call) for instant feedback

### Phase 5: Reports
- Server-side file size/MIME validation (max 8 photos, 1MB each)
- In-memory buffer is fine for v1 given the caps; flag as a limit if photo cap increases

### Phase 7: Production Hardening
- File storage decision: local disk won't survive most PaaS restarts — needs S3-compatible storage if not on a persistent VM
- JWT access tokens survive logout for up to 15 min (acceptable, but the team must know this is the actual security boundary)

---

## Support

- See **SETUP.md** for detailed setup instructions
- See **STATUS.md** for phase-by-phase implementation status
- See **README.md** for project overview

---

**Phase 0 is ready. Complete the database setup, then proceed to Phase 1.**
