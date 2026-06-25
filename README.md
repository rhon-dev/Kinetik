# Kinetik

**Continuous movement, career momentum.**

An internship/OJT hour-tracking web app designed for students to log work hours, maintain a quick-entry diary, and generate professional weekly reports.

## Stack

- **Backend:** Node.js + Express
- **Frontend:** React + Vite
- **Database:** PostgreSQL + Prisma ORM
- **Auth:** JWT (httpOnly cookies, access + refresh tokens)
- **Reports:** docx + pdfkit (DOCX/PDF export)

## Project Structure

```
/server   - Express API server
/client   - React + Vite frontend
```

## Setup

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL 14+
- A running Postgres instance

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables (see `.env.example` in `/server` and `/client`)

3. Set up the database:
   ```bash
   cd server
   npx prisma migrate dev
   ```

4. Start development servers:
   ```bash
   npm run dev
   ```

Server runs on `http://localhost:5000`  
Client runs on `http://localhost:5173`

## Development Phases

- [x] Phase 0: Scaffolding & Environment
- [ ] Phase 1: Auth (signup, login, refresh, logout)
- [ ] Phase 2: Onboarding / Setup Wizard
- [ ] Phase 3: Time Logs & Dashboard
- [ ] Phase 4: Quick-Entry Logbook (Diary)
- [ ] Phase 5: Reports & Export
- [ ] Phase 6: Settings
- [ ] Phase 7: Production Hardening

## License

Private project.
