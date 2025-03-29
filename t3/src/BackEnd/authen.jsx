import axios from 'axios';
import React from 'react'
const API_URL = 'http://localhost:8080';

// Gọi API đăng nhập
export const LoginAccount = async (user) => {
    const response = await axios.post(`${API_URL}/api/auth/login`, user);
    return response.data; // Chắc chắn rằng API trả về dữ liệu đúng
  };
  
  // Gọi API đăng ký
  export const RegisterAccount = async (user) => {
    const response = await axios.post(`${API_URL}/api/auth/register`, user);
    return response.data;  // Chắc chắn rằng API trả về thông báo thành công
  };
  
  //Gọi API đăng xuất
  export const LogoutAccount = async () => {
    await axios.post(`${API_URL}/api/auth/logout`);
  };
  
  // export const GetProfile = async () => {
  //   await axios.get(`${API_URL}/api/auth/get-profile`);
  // }