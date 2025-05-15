// axiosInstance.js
import axios from 'axios';

const API_URL = 'http://localhost:8080';

const axiosInstance = axios.create({
  baseURL: API_URL,
});

// Interceptor để tự động thêm token vào header Authorization
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;
