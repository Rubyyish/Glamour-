import axios from 'axios';

// Create axios instance with base configuration
const axiosInstance = axios.create({
  baseURL: `${(import.meta.env.VITE_API_URL || 'http://localhost:5001').replace(/\/$/, '')}/api`,
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('🔑 Token attached to request:', token.substring(0, 20) + '...');
    } else {
      console.warn('⚠️ No token found in localStorage');
    }
    console.log('📤 Request:', config.method.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
axiosInstance.interceptors.response.use(
  (response) => {
    console.log('✅ Response:', response.config.method.toUpperCase(), response.config.url, response.status);
    return response;
  },
  (error) => {
    // Log detailed error information
    if (error.response) {
      console.error('❌ Response error:', {
        status: error.response.status,
        url: error.config?.url,
        message: error.response.data?.message,
        data: error.response.data
      });
      
      // Handle 401 errors
      if (error.response.status === 401) {
        console.warn('🔒 401 Unauthorized - Authentication required');
        
        // Check if token exists
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('❌ No token in localStorage - user needs to login');
        } else {
          console.error('❌ Token exists but was rejected by server');
          console.log('Token preview:', token.substring(0, 30) + '...');
        }
      }
    } else if (error.request) {
      console.error('❌ No response received:', error.request);
    } else {
      console.error('❌ Request setup error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;