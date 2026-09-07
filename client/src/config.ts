
// const config = {
//   frontURL_PROD: import.meta.env.VITE_BACKEND_URL_PROD,
//   frontURL_DEV: import.meta.env.VITE_BACKEND_URL_DEV,
//   environment: import.meta.env.VITE_ENVIRONMENT,
// }

// export const apiLink = config.environment === "PRODUCTION"? "/api" : config.frontURL_DEV

// The API is always reached through a same-origin /api prefix: the Vite dev
// server proxies it in development (vite.config.ts) and Vercel rewrites it in
// production (vercel.json). This keeps the auth cookie first-party and lets the
// app be opened from any device on the LAN without hardcoding a host.
export const apiLink = "/api"