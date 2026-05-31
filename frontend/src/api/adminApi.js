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

// Transaction Management

// Get all transactions with filters
export const getAllTransactions = async (filters = {}) => {
  const params = new URLSearchParams();
  
  if (filters.status) params.append('status', filters.status);
  if (filters.flagged) params.append('flagged', filters.flagged);
  if (filters.userId) params.append('userId', filters.userId);
  if (filters.startDate) params.append('startDate', filters.startDate);
  if (filters.endDate) params.append('endDate', filters.endDate);
  if (filters.page) params.append('page', filters.page);
  if (filters.limit) params.append('limit', filters.limit);
  
  const response = await axiosInstance.get(`${ADMIN_BASE}/transactions?${params.toString()}`);
  return response.data;
};

// Get single transaction
export const getTransactionById = async (id) => {
  const response = await axiosInstance.get(`${ADMIN_BASE}/transactions/${id}`);
  return response.data;
};

// Flag/unflag transaction
export const flagTransaction = async (id, flagged, adminNotes = '') => {
  const response = await axiosInstance.patch(`${ADMIN_BASE}/transactions/${id}/flag`, {
    flagged,
    adminNotes
  });
  return response.data;
};

// Add notes to transaction
export const addTransactionNotes = async (id, adminNotes) => {
  const response = await axiosInstance.patch(`${ADMIN_BASE}/transactions/${id}/notes`, {
    adminNotes
  });
  return response.data;
};

// Get transaction statistics
export const getTransactionStats = async (startDate, endDate) => {
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  
  const response = await axiosInstance.get(`${ADMIN_BASE}/transactions/stats/overview?${params.toString()}`);
  return response.data;
};
