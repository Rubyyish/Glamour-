// API Endpoints
export const ENDPOINTS = {
  // Authentication
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    PROFILE: '/auth/profile',
    FORGOT_PASSWORD: '/auth/forgot-password',
    VERIFY_OTP: '/auth/verify-otp',
    RESET_PASSWORD: '/auth/reset-password',
  },
  
  // Users
  USERS: {
    GET_ALL: '/users',
    GET_BY_ID: (id) => `/users/${id}`,
    UPDATE: (id) => `/users/${id}`,
    DELETE: (id) => `/users/${id}`,
  },
  
  // Products (example for future use)
  PRODUCTS: {
    GET_ALL: '/products',
    GET_BY_ID: (id) => `/products/${id}`,
    CREATE: '/products',
    UPDATE: (id) => `/products/${id}`,
    DELETE: (id) => `/products/${id}`,
    SEARCH: '/products/search',
  },
  
  // Orders (example for future use)
  ORDERS: {
    GET_ALL: '/orders',
    GET_BY_ID: (id) => `/orders/${id}`,
    CREATE: '/orders',
    UPDATE: (id) => `/orders/${id}`,
    DELETE: (id) => `/orders/${id}`,
    GET_USER_ORDERS: (userId) => `/orders/user/${userId}`,
  },

  // Wardrobes
  WARDROBE: {
    GET_ALL: '/wardrobe',
    GET_BY_ID: (id) => `/wardrobe/${id}`,
    CREATE: '/wardrobe',
    UPDATE: (id) => `/wardrobe/${id}`,
    DELETE: (id) => `/wardrobe/${id}`,
    ADD_ITEM: (id) => `/wardrobe/${id}/items`,
    REMOVE_ITEM: (id, itemId) => `/wardrobe/${id}/items/${itemId}`,
    UPDATE_ITEM: (id, itemId) => `/wardrobe/${id}/items/${itemId}`,
    TOGGLE_FAVORITE: (id, itemId) => `/wardrobe/${id}/items/${itemId}/favorite`,
  },
};

export default ENDPOINTS;