
const config = {
  frontURL_PROD: import.meta.env.VITE_BACKEND_URL_PROD,
  frontURL_DEV: import.meta.env.VITE_BACKEND_URL_DEV,
  environment: import.meta.env.VITE_ENVIRONMENT,
}

export const apiLink = config.environment === "PRODUCTION"? "/api" : config.frontURL_DEV