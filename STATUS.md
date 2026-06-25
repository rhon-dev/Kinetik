# Kinetik Development Status

**Last Updated:** Phase 0 Complete

---

## ✅ Phase 0: Scaffolding & Environment — COMPLETE

### What Was Built

#### Project Structure
```
/Kinetik
├── /server                 - Express API
│   ├── /src
│   │   └── index.js       - Server entry point with health check
│   ├── /prisma
│   │   ├── schema.prisma  - Complete DB schema (all phases)
│   │   └── seed.js        - Seed utilities
│   ├── .env.example       - Environment template
│   ├── .env               - Development config (MODIFY DATABASE_URL!)
│   └── package.json       - All server dependencies installed
├── /client                - React + Vite frontend
│   ├── /src
│   │   ├── main.jsx       - React entry point
│   │   ├── App.jsx        - Root component with health check
│   │   ├── index.css      - Base styles
│   │   └── /lib
│   │       └── api.js     - Axios instance (withCredentials: true)
│   ├── index.html         - HTML template
│   ├── vite.config.js     - Vite config with proxy
│   ├── .env.example       - Client env template
│   ├── .env               - API URL config
│   └── package.json       - All client dependencies installed
├── package.json           - Root workspace config
├── .gitignore             - Ignores node_modules, .env, uploads
├── README.md              - Project overview
├── SETUP.md               - Setup instructions
└── STATUS.md              - This file
```

#### Dependencies Installed

**Server:**
- ✅ express (4.18.2)
- ✅ cors, dotenv, cookie-parser
- ✅ @prisma/client, prisma (5.22.0)
- ✅ bcrypt (5.1.1)
- ✅ jsonwebtoken (9.0.2)
- ✅ express-rate-limit (7.1.5)
- ✅ zod (3.22.4)
- ✅ multer (1.4.5-lts.1)
- ✅ docx (8.5.0)
- ✅ pdfkit (0.14.0)
- ✅ mustache (4.2.0)
- ✅ ESLint + Prettier

**Client:**
- ✅ react (18.2.0)
- ✅ react-dom (18.2.0)
- ✅ react-router-dom (6.21.1)
- ✅ axios (1.6.5)
- ✅ vite (5.0.11)
- ✅ @vitejs/plugin-react
- ✅ ESLint + Prettier

#### Database Schema (Prisma)

Complete schema covering all phases:
- ✅ `User` — id, email, passwordHash, fullName
- ✅ `RefreshToken` — JWT refresh token storage with revocation
- ✅ `Profile` — onboarding data (school, company, target hours, holidays)
- ✅ `TimeLog` — daily hour logging (unique per user+date)
- ✅ `DiaryEntry` — activity log entries
- ✅ `PhraseTemplate` — user-saved diary templates

#### API Endpoints (Phase 0)

- ✅ `GET /api/health` — Returns 200 with service name and timestamp
- ✅ `GET /` — Welcome message
- ✅ CORS configured to CLIENT_ORIGIN only, credentials: true
- ✅ Global error handler (hides stack traces in production)

#### Configuration

- ✅ `.env` files for server and client
- ✅ ESLint + Prettier on both ends
- ✅ Vite proxy for `/api` → `http://localhost:5000`
- ✅ JWT secrets configured (CHANGE IN PRODUCTION!)
- ✅ File upload limits configured (1MB max)

### Verification Status

- ✅ Dependencies installed (`npm install` succeeded)
- ✅ Prisma Client generated
- ⚠️ **Database migration pending** — Requires running PostgreSQL
- ⚠️ **Server boot test pending** — Need to start server
- ⚠️ **Client boot test pending** — Need to start client
- ⚠️ **Health check test pending** — Need running servers

### Before Proceeding to Phase 1

**YOU MUST:**

1. **Set up PostgreSQL:**
   - Local: `brew install postgresql@14 && createdb kinetik`
   - Docker: `docker run --name kinetik-postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=kinetik -p 5432:5432 -d postgres:14`
   - Cloud: Create database on Supabase/Neon/etc.

2. **Update `server/.env`:**
   ```env
   DATABASE_URL="postgresql://user:pass@localhost:5432/kinetik?schema=public"
   ```

3. **Run migrations:**
   ```bash
   cd server
   npx prisma migrate dev --name init
   ```
   Expected: ✔ Generated Prisma Client, ✔ Applied migrations

4. **Start servers:**
   ```bash
   npm run dev
   ```
   Expected: Server on :5000, Client on :5173

5. **Verify health check:**
   Open http://localhost:5173
   Expected: ✓ Server connected: kinetik-api

**IF ANY STEP FAILS, DO NOT PROCEED.** Fix the issue first.

---

## 🚧 Phase 1: Authentication — NOT STARTED

### Planned Implementation

#### Schema (Already Created)
- User table with bcrypt password hashing (cost 12)
- RefreshToken table for secure token rotation

