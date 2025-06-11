import axiosInstance from '../Authen/axiosInstance';

export const isAuthenticated = () => {
  return !!localStorage.getItem("token"); // true nếu có token
};


// LOGIN
export const LoginAccount = async (user) => {
  const response = await axiosInstance.post('/api/auth/login', user);
  const { token } = response.data;
  localStorage.setItem('token', token);
  return response.data;
};
export const cancelBookingWithReason = async (bookingId, reason) => {
    try {
        const response = await axiosInstance.put(`/api/bookings/${bookingId}/customer-cancel`, null, {
            params: { reason: reason.trim() }
        });
        return response.data;
    } catch (error) {
        if (error.response) {
            throw error.response.data;
        }
        throw { message: 'Lỗi kết nối server' };
    }
};

export const getStatusBookingByCarId = async (carId) => {
  try {
    const response = await axiosInstance.get(`/api/bookings/status-by-car/${carId}`);
    return response.data;
  } catch (error) {
    if (error.response?.status === 404) {
      // If no booking found, return null instead of throwing error
      return null;
    }
    throw error.response?.data || error.message || 'Lỗi kết nối server';
  }
};

export const cancelBookingByCarOwner = async (bookingId, reason) => {
  const response = await axiosInstance.put(`/api/bookings/${bookingId}/owner-cancel`, null, {
    params: { reason: reason.trim() }
  });
  return response.data;
};
export const refundDepositByCarOwner = async (bookingId) => {
  const response = await axiosInstance.post(`/api/bookings/${bookingId}/refund`);
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
export const getAdminProfile = async () => {
  const response = await axiosInstance.get('/api/admin/profile');
  return response.data;
};

// UPDATE PROFILE
export const UpdateProfileInfo = async (formData) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No token found');
    }

    console.log('Updating profile with data:', Object.fromEntries(formData));

    const response = await axiosInstance.put('/api/profile/update-info', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${token}`
      }
    });
    return response;
  } catch (error) {
    console.error('Update profile info error:', error);
    if (error.response?.data) {
      console.error('Error response data:', error.response.data);
    }
    throw error;
  }
};

export const updateAvatar = async (formData) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No token found');
    }

    const response = await axiosInstance.put('/api/profile/update-avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${token}`
      }
    });
    return response;
  } catch (error) {
    console.error('Update avatar error:', error);
    throw error;
  }
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
  const response = await axiosInstance.post('/api/cars/add-car', carData);
  return response.data;
};

export const addCarDetail = async (carId, detailData) => {
  const response = await axiosInstance.post(`/api/cars/addCarDetail/${carId}`, detailData);
  return response.data;
};

export const addCarImages = async (carId) =>{
  const response = await axiosInstance.post('/api/cars/add-images',carId);
  return response.data;
};

// Car Status Management
export const updateCarStatus = async (carId, status) => {
  const response = await axiosInstance.put(`/api/cars/${carId}/status`, { status });
  return response.data;
};

export const refundDeposit = async (carId) => {
  const response = await axiosInstance.post(`/api/cars/${carId}/refund`);
  return response.data;
};

export const deliverCar = async (carId) => {
  const response = await axiosInstance.post(`/api/cars/${carId}/deliver`);
  return response.data;
};

export const cancelDelivery = async (carId, reason) => {
  const response = await axiosInstance.post(`/api/cars/${carId}/cancel-delivery`, { reason });
  return response.data;
};

// Car Details and Images
export const getCarImages = async (carId) => {
  const response = await axiosInstance.get(`/api/cars/${carId}/images`);
  return response.data;
};

