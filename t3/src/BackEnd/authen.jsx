import axios from 'axios';
import React from 'react'
const API_URL = 'http://localhost:8080';

// Gọi API đăng nhập
export const LoginAccount = async (user) => {
    const response = await axios.post(`${API_URL}/api/auth/login`, user,{withCredentials: true});
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
  
  export const GetProfile = async () => {
    const response = await axios.get(`${API_URL}/api/profile`, {
      withCredentials: true 
    });
    return response.data;
  };
  
  export async function UpdateProfile(data) {
    if (data) {
      return axios.put(`${API_URL}/api/profile/update`, data, {withCredentials: true}).then(res => res.data);
    } else {
      return axios.get(`${API_URL}/api/profile`,{withCredentials: true}).then(res => res.data);
    }
  }

// Upload avatar
// export const UploadFile = async () =>{
//   await axios.post(`${API_URL}/api/upload`);
// }
// authen.js
export const UploadFile = async (formData) => {
  const response = await axios.post(`${API_URL}/api/upload`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    withCredentials: true
  });
  return response.data; // giả sử backend trả lại URL của ảnh
};
export const fetchProfile = async () => {
  const response = await axios.get('http://localhost:8080/api/profile', {
    withCredentials: true
  });
  return response.data;
};
export const updateProfile = async (formData) => {
  await axios.put("http://localhost:8080/api/profile/update", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    withCredentials: true
  });
  
};