#### Endpoints (To Be Built)
- `POST /api/auth/signup` — Register new user
- `POST /api/auth/login` — Issue access + refresh tokens (httpOnly cookies)
- `POST /api/auth/refresh` — Rotate refresh token
- `POST /api/auth/logout` — Revoke refresh token server-side
- `GET /api/auth/me` — Get current user
- Rate limiting: 5 attempts / 10 min / IP on login/signup

#### Frontend (To Be Built)
- Signup page (email, password, fullName)
- Login page
- Auth context/hook
- Route guard (unauthenticated → /login)
- Route guard (authenticated but not onboarded → /setup)

#### Security Requirements
- Password min 8 chars (stated as floor, not policy)
- bcrypt cost 12
- httpOnly cookies for tokens
- Access token: 15 min expiry
- Refresh token: 7 days, stored hashed
- Logout revokes refresh token (access token survives 15 min — acceptable)
- Password NEVER returned in responses
- Rate limiting verified with burst test

---

## 🚧 Phase 2: Onboarding / Setup Wizard — NOT STARTED

Schema: Profile table (already created)

Endpoints to build:
- `GET /api/profile`
- `PUT /api/profile` (partial updates supported)
- `POST /api/profile/logo` (multipart, 1MB max, MIME validation server-side)

Frontend:
- Setup wizard (single form or multi-step)
- Profile details, target hours (240/300/480/600/custom)
- Start date, hours per day, weekly work days
- PH holidays toggle (hardcoded JSON list for 2026)
- Redirects to dashboard after `onboardingComplete: true`

---

## 🚧 Phase 3: Time Logs & Dashboard — NOT STARTED

Schema: TimeLog table (already created)

Endpoints to build:
- `GET /api/timelogs?from=&to=`
- `POST /api/timelogs` (upsert on duplicate user+date)
- `PUT /api/timelogs/:id`, `DELETE /api/timelogs/:id`
- `GET /api/dashboard/summary` (percentComplete, daysLogged, dailyAvg, hoursRemaining)

Frontend:
- Circular progress ring (SVG animated)
- Stat cards
- Calendar grid (color-coded: logged, holiday, future, today)
- Manual/Auto projection toggle (visually distinct)
- "+" entry modal (date, hours, note)

---

## 🚧 Phase 4: Quick-Entry Logbook (Diary) — NOT STARTED

Schema: DiaryEntry, PhraseTemplate (already created)

Default templates:
- Coding, Debugging, Meeting, Documentation, Testing, Research, Admin

Endpoints to build:
- `GET /api/phrase-templates`
- `POST /api/phrase-templates` (save custom)
- `DELETE /api/phrase-templates/:id`
- `GET /api/diary`
- `POST /api/diary` (server composes text from template)
- `PUT /api/diary/:id`, `DELETE /api/diary/:id`
- `GET /api/diary/weekly-digest?from=&to=`

Frontend:
- Reverse-chron entry list
- Category chips → detail + tags → live preview → save
- "Save as my own phrase" toggle
- Weekly digest (bar/pie by category)

---

## 🚧 Phase 5: Reports & Export — NOT STARTED

Endpoints to build:
- `POST /api/reports/weekly` (DOCX or PDF)
- `POST /api/reports/photos` (multipart, max 8, 1MB each)

Frontend:
- By Date Range / Custom Days toggle
- Period start/end, previous accumulated hours
- Remarks textarea
- Photo picker (0/8 selected)
- Format toggle (DOCX/PDF)
- Export button (downloads file)

---

## 🚧 Phase 6: Settings — NOT STARTED

- Reuse Phase 2 setup form (pre-filled, editable)
- Change password (requires current password)
- Delete account (with confirmation, cascade deletes)
- Logout (real revoke endpoint)

---

## 🚧 Phase 7: Production Hardening — NOT STARTED

- [ ] Error handling: try/catch on all routes, no stack traces in prod
- [ ] Input validation: Zod schemas on all endpoints
- [ ] Structured logging (request id, user id, route, latency)
- [ ] File storage decision (local disk vs S3-compatible)
- [ ] Secrets: JWT never logged, rotated via env
- [ ] HTTPS enforced, `secure: true` cookies in prod
- [ ] Monitoring: uptime check, error-rate alerting
- [ ] Integration tests for auth + dashboard math

---

## Known Gaps (By Design)

- ❌ Email verification / password reset (flagged for real production)
- ❌ Multi-tenant admin/supervisor view (out of scope)
- ❌ Actual PH 2026 holiday list (hardcode before launch)
- ❌ Automated tests (scoped out, add if real users)

---

## Current Action Required

**Complete Phase 0 verification:**

1. Set up PostgreSQL
2. Run `npx prisma migrate dev` in `/server`
3. Start servers with `npm run dev`
4. Verify health check at http://localhost:5173

**Then proceed to Phase 1: Authentication**
