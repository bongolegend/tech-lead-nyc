/// <reference types="vite/client" />
declare module "@vitejs/plugin-react";
declare module "@tailwindcss/vite";

interface ImportMetaEnv {
  readonly VITE_ENV: "local" | "prod";
  readonly VITE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
