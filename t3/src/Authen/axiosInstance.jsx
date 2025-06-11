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
    console.log('Request interceptor - URL:', config.url);
    console.log('Request interceptor - Method:', config.method);
    console.log('Request interceptor - Token:', token);
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
      console.log('Request interceptor - Headers:', config.headers);
    } else {
      // Nếu không có token, chuyển hướng về trang đăng nhập
      if (window.location.pathname !== '/dang-nhap') {
        window.location.href = '/dang-nhap';
      }
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    let message = "Đã xảy ra lỗi";
    
    // Log full error response for debugging
    console.log('Full error response:', error.response);
    
    if (error.response) {
      // Try to get error details from response
      const responseData = error.response.data;
      console.log('Error response data:', responseData);
      
      if (responseData) {
        if (typeof responseData === 'string') {
          if (responseData.includes('RuntimeException')) {
            const match = responseData.match(/RuntimeException: ([^\n]*)/);
            if (match && match[1]) {
              message = match[1].trim();
            }
          } else {
            message = responseData;
          }
        } else if (responseData.error) {
          message = responseData.error;
        } else if (responseData.message) {
          message = responseData.message;
        }
      }
    }

    // Create a custom error with the extracted message
    const customError = new Error(message);
    customError.response = error.response;
    customError.customMessage = message;

    return Promise.reject(customError);
  }
);

export default axiosInstance;
