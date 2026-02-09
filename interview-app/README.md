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

JWT_SECRET="some-long-random-string-at-least-32-chars"

GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback
FRONTEND_URL="http://localhost:5173"
API_URL="http://localhost:3000"
```

Replace:

- `<db_user>` with your local Postgres username
- `<db_password>` with its password
- `<db_name>` with a database you create for this project

---

### Frontend (`interview-app-client`)

Create a `.env` file in `interview-app-client` (see `.env.example`):

```env
# local = API at http://localhost:3000   prod = production Cloud Run API
VITE_ENV=local

# Same value as backend GOOGLE_CLIENT_ID (required for Sign in with Google)
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

To point the client at production instead of local, set `VITE_ENV=prod`. Set `VITE_GOOGLE_CLIENT_ID` to your Google OAuth client ID (same as the backend’s `GOOGLE_CLIENT_ID`). No code changes needed.

### Switching between local and production

- **Client**: In `interview-app-client/.env`, set `VITE_ENV=local` or `VITE_ENV=prod`. Restart the dev server after changing.
- **API**: In `interview-app-api/.env`, set `FRONTEND_URL` and `API_URL` to either local (`http://localhost:5173`, `http://localhost:3000`) or production (Cloud Run client and server URLs). Production values are set by Pulumi when deploying.

### Authentication (JWT + Google)

Auth is JWT-based (no cookies), so it works across different origins and on mobile.

- **Web**: User clicks “Sign in” → redirect to backend `/auth/google` → Google OAuth → backend redirects to frontend `/auth/callback?token=JWT` → frontend stores token and uses it on API requests via `Authorization: Bearer <token>`.
- **Mobile**: Use Google Sign-In SDK to get an ID token, then `POST /auth/google/token` with body `{ "credential": "<id-token>" }`. Response is `{ user, token }`. Store the token and send `Authorization: Bearer <token>` on all API requests.

For **Pulumi** deployments, set the JWT secret (replaces the previous session secret):

```bash
pulumi config set --secret jwt-secret "your-long-random-jwt-secret"
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

## Pushing to pulumi

### Client 

Note: pulumi bushes both frontend and backend images to cloud

```bash
cd interview-app/interview-app-client

docker build --no-cache \
  --build-arg VITE_GOOGLE_CLIENT_ID=831130136724-d1q8bm696ha0a6m1lerfe4jhcmsd77d7.apps.googleusercontent.com \
  -t us-east1-docker.pkg.dev/tech-lead-nyc/registry0-shared/interview-client:latest \
  -f Dockerfile \
  .

docker push us-east1-docker.pkg.dev/tech-lead-nyc/registry0-shared/interview-client:latest

cd pulumi

pulumi up

gcloud run deploy interview-app-client \
  --image us-east1-docker.pkg.dev/tech-lead-nyc/registry0-shared/interview-client:latest \
  --region us-east1 \
  --port 80



```

### Server 
```bash
cd interview-app/interview-app-api

docker build --no-cache \
  -t us-east1-docker.pkg.dev/tech-lead-nyc/registry0-shared/interview-server:latest \
  -f Dockerfile \
  .

docker push us-east1-docker.pkg.dev/tech-lead-nyc/registry0-shared/interview-server:latest

cd pulumi

pulumi up

gcloud run deploy interview-app-server \
  --image us-east1-docker.pkg.dev/tech-lead-nyc/registry0-shared/interview-server:latest \
  --region us-east1 \
  --platform managed \
  --allow-unauthenticated


```

## Connecting to DB proxy:

5423 or 5433 (if 5432 is in use)

```bash
cloud-sql-proxy tech-lead-nyc:us-east1:db0 --port <PORT>
```