export const BASE_URL = import.meta.env.VITE_APP_BACKEND_URL;

export const API_PATHS = {
  AUTH: {
    REGISTER: "/api/auth/signup",
    LOGIN: "/api/auth/login",
    GET_PROFILE: "/api/auth/profile",
  },
  STAFF: {
    GET: "/api/staff",
    POST: "/api/staff",
    PUT: (id) => `/api/staff/${id}`,
    DELETE: (id) => `/api/staff/${id}`,
  },
  ENTRY_PRODUCTS: {
    GET: "/api/entry-products",
    POST: "/api/entry-products",
    PUT: (id) => `/api/entry-products/${id}`,
    DELETE: (id) => `/api/entry-products/${id}`,
  },
  SAP_PRODUCTS: {
    GET: "/api/sap-products",
  },
  PREDICTION: {
    SALES: '/api/prediction/sales',
    INVENTORY: '/api/prediction/inventory',
    MATERIALS: '/api/prediction/materials',
    FORECAST: '/api/prediction/forecast',
  },
};