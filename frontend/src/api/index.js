// Main API exports - centralized access point
export { default as axiosInstance } from './axiosInstance';
export { default as ENDPOINTS } from './endpoints';
export { default as authApi } from './authApi';
export { default as userApi } from './userApi';

// Re-export specific functions for convenience
export { authApi as auth } from './authApi';
export { userApi as user } from './userApi';