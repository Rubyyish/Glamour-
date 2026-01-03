import axiosInstance from './axiosInstance';
import { ENDPOINTS } from './endpoints';

// Authentication API functions
export const authApi = {
  // Register new user
  register: async (userData) => {
    try {
      const response = await axiosInstance.post(ENDPOINTS.AUTH.REGISTER, userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Login user
  login: async (credentials) => {
    try {
      const response = await axiosInstance.post(ENDPOINTS.AUTH.LOGIN, credentials);
      
      // Store token and user data in localStorage
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Logout user
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  },

  // Get current user from localStorage
  getCurrentUser: () => {
    try {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    } catch (error) {
      return null;
    }
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    const token = localStorage.getItem('token');
    return !!token;
  },

  // Get auth token
  getToken: () => {
    return localStorage.getItem('token');
  },

  // Forgot Password - Request reset token and OTP
  forgotPassword: async (email) => {
    try {
      const response = await axiosInstance.post(ENDPOINTS.AUTH.FORGOT_PASSWORD, { email });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Verify OTP
  verifyOTP: async (email, otp) => {
    try {
      const response = await axiosInstance.post(ENDPOINTS.AUTH.VERIFY_OTP, { email, otp });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Reset Password (with token from either email link or OTP verification)
  resetPassword: async (token, newPassword) => {
    try {
      const response = await axiosInstance.post(ENDPOINTS.AUTH.RESET_PASSWORD, {
        token,
        newPassword
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export default authApi;