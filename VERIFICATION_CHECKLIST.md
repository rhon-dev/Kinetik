# Phase 0 Verification Checklist

Use this checklist to verify Phase 0 is complete before proceeding to Phase 1.

---

## ✅ Files Created

- [x] Root workspace structure (`/server`, `/client`)
- [x] Root `package.json` with npm workspaces
- [x] `.gitignore` protecting secrets and build artifacts
- [x] Documentation: README, QUICKSTART, SETUP, STATUS, PHASE_0_COMPLETE, PROJECT_STRUCTURE

---

## ✅ Server Setup

### Dependencies Installed
- [x] Express (4.18.2)
- [x] Prisma Client + Prisma CLI (5.22.0)
- [x] bcrypt (5.1.1)
- [x] jsonwebtoken (9.0.2)
- [x] express-rate-limit (7.1.5)
- [x] zod (3.22.4)
- [x] multer (1.4.5)
- [x] docx (8.5.0)
- [x] pdfkit (0.14.0)
- [x] mustache (4.2.0)
- [x] cors, dotenv, cookie-parser
- [x] ESLint + Prettier

### Files Created
- [x] `server/src/index.js` — Server entry point
- [x] `server/prisma/schema.prisma` — Complete DB schema (6 models)
- [x] `server/prisma/seed.js` — Seed utilities
- [x] `server/.env` — Environment variables
- [x] `server/.env.example` — Environment template
- [x] `server/package.json` — Dependencies and scripts
- [x] `server/.eslintrc.json` — Linting rules
- [x] `server/.prettierrc.json` — Formatting rules

### Verification
- [x] All imports resolve correctly (verified)
- [x] Server boots without errors (verified on port 5001)
- [x] Health check endpoint implemented (`GET /api/health`)
- [x] CORS configured (`CLIENT_ORIGIN`, `credentials: true`)
- [x] Global error handler (no stack traces in prod)

---

## ✅ Client Setup

### Dependencies Installed
- [x] React (18.2.0) + React DOM
- [x] React Router DOM (6.21.1)
- [x] axios (1.6.5)
- [x] Vite (5.0.11) + React plugin
- [x] ESLint + Prettier

### Files Created
- [x] `client/src/main.jsx` — React entry point
- [x] `client/src/App.jsx` — Root component with health check UI
- [x] `client/src/index.css` — Base styles
- [x] `client/src/lib/api.js` — Axios instance with credentials
- [x] `client/index.html` — HTML template
- [x] `client/vite.config.js` — Vite config with proxy
- [x] `client/package.json` — Dependencies and scripts
- [x] `client/.env` — API URL
- [x] `client/.env.example` — Environment template
- [x] `client/.eslintrc.json` — React linting rules
- [x] `client/.prettierrc.json` — Formatting rules

---

## ⚠️ Database Setup (YOU MUST DO)

### PostgreSQL Installation
- [ ] PostgreSQL 14+ installed and running
- [ ] Database `kinetik` created
- [ ] Connection verified (test with `psql`)

### Environment Configuration
- [ ] `server/.env` updated with correct `DATABASE_URL`
- [ ] Database credentials tested

### Prisma Migration
- [ ] `npx prisma generate` succeeded
- [ ] `npx prisma migrate dev --name init` succeeded
- [ ] Migration files created in `server/prisma/migrations/`
- [ ] All 6 tables created: users, refresh_tokens, profiles, time_logs, diary_entries, phrase_templates

---

## ⚠️ Server Boot Test (YOU MUST DO)

- [ ] Server starts without errors: `cd server && npm run dev`
- [ ] Server logs show: "✓ Kinetik API running on http://localhost:5001"
- [ ] Health check accessible: `curl http://localhost:5001/api/health`
- [ ] Response: `{"status":"ok","timestamp":"...","service":"kinetik-api"}`

---

## ⚠️ Client Boot Test (YOU MUST DO)

- [ ] Client starts without errors: `cd client && npm run dev`
- [ ] Client logs show: "Local: http://localhost:5173"
- [ ] No console errors in terminal
- [ ] Vite compiles successfully

---

## ⚠️ End-to-End Test (YOU MUST DO)

- [ ] Both servers running simultaneously
- [ ] Open http://localhost:5173 in browser
- [ ] Page loads without errors
- [ ] See "Kinetik" heading
- [ ] See "✓ Server connected: kinetik-api" (green box)
- [ ] See timestamp
- [ ] No console errors in browser DevTools

---

## 🚫 If Any Test Fails

**DO NOT PROCEED TO PHASE 1** until all checkboxes above are marked.

### Common Issues

**Prisma migration fails:**
- Check PostgreSQL is running: `brew services list` or `docker ps`
- Verify DATABASE_URL in `server/.env`
- Test connection: `psql "postgresql://user:pass@localhost:5432/kinetik"`

**Server won't start:**
- Check port 5001 is free: `lsof -i :5001`
- Check .env file exists: `ls server/.env`
- Check for import errors in terminal

**Health check fails in browser:**
- Verify server is running on port 5001
- Check browser console for CORS errors
- Verify `CLIENT_ORIGIN` in `server/.env` is `http://localhost:5173`

**"Module not found" errors:**
```bash
npm install
cd server && npm install
cd ../client && npm install
```

---

## ✅ Phase 0 Complete When:

- All checkboxes above are marked [x]
- Server boots cleanly
- Client boots cleanly
- Health check shows green in browser
- No errors in terminal or browser console

---

## 🎯 Ready for Phase 1?

Once all items above are verified, you're ready to proceed to **Phase 1: Authentication**.

Phase 1 will implement:
- User signup with bcrypt password hashing
- Login with JWT access + refresh tokens (httpOnly cookies)
- Token refresh endpoint (rotate old token, issue new)
- Logout with server-side revocation
- Rate limiting (5 attempts / 10 min / IP)
- Signup/Login pages
- Auth context and route guards

**Phase 1 is a launch-blocker** — do not skip comprehensive testing:
- Signup → Login → Refresh → Logout cycle
- Password never returned in API responses
- Rate limiting verified with burst test
- Refresh token rotation prevents replay attacks

---

## Commands Reference

```bash
# Start both servers
npm run dev

# Start server only
cd server && npm run dev

# Start client only
cd client && npm run dev

# Run migrations
cd server && npx prisma migrate dev

# Open database GUI
cd server && npx prisma studio

# Test health check
curl http://localhost:5001/api/health

# Check PostgreSQL status (macOS)
brew services list

# Check Docker containers
docker ps
```

---

**Mark all checkboxes before proceeding. Good luck!**
