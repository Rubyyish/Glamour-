import axiosInstance from './axiosInstance';

const ADMIN_BASE = '/admin';

// Get all users
export const getAllUsers = async () => {
  const response = await axiosInstance.get(`${ADMIN_BASE}/users`);
  return response.data;
};

// Get single user
export const getUserById = async (id) => {
  const response = await axiosInstance.get(`${ADMIN_BASE}/users/${id}`);
  return response.data;
};

// Update user
export const updateUser = async (id, userData) => {
  const response = await axiosInstance.put(`${ADMIN_BASE}/users/${id}`, userData);
  return response.data;
};

// Delete user
export const deleteUser = async (id) => {
  const response = await axiosInstance.delete(`${ADMIN_BASE}/users/${id}`);
  return response.data;
};

// Get dashboard stats
export const getAdminStats = async () => {
  const response = await axiosInstance.get(`${ADMIN_BASE}/stats`);
  return response.data;
};
