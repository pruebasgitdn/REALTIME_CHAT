const isDev = import.meta.env.MODE === "development";
console.log(import.meta.env.VITE_REACT_APP_BASE_DEV_URI);
console.log(import.meta.env.VITE_REACT_APP_BACKEND_PROD_URI);

export const API_BASE_URL = isDev
  ? import.meta.env.VITE_REACT_APP_BASE_DEV_URI
  : import.meta.env.VITE_REACT_APP_BACKEND_PROD_URI;

console.log("Entorno:", import.meta.env.MODE);
console.log("API Base URL:", API_BASE_URL);