// Trong authen.jsx
export const addBrand = async ({ brandName}) => {
  const response = await axiosInstance.post('/api/cars/add-brand', {
    brandName
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

export const getCarByIdForCus = async (carId) => {
  const response = await axiosInstance.get(`/api/guest/car/${carId}`);
  return response.data;
};

export const getCarImagesByCarId = async (carId) => {
  const response = await axiosInstance.get(`/api/guest/car-images/${carId}`);
  return response.data;
};

export const getCars = async () => {
  const response = await axiosInstance.get('/api/guest/car/list');
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

export const getAllSegment = async () => {
  try {
    console.log('Fetching segments...');
    const response = await axiosInstance.get('/api/brand/segments/all');
    console.log('Segments API response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching segments:', error);
    return [];
  }
}
export const getAllCategory = async () => {
  try {
    console.log('Fetching categories...');
    const response = await axiosInstance.get('/api/brand/categories/all');
    console.log('Categories API response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
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

export const getCarDetailById = async (carId) => {
  const response = await axiosInstance.get(`/api/guest/car-detail/${carId}`);
  return response.data;
};

// BOOKING APIs
export const getCurrentBooking = async (carId) => {
  try {
    const response = await axiosInstance.get(`/api/bookings/car/${carId}/current`);
    return response.data;
  } catch (error) {
    console.error("Error fetching current booking:", error);
    throw error;
  }
};

export const createBooking = async (bookingData) => {
  const response = await axiosInstance.post('/api/bookings/create', bookingData);
  return response.data;
};

export const getTimeForDeposit = async (bookingId) => {
  const response = await axiosInstance.get(`/api/bookings/time-for-deposit/${bookingId}`);
  return response.data;
};

export const payBookingByWallet = async (bookingId) => {
  const response = await axiosInstance.post(`/api/bookings/${bookingId}/pay`);
  return response.data;
};

export const handleDeliverCar = async (bookingId) => {
  const response = await axiosInstance.post(`/api/bookings/${bookingId}/start-delivery`);
  return response.data;
};

export const confirmRentByOwner = async (bookingId) => {
  const response = await axiosInstance.post(`/api/bookings/${bookingId}/confirm-rent/owner`);
  return response.data;
};

export const confirmRentByCustomer = async (bookingId) => {
  const response = await axiosInstance.post(`/api/bookings/${bookingId}/confirm-rent/customer`);
  return response.data;
};

export const confirmReturnByOwner = async (bookingId) => {
  const response = await axiosInstance.post(`/api/bookings/${bookingId}/return/owner`);
  return response.data;
};

export const confirmReturnByCustomer = async (bookingId) => {
  const response = await axiosInstance.post(`/api/bookings/${bookingId}/return/customer`);
  return response.data;
};

export const cancelBooking = async (bookingId) => {
  const response = await axiosInstance.post(`/api/bookings/${bookingId}/cancel`);
  return response.data;
};

export const cancelBookingPending = async (bookingId, reason) => {
    try {
        const response = await axiosInstance.put(`/api/bookings/${bookingId}/cancel-when-pending`, null, {
            params: { reason: reason.trim() }
        });
        return response.data;
    } catch (error) {
        console.error('Cancel booking error:', error);
        if (error.response?.data) {
            const errorMessage = typeof error.response.data === 'string' 
                ? error.response.data 
                : error.response.data.message || 'Lỗi khi hủy đơn hàng';
            throw new Error(errorMessage);
        }
        throw new Error('Lỗi kết nối server');
    }
};

export const getBookingById = async (bookingId) => {
  const response = await axiosInstance.get(`/api/bookings/${bookingId}`);
  return response.data;
};

export const getMyBookings = async () => {
  const response = await axiosInstance.get('/api/bookings/my-bookings');
  return response.data;
};

export const getCarOwnerBookings = async () => {
  const response = await axiosInstance.get('/api/bookings/car-owner-bookings');
  return response.data;
};

export const getMyBookingsByStatus = async (status) => {
  const response = await axiosInstance.get('/api/bookings/my-bookings/filter', {
    params: { status }
  });
  return response.data;
};

// Car Status Management - These should now work with bookings
export const startDelivery = async (bookingId) => {
  const response = await axiosInstance.put(`/api/bookings/${bookingId}/delivering`);
  return response.data;
};

export const handleRefund = async (bookingId) => {
  const response = await axiosInstance.put(`/api/bookings/${bookingId}/cancel`);
  return response.data;
};

// VNPAY BOOKING PAYMENT
export const createVnPayBookingPayment = async (bookingId, amount) => {
  const response = await axiosInstance.get('/api/vnpay/create-booking-payment', {
    params: {
      bookingId,
      amount,
      bankCode: 'NCB',
      locale: 'vn'
    }
  });
  return response.data;
};
export const submitFeedback = async (bookingId, feedbackData) => {
  try {
      const response = await axiosInstance.post(`/api/bookings/${bookingId}/feedback`, feedbackData);
      return response.data;
  } catch (error) {
      throw error;
  }
}; 
// Car Delivery and Return Management
export const confirmDelivery = async (carId) => {
  const response = await axiosInstance.post(`/api/cars/${carId}/confirm-delivery`);
  return response.data;
};

export const confirmReturn = async (carId) => {
  const response = await axiosInstance.post(`/api/cars/${carId}/confirm-return`);
  return response.data;
};

// Car Status Management
export const setCarAvailable = async (carId, bookingId) => {
  const response = await axiosInstance.post(`/api/bookings/${bookingId}/car/${carId}/set-available`);
  return response.data;
};

export const setAvailableSatusForCar = async (carId) => {
  const response = await axiosInstance.put(`/api/cars/${carId}/set-available`);
  return response.data;
};

// Feedback
export const getCarFeedback = async (carId) => {
  const response = await axiosInstance.get(`/api/bookings/${carId}/feedback`);
  return response.data;
};

export const getAllCarFeedbacks = async (carId) => {
  const response = await axiosInstance.get(`/api/bookings/car/${carId}/all-feedbacks`);
  return response.data;
};

// OCR Verification
export const verifyCCCD = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await axiosInstance.post('/api/ocr/verify-cccd', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

export const getVerificationStatus = async () => {
  const response = await axiosInstance.get('/api/ocr/verification-status');
  return response.data;
};

export const getAccountStatus = async () => {
  try {
    const response = await axiosInstance.get('/api/profile/account-status');
    return response.data;
  } catch (error) {
    console.error('Error checking account status:', error);
    throw error;
  }
};

export const updateCarDetail = async (carId, detailData) => {
  const response = await axiosInstance.put(`/api/cars/update-car-detail/${carId}`, detailData);
  return response.data;
};

export const deleteCarImage = async (imageId) => {
  const response = await axiosInstance.delete(`/api/cars/delete-car-image/${imageId}`);
  return response.data;
};

export const updateCarImage = async (carId, imageFile) => {
  const formData = new FormData();
  formData.append('image', imageFile);
  const response = await axiosInstance.put(`/api/cars/${carId}/image`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

export const getCancellationReason = async (bookingId) => {
    try {
        const response = await axiosInstance.get(`/api/bookings/${bookingId}/cancellation-reason`);
        return response.data;
    } catch (error) {
        console.error('Error getting cancellation reason:', error);
        throw error;
    }
};

export const getFeedback = async (bookingId) => {
    try {
        const response = await axiosInstance.get(`/api/bookings/my-feedback/${bookingId}`);
        return response.data;
    } catch (error) {
        console.error('Error getting feedback:', error);
        throw error;
    }
};

export const getAllFeedbacksByCarId = async (carId) => {
  const response = await axiosInstance.get(`/api/bookings/cars/${carId}/feedbacks`);
  return response.data;
};

// Chat API endpoints
export const createChat = async (carId) => {
  try {
    const response = await axiosInstance.post(`/api/chats/car/${carId}`, {}, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getCustomerChats = async () => {
  try {
    const response = await axiosInstance.get('/api/chats/customer', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getCarOwnerChats = async () => {
  try {
    const response = await axiosInstance.get(`/api/chats/owner`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getProfileByAccountId = async (accountId) => {
  try {
    const response = await axiosInstance.get(`/api/profile/chat/${accountId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching profile by account ID:', error);
    throw error;
  }
};

export const getChatCUSMessage = async (chatId) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No token found');
    }
    console.log('Making API call to get messages for chat:', chatId);
    console.log('Using token:', token);
    const response = await axiosInstance.get(`/api/chats/${chatId}/messages`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('API response:', response);
    return response.data;
  } catch (error) {
    console.error('Error in getChatCUSMessage:', error);
    console.error('Error details:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    throw error;
  }
};

export const sendTextMessage = async (chatId, content) => {
  try {
    const response = await axiosInstance.post(`/api/chats/${chatId}/messages`, null, {
      params: {
        content: content
      },
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error sending text message:', error);
    throw error;
  }
};

export const sendImageMessage = async (formData) => {
  try {
    const response = await axiosInstance.post('/api/chats/upload-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error sending image:', error);
    throw error.response?.data || error.message || 'Lỗi khi gửi ảnh';
  }
};

export const getMessagesByChat = async (chatId) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No token found');
    }

    const response = await axiosInstance.get(`/api/chat/messages/${chatId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching messages:', error);
    throw error;
  }
};

// Thêm xe vào yêu thích
export const addFavoriteCar = async (carId) => {
  try {
    const response = await axiosInstance.post(`/api/favorites/${carId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Xóa xe khỏi yêu thích
export const removeFavoriteCar = async (carId) => {
  try {
    const response = await axiosInstance.delete(`/api/favorites/${carId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Lấy danh sách xe yêu thích
export const getFavoriteCars = async () => {
  try {
    const response = await axiosInstance.get('/api/favorites');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Kiểm tra xe có trong yêu thích không
export const checkFavoriteCar = async (carId) => {
  try {
    const response = await axiosInstance.get(`/api/favorites/check/${carId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Chat API endpoints
export const getChatsByCustomer = async () => {
  try {
    const response = await axiosInstance.get('/api/chats/customer');
    console.log('Customer chats response:', response.data); // Debug log
    return response.data;
  } catch (error) {
    console.error('Error fetching customer chats:', error);
    throw error;
  }
};

export const getChatsByCarOwner = async () => {
  try {
    const response = await axiosInstance.get('/api/chats/owner');
    console.log('Car owner chats response:', response.data); // Debug log
    return response.data;
  } catch (error) {
    console.error('Error fetching car owner chats:', error);
    throw error;
  }
};

// Province APIs
export const getAllProvinces = async () => {
  try {
    console.log('Fetching provinces...');
    const response = await axiosInstance.get('/api/profile/provinces');
    console.log('Provinces response:', response.data);
    if (!response.data) {
      throw new Error('No data received from provinces API');
    }
    return response.data;
  } catch (error) {
    console.error('Error fetching provinces:', error);
    if (error.response) {
      console.error('Error response:', error.response.data);
      console.error('Error status:', error.response.status);
    }
    throw error;
  }
};

export const getUserProvince = async () => {
  try {
    const response = await axiosInstance.get('/api/profile/province');
    return response.data;
  } catch (error) {
    console.error('Error getting user province:', error);
    throw error;
  }
};