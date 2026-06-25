# Kinetik Project Structure

Complete file tree showing all scaffolded files for Phase 0.

```
/Kinetik
│
├── 📄 README.md                    # Project overview
├── 📄 QUICKSTART.md                # 5-minute setup guide
├── 📄 SETUP.md                     # Detailed setup instructions
├── 📄 STATUS.md                    # Phase-by-phase development status
├── 📄 PHASE_0_COMPLETE.md          # Phase 0 completion summary
├── 📄 PROJECT_STRUCTURE.md         # This file
├── 📄 package.json                 # Root workspace config
├── 📄 package-lock.json            # Locked dependencies
├── 📄 .gitignore                   # Git ignore rules
│
├── 📁 .vscode/                     # VS Code workspace settings
│   └── 📄 settings.json            # Format on save, ESLint auto-fix
│
├── 📁 server/                      # Express API (Node.js + Prisma)
│   │
│   ├── 📁 src/
│   │   └── 📄 index.js             # Server entry point
│   │                               # - Health check endpoint
│   │                               # - CORS configured
│   │                               # - Global error handler
│   │
│   ├── 📁 prisma/
│   │   ├── 📄 schema.prisma        # Database schema (all 6 models)
│   │   ├── 📄 seed.js              # Seed utilities
│   │   └── 📁 migrations/          # Migration history (empty until you run migrate)
│   │       └── 📄 .gitkeep
│   │
│   ├── 📄 package.json             # Server dependencies
│   ├── 📄 .env                     # Environment variables (DO NOT COMMIT)
│   ├── 📄 .env.example             # Environment template
│   ├── 📄 .eslintrc.json           # ESLint config
│   └── 📄 .prettierrc.json         # Prettier config
│
└── 📁 client/                      # React + Vite frontend
    │
    ├── 📁 src/
    │   ├── 📄 main.jsx             # React entry point
    │   ├── 📄 App.jsx              # Root component with health check UI
    │   ├── 📄 index.css            # Base styles
    │   │
    │   └── 📁 lib/
    │       └── 📄 api.js           # Axios instance (withCredentials: true)
    │
    ├── 📄 index.html               # HTML template
    ├── 📄 vite.config.js           # Vite config with API proxy
    ├── 📄 package.json             # Client dependencies
    ├── 📄 .env                     # API URL (DO NOT COMMIT)
    ├── 📄 .env.example             # Environment template
    ├── 📄 .eslintrc.json           # ESLint config (React rules)
    └── 📄 .prettierrc.json         # Prettier config
```

---

## File Descriptions

### Root Files

| File | Purpose |
|------|---------|
| `README.md` | Project overview, stack, phase list |
| `QUICKSTART.md` | 5-minute setup guide for first-time users |
| `SETUP.md` | Detailed setup instructions with troubleshooting |
| `STATUS.md` | Phase-by-phase implementation status tracker |
| `PHASE_0_COMPLETE.md` | Phase 0 completion report with next steps |
| `package.json` | Root workspace config, npm scripts for both server/client |
| `.gitignore` | Protects secrets (.env), uploads, node_modules |

---

### Server Files (`/server`)

#### Core Files

| File | Purpose |
|------|---------|
| `src/index.js` | Express server with health check, CORS, error handling |
| `package.json` | Dependencies: Express, Prisma, bcrypt, JWT, zod, docx, pdfkit, multer, mustache |
| `.env` | Environment variables (DATABASE_URL, JWT secrets, PORT) |
| `.env.example` | Template for `.env` (safe to commit) |

#### Database (`/server/prisma`)

| File | Purpose |
|------|---------|
| `schema.prisma` | Complete schema: User, RefreshToken, Profile, TimeLog, DiaryEntry, PhraseTemplate |
| `seed.js` | Seed utilities (phrase templates created per-user on first use) |
| `migrations/` | Migration history (run `npx prisma migrate dev` to populate) |

#### Code Quality

| File | Purpose |
|------|---------|
| `.eslintrc.json` | Linting rules for Node.js/ES modules |
| `.prettierrc.json` | Code formatting rules (semi, single quotes, 100 char width) |

---

### Client Files (`/client`)

#### Core Files

| File | Purpose |
|------|---------|
| `src/main.jsx` | React 18 entry point (StrictMode) |
| `src/App.jsx` | Root component with health check test UI |
| `src/index.css` | Base styles (reset, typography) |
| `src/lib/api.js` | Axios instance with `withCredentials: true` for httpOnly cookies |
| `index.html` | HTML template with meta tags |
| `vite.config.js` | Vite config with `/api` → `http://localhost:5001` proxy |
| `package.json` | Dependencies: React, React Router, axios, Vite |
| `.env` | API URL configuration |

#### Code Quality

| File | Purpose |
|------|---------|
| `.eslintrc.json` | React-specific linting rules (react-hooks, JSX) |
| `.prettierrc.json` | Code formatting rules (JSX double quotes) |

---

## Database Schema (Prisma)

### Models

