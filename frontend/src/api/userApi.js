import axiosInstance from './axiosInstance';
import { ENDPOINTS } from './endpoints';

// User API functions
export const userApi = {
  // Get all users
  getAllUsers: async () => {
    try {
      const response = await axiosInstance.get(ENDPOINTS.USERS.GET_ALL);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get user by ID
  getUserById: async (id) => {
    try {
      const response = await axiosInstance.get(ENDPOINTS.USERS.GET_BY_ID(id));
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update user
  updateUser: async (id, userData) => {
    try {
      const response = await axiosInstance.put(ENDPOINTS.USERS.UPDATE(id), userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Delete user
  deleteUser: async (id) => {
    try {
      const response = await axiosInstance.delete(ENDPOINTS.USERS.DELETE(id));
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export default userApi;