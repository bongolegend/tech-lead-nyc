/**
 * Environment-based API URL. Switch between local and prod by setting VITE_ENV in .env:
 * - VITE_ENV=local  → API at http://localhost:3000 (or VITE_API_URL if set)
 * - VITE_ENV=prod  → Production Cloud Run API
 */
const PROD_API_URL = "https://interview-app-server-831130136724.us-east1.run.app";
const LOCAL_API_URL = "http://localhost:3000";

export const API_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.VITE_ENV === "prod" ? PROD_API_URL : LOCAL_API_URL);

/** Google Client ID for Sign-In (same as backend GOOGLE_CLIENT_ID). Set VITE_GOOGLE_CLIENT_ID in .env */
export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";
