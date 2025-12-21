import axiosInstance from './axiosInstance';
import { ENDPOINTS } from './endpoints';

// Get all wardrobes for current user
export const getAllWardrobes = async () => {
  const response = await axiosInstance.get(ENDPOINTS.WARDROBE.GET_ALL);
  return response.data;
};

// Get single wardrobe by ID
export const getWardrobeById = async (id) => {
  const response = await axiosInstance.get(ENDPOINTS.WARDROBE.GET_BY_ID(id));
  return response.data;
};

// Create new wardrobe
export const createWardrobe = async (wardrobeData) => {
  const response = await axiosInstance.post(ENDPOINTS.WARDROBE.CREATE, wardrobeData);
  return response.data;
};

// Update wardrobe
export const updateWardrobe = async (id, wardrobeData) => {
  const response = await axiosInstance.put(ENDPOINTS.WARDROBE.UPDATE(id), wardrobeData);
  return response.data;
};

// Delete wardrobe
export const deleteWardrobe = async (id) => {
  const response = await axiosInstance.delete(ENDPOINTS.WARDROBE.DELETE(id));
  return response.data;
};

// Add item to wardrobe
export const addItemToWardrobe = async (id, itemData) => {
  const response = await axiosInstance.post(ENDPOINTS.WARDROBE.ADD_ITEM(id), itemData);
  return response.data;
};

// Remove item from wardrobe
export const removeItemFromWardrobe = async (id, itemId) => {
  const response = await axiosInstance.delete(ENDPOINTS.WARDROBE.REMOVE_ITEM(id, itemId));
  return response.data;
};

// Update item in wardrobe
export const updateItemInWardrobe = async (id, itemId, itemData) => {
  const response = await axiosInstance.put(ENDPOINTS.WARDROBE.UPDATE_ITEM(id, itemId), itemData);
  return response.data;
};

// Toggle favorite status
export const toggleItemFavorite = async (id, itemId) => {
  const response = await axiosInstance.patch(ENDPOINTS.WARDROBE.TOGGLE_FAVORITE(id, itemId));
  return response.data;
};
