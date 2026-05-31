import axiosInstance from './axiosInstance';

const FAVORITES_BASE = '/favorites';

// Get all favorites
export const getFavorites = async () => {
  const response = await axiosInstance.get(FAVORITES_BASE);
  return response.data;
};

// Add item to favorites
export const addToFavorites = async (itemData) => {
  const response = await axiosInstance.post(FAVORITES_BASE, itemData);
  return response.data;
};

// Remove item from favorites
export const removeFromFavorites = async (itemId) => {
  const response = await axiosInstance.delete(`${FAVORITES_BASE}/${itemId}`);
  return response.data;
};

// Toggle favorite status
export const toggleFavorite = async (itemData) => {
  const response = await axiosInstance.post(`${FAVORITES_BASE}/toggle`, itemData);
  return response.data;
};
