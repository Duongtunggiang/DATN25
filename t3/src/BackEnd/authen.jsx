import axios from 'axios';
import React from 'react'
import axiosInstance from '../Authen/axiosInstance';
const API_URL = 'http://localhost:8080';

export const LoginAccount = async (user) => {
  const response = await axios.post(`${API_URL}/api/auth/login`, user);
  const { token } = response.data;
  localStorage.setItem('token', token); // Lưu token
  return response.data;
};

  
  // Gọi API đăng ký


export const RegisterAccount = async (user) => {
  const response = await axiosInstance.post('/api/auth/register', user);
  return response.data;
};

  
  //Gọi API đăng xuất
 export const LogoutAccount = async () => {
  localStorage.removeItem('token');
};

  
export const GetProfile = async () => {
  const token = localStorage.getItem('token');
  const response = await axios.get(`${API_URL}/api/profile`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
};


  
export async function UpdateProfile(data) {
  return axiosInstance.put('/api/profile/update', data).then(res => res.data);
}


export const UploadFile = async (formData) => {
  const response = await axiosInstance.post('/api/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

export const fetchProfile = async () => {
  const response = await axios.get('http://localhost:8080/api/profile', {
    withCredentials: true
  });
  return response.data;
};


export const ChangePassword = async (formData) => {
  const response = await axiosInstance.post('/api/auth/change-password', formData);
  return response.data;
};

// Carowner
// API để thêm xe
export const addCar = async (carData) => {
  const token = localStorage.getItem('token');
  const response = await axios.post('http://localhost:8080/api/cars/add', carData, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  return response.data;
};

export const getCarById = async (carId) => {
  const token = localStorage.getItem('token');
  const response = await axios.get(`http://localhost:8080/api/cars/${carId}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
};



export const getCars = async () => {
  const token = localStorage.getItem('token');
  const response = await axios.get('http://localhost:8080/api/cars/list', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
};



export const updateCar = async (carId, carData) => {
  const token = localStorage.getItem('token');
  const response = await axios.put(`http://localhost:8080/api/cars/update/${carId}`, carData, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
};


export const deleteCar = async (carId) => {
  const token = localStorage.getItem('token');
  const response = await axios.delete(`http://localhost:8080/api/cars/delete/${carId}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
};

