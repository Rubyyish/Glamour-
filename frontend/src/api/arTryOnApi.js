import axiosInstance from './axiosInstance';

// ============================================
// Texture Processing APIs
// ============================================

/**
 * Process an image into a seamless texture for a garment
 */
export const processGarmentTexture = async (imageFile, garmentType = 'sweatshirt') => {
  try {
    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('garment', garmentType);

    const response = await axiosInstance.post('/ar-tryon/process-garment', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error processing garment texture:', error);
    throw error.response?.data || { success: false, message: 'Failed to process garment texture' };
  }
};

/**
 * Get the latest processed texture
 */
export const getLatestTexture = async () => {
  try {
    const response = await axiosInstance.get('/ar-tryon/latest-texture', {
      responseType: 'blob'
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching latest texture:', error);
    throw error.response?.data || { success: false, message: 'Failed to fetch texture' };
  }
};

/**
 * Get latest texture configuration (garment type, version)
 */
export const getLatestTextureConfig = async () => {
  try {
    const response = await axiosInstance.get('/ar-tryon/latest-config');
    return response.data;
  } catch (error) {
    console.error('Error fetching texture config:', error);
    throw error.response?.data || { success: false, message: 'Failed to fetch config' };
  }
};

/**
 * Update garment type configuration
 */
export const updateTextureConfig = async (garmentType) => {
  try {
    const response = await axiosInstance.post('/ar-tryon/latest-config', {
      garment: garmentType
    });
    return response.data;
  } catch (error) {
    console.error('Error updating texture config:', error);
    throw error.response?.data || { success: false, message: 'Failed to update config' };
  }
};

/**
 * Save processed texture to user profile
 */
export const saveTextureToProfile = async (filename, garmentType, description = '') => {
  try {
    const response = await axiosInstance.post('/ar-tryon/save-texture', {
      filename,
      garmentType,
      description
    });
    return response.data;
  } catch (error) {
    console.error('Error saving texture:', error);
    throw error.response?.data || { success: false, message: 'Failed to save texture' };
  }
};

/**
 * Get all textures for current user
 */
export const getUserTextures = async () => {
  try {
    const response = await axiosInstance.get('/ar-tryon/my-textures');
    return response.data;
  } catch (error) {
    console.error('Error fetching user textures:', error);
    throw error.response?.data || { success: false, message: 'Failed to fetch textures' };
  }
};

/**
 * Delete a saved texture
 */
export const deleteTexture = async (textureId) => {
  try {
    const response = await axiosInstance.delete(`/ar-tryon/textures/${textureId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting texture:', error);
    throw error.response?.data || { success: false, message: 'Failed to delete texture' };
  }
};

// ============================================
// AR Try-On Photo APIs
// ============================================

// Save AR try-on photo
export const saveARPhoto = async (photoData) => {
  try {
    const response = await axiosInstance.post('/ar-tryon/save', photoData);
    return response.data;
  } catch (error) {
    console.error('Error saving AR photo:', error);
    throw error.response?.data || { success: false, message: 'Failed to save AR photo' };
  }
};

// Get all AR try-on photos
export const getARPhotos = async () => {
  try {
    const response = await axiosInstance.get('/ar-tryon/photos');
    return response.data;
  } catch (error) {
    console.error('Error fetching AR photos:', error);
    throw error.response?.data || { success: false, message: 'Failed to fetch AR photos' };
  }
};

// Delete AR try-on photo
export const deleteARPhoto = async (photoId) => {
  try {
    const response = await axiosInstance.delete(`/ar-tryon/photos/${photoId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting AR photo:', error);
    throw error.response?.data || { success: false, message: 'Failed to delete AR photo' };
  }
};

// Check if user has tried on a specific item
export const checkItemTried = async (itemName) => {
  try {
    const response = await axiosInstance.get(`/ar-tryon/check/${encodeURIComponent(itemName)}`);
    return response.data;
  } catch (error) {
    console.error('Error checking item tried:', error);
    throw error.response?.data || { success: false, message: 'Failed to check item' };
  }
};

