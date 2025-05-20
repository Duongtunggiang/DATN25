import axiosInstance from '../Authen/axiosInstance';

// LOGIN
export const LoginAccount = async (user) => {
  const response = await axiosInstance.post('/api/auth/login', user);
  const { token } = response.data;
  localStorage.setItem('token', token);
  return response.data;
};

// REGISTER
export const RegisterAccount = async (user) => {
  const response = await axiosInstance.post('/api/auth/register', user);
  return response.data;
};

// LOGOUT
export const LogoutAccount = async () => {
  localStorage.removeItem('token');
};

// GET PROFILE
export const GetProfile = async () => {
  const response = await axiosInstance.get('/api/profile');
  return response.data;
};

// UPDATE PROFILE
export const UpdateProfile = async (data) => {
  const response = await axiosInstance.put('/api/profile/update', data);
  return response.data;
};

// UPLOAD FILE
export const UploadFile = async (formData) => {
  const response = await axiosInstance.post('/api/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

// FETCH PROFILE (có withCredentials, giữ lại nếu backend yêu cầu cookie)
export const fetchProfile = async () => {
  const response = await axiosInstance.get('/api/profile', {
    withCredentials: true
  });
  return response.data;
};

// CHANGE PASSWORD
export const ChangePassword = async (formData) => {
  const response = await axiosInstance.post('/api/auth/change-password', formData);
  return response.data;
};

//Check CCCD ID
export const checkNationalId = async (nationalId) => {
  try {
    const response = await axiosInstance.get('/api/profile/check-nationalId', {
      params: { nationalId }
    });
    return response.data; 
  } catch (error) {
    console.error('Lỗi kiểm tra CCCD:', error);
    throw error;
  }
};

//Wallet 

export const getWalletBalance = async () => {
  const response = await axiosInstance.get('/api/wallet/balance');
  return response.data;
};

export const getTransactionHistory = async () => {
  const response = await axiosInstance.get('/api/wallet/transactions');
  return response.data;
};

export const depositMoney = async (amount) => {
  await axiosInstance.post('/api/wallet/deposit', { amount }); // gửi JSON body
};

export const withdrawMoney = async (amount) => {
  await axiosInstance.post('/api/wallet/withdraw', { amount }); // tương tự
};


// CARS
export const addCar = async (carData) => {
  // const token = localStorage.getItem('token');
  const response = await axiosInstance.post('/api/cars/add-car', carData);
  return response.data;
};
// Trong authen.jsx
export const addBrand = async ({ brandName, categoryId, segmentId }) => {
  const response = await axiosInstance.post('/api/cars/add-brand', {
    brandName,
    categoryId,
    segmentId
  });
  return response.data;
};

export const getBrandForCar = async (carId) => {
  const response = await axiosInstance.get(`/api/brand/car/${carId}`);
  return response.data;
};

export const getCarById = async (carId) => {
  const response = await axiosInstance.get(`/api/cars/${carId}`);
  return response.data;
};

export const getCars = async () => {
  const response = await axiosInstance.get('/api/cars/list');
  return response.data;
};

export const getMyCars = async () => {
  const response = await axiosInstance.get('/api/cars/my-cars');
  return response.data;
};

export const updateCar = async (carId, carData) => {
  const response = await axiosInstance.put(`/api/cars/update/${carId}`, carData);
  return response.data;
};

export const deleteCar = async (carId) => {
  const response = await axiosInstance.delete(`/api/cars/delete/${carId}`);
  return response.data;
};

export const getAllbrand = async () =>{
  const response = await axiosInstance.get('/api/brand/all');
  return response.data;
}

export const getAllSegment = async ()=>{
  const response = await axiosInstance.get('/api/segments');
  return response.data;
}

export const getAllCategory = async () => {
  const response = await axiosInstance.get('/api/categories');
  return response.data;
}

// CHATBOT
export const sendChatMessage = async (message) => {
  const response = await axiosInstance.post('/api/chatbot/ask', { message });
  return response.data;
};

export const getChatMessages = async () => {
  const response = await axiosInstance.get('/api/chatbot/messages');
  return response.data;
};