```prisma
User
├── id: String @id @default(uuid())
├── email: String @unique
├── passwordHash: String
├── fullName: String
├── createdAt: DateTime @default(now())
└── Relations: RefreshToken[], Profile, TimeLog[], DiaryEntry[], PhraseTemplate[]

RefreshToken (JWT refresh token storage)
├── id: String @id
├── userId: String (FK → User)
├── tokenHash: String
├── expiresAt: DateTime
├── revokedAt: DateTime?
└── createdAt: DateTime

Profile (onboarding/setup data)
├── id: String @id
├── userId: String @unique (FK → User)
├── school, company, companyLogoUrl, position, assignedOffice
├── courseYear, supervisorName
├── targetHours: Int
├── startDate: DateTime
├── hoursPerDayDefault: Float @default(8.0)
├── weeklyWorkDays: Json (array of weekday ints)
├── phHolidays: Json (array of {date, name, included})
├── onboardingComplete: Boolean @default(false)
└── createdAt, updatedAt

TimeLog (daily hour tracking)
├── id: String @id
├── userId: String (FK → User)
├── date: DateTime @db.Date
├── hoursLogged: Float
├── note: String? @db.Text
├── createdAt, updatedAt
└── @@unique([userId, date])

DiaryEntry (activity log)
├── id: String @id
├── userId: String (FK → User)
├── date: DateTime @db.Date
├── category: String
├── detail: String @db.Text
├── tags: Json? (array of strings)
├── composedText: String @db.Text
└── createdAt, updatedAt

PhraseTemplate (user-saved diary templates)
├── id: String @id
├── userId: String (FK → User)
├── category: String
├── templateText: String @db.Text (mustache-style placeholders)
├── isUserSaved: Boolean @default(false)
├── createdAt
└── lastUsedAt
```

---

## API Endpoints (Phase 0 Only)

| Method | Endpoint | Description | Status |
|--------|----------|-------------|--------|
| GET | `/` | Welcome message | ✅ |
| GET | `/api/health` | Health check (returns status, timestamp, service) | ✅ |

**CORS:** Configured to `CLIENT_ORIGIN` only, `credentials: true`

**Error Handling:** Global handler, no stack traces in production mode

---

## Environment Variables

### Server (`.env`)

```env
# Server
PORT=5001
NODE_ENV=development

# Database (UPDATE THIS!)
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/kinetik?schema=public"

# JWT (CHANGE IN PRODUCTION!)
JWT_SECRET="kinetik-dev-secret-change-in-production-2024"
JWT_REFRESH_SECRET="kinetik-dev-refresh-secret-change-in-production-2024"
JWT_ACCESS_EXPIRY="15m"
JWT_REFRESH_EXPIRY="7d"

# Client
CLIENT_ORIGIN="http://localhost:5173"

# File Storage
UPLOAD_DIR="./uploads"
MAX_FILE_SIZE=1048576
ALLOWED_MIME_TYPES="image/png,image/jpeg,image/jpg"
```

### Client (`.env`)

```env
VITE_API_URL=http://localhost:5001/api
```

---

## Dependencies

### Server (`server/package.json`)

#### Production
- `express` (4.18.2) — Web framework
- `@prisma/client` (5.22.0) — Database ORM
- `cors` — CORS middleware
- `dotenv` — Environment variables
- `cookie-parser` — Cookie parsing
- `bcrypt` (5.1.1) — Password hashing
- `jsonwebtoken` (9.0.2) — JWT generation/verification
- `express-rate-limit` (7.1.5) — Rate limiting
- `zod` (3.22.4) — Input validation
- `multer` (1.4.5-lts.1) — File uploads
- `docx` (8.5.0) — DOCX generation
- `pdfkit` (0.14.0) — PDF generation
- `mustache` (4.2.0) — Template engine

#### Development
- `prisma` (5.22.0) — Prisma CLI
- `eslint` (8.56.0) — Linting
- `prettier` (3.1.1) — Code formatting

### Client (`client/package.json`)

#### Production
- `react` (18.2.0), `react-dom` (18.2.0)
- `react-router-dom` (6.21.1) — Routing
- `axios` (1.6.5) — HTTP client

#### Development
- `vite` (5.0.11) — Build tool
- `@vitejs/plugin-react` — Vite React plugin
- `eslint` (8.56.0), `eslint-plugin-react`, `eslint-plugin-react-hooks`
- `prettier` (3.1.1)

---

## NPM Scripts

### Root (`package.json`)

```bash
npm run dev         # Start both server and client
npm run dev:server  # Start server only
npm run dev:client  # Start client only
npm run build       # Build client for production
npm run start       # Start production server
```

### Server (`server/package.json`)

```bash
npm run dev         # Start dev server with --watch
npm start           # Start production server
npm run db:migrate  # Run Prisma migrations
npm run db:studio   # Open Prisma Studio (DB GUI)
npm run db:seed     # Run seed script
npm run lint        # Run ESLint
npm run format      # Run Prettier
```

### Client (`client/package.json`)

```bash
npm run dev         # Start Vite dev server
npm run build       # Build for production
npm run preview     # Preview production build
npm run lint        # Run ESLint
npm run format      # Run Prettier
```

---

## Next Steps

Phase 0 is complete. Before Phase 1:

1. **Set up PostgreSQL** (see QUICKSTART.md)
2. **Update `server/.env` with DATABASE_URL**
3. **Run `npx prisma migrate dev --name init`**
4. **Start servers: `npm run dev`**
5. **Verify health check at http://localhost:5173**

Then proceed to **Phase 1: Authentication**.

---

## Notes

- All dependencies installed and verified
- Server boots successfully on port 5001
- Database schema ready (6 models covering all 7 phases)
- No external AI/API dependencies (deterministic by design)
- Security: httpOnly cookies, bcrypt cost 12, JWT rotation
- File uploads: server-side MIME/size validation
- Reports: DOCX + PDF generation ready
