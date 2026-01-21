# NYC Tech Lead – Interview Questions App

This repo contains a small full-stack app for managing mock interview meetups and questions.

- **Backend**: Node.js, Express, Prisma, Postgres, Passport (Google OAuth)
- **Frontend**: Vite, React, TypeScript, Tailwind
- **CLI**: Commander + Prisma for seeding and managing data

---

## Prerequisites

You will need:

- Node.js 18+
- npm
- Postgres (local install)
- Google OAuth credentials (for auth)

---

## Environment Setup

### Backend (`interview-app-api`)

Create a `.env` file in `interview-app-api`:

```env
DATABASE_URL="postgresql://<db_user>:<db_password>@localhost:5432/<db_name>"

PORT=3000
NODE_ENV=development

SESSION_SECRET="some-long-random-string"

GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback
FRONTEND_URL="http://localhost:5173"
```

Replace:

- `<db_user>` with your local Postgres username
- `<db_password>` with its password
- `<db_name>` with a database you create for this project

---

### Frontend (`interview-app-client`)

Create a `.env` file in `interview-app-client`:

```env
API_URL="http://localhost:3000"
```

---

## Database Setup (Postgres)

### 1. Start Postgres

If installed locally:

```bash
brew services start postgresql
```

Or ensure your Postgres server is running by other means.

---

### 2. Create a database user (if needed)

Open the Postgres shell:

```bash
psql postgres
```

Then run:

```sql
CREATE USER interview_user WITH PASSWORD 'password';
CREATE DATABASE interview_app OWNER interview_user;
GRANT ALL PRIVILEGES ON DATABASE interview_app TO interview_user;
```

Update your `DATABASE_URL` accordingly.

---

### 3. Initialize Prisma

From `interview-app-api`:

```bash
npm install
npm run db:generate
npm run db:push
```

This creates the tables in Postgres.

---

## Running the Backend

From `interview-app-api`:

```bash
npm run dev
```

The backend runs on:

```env
http://localhost:3000
```

---

## Running the Frontend

From `interview-app-client`:

```bash
npm install
npm run dev
```

The frontend runs on:

```env
http://localhost:5173
```

---

## Using the CLI

The backend includes a CLI for managing meetups, questions, and rubric templates.

All CLI commands are run from **`interview-app-api`**.

### General format

```bash
npm run cli -- <command> [options]
```

---

## Create a Meetup

```bash
npm run cli -- add-meetup \
  --date "2026-02-01 18:30" \
  --title "Tech Lead NYC – Mock Interviews" \
  --description "Practice system design, behavioral, and coding interviews" \
  --location "New York, NY"
```

---

## List All Meetups

```bash
npm run cli -- list-meetups
```

You will see meetup IDs. You will need these IDs to add questions.

---

## Create an Interview Question

```bash
npm run cli -- add-question \
  --meetup-id 1 \
  --text "Design a URL shortening service like bit.ly." \
  --category systems-design \
  --order 1
```

Categories are free-form strings, but the UI expects:

- `systems-design`
- `behavioral`
- `coding`

---

## List All Interview Questions

```bash
npm run cli -- list-questions
```

Filter by meetup:

```bash
npm run cli -- list-questions --meetup-id 1
```

Filter by category:

```bash
npm run cli -- list-questions --category behavioral
```

---

## Auth Flow Notes

- Login is handled via Google OAuth on the backend
- The frontend initiates auth via redirect
- Sessions are stored server-side and validated via `/auth/me`
- No Google SDK is used on the frontend

---

## Development Notes

- Tailwind v4 is used with the Vite plugin
- No PostCSS config is required
- CLI uses Prisma directly and disconnects after each command

---
