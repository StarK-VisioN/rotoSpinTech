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
    POST: "/api/sap-products",
    PUT: (sap_name) => `/api/sap-products/${sap_name}`,
    DELETE: (sap_name) => `/api/sap-products/${sap_name}`,
  },
  COLORS: {
    GET: "/api/colors",
    POST: "/api/colors",
    DELETE: (id) => `/api/colors/${id}`,
  },
  MATERIALS: {
    GET: "/api/materials",
    POST: "/api/materials",
    PUT: (id) => `/api/materials/${id}`,
    DELETE: (id) => `/api/materials/${id}`,
  },
  PREDICTION: {
    SALES: '/api/prediction/sales',
    INVENTORY: '/api/prediction/inventory',
    MATERIALS: '/api/prediction/materials',
    FORECAST: '/api/prediction/forecast',
  },
};