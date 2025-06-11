import React, { useState, useEffect } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import HomeCom from './Component/HomeCom';
import ProfileComponent from './Component/ProfileComponent';
import PrivateRoute from './Component/PrivateRoute';
import RegisterComponent from './Component/RegisterComponent';
import LoginComponent from './Component/LoginComponent';
import EditProfile from './Component/EditProfile';
import ChangePasswordComponent from './Component/ChangePassword';
import RegisCarOwner from './Component/RegisCarOwner';
import HomeXeComp from './Component/HomeXeComp';
import ChiTietXe from './Component/ChiTietXe';
import { AuthProvider } from './Authen/AuthContext';
import { ToastProvider } from './Alert/ToastContext';
import ChatPopup from './Component/ChatGroup';
import AddCarPage from './Component/AddCarPage';
import BinXe from './Component/BinXe';
import AdminDashboard from './Component/AdminDashboard';
import WalletComponent from './Component/WalletComponent';
import VnPayComponent from './Component/VnPayComponent';
import CarDetailComponent from './Component/CarDetailComponent';
import AddCarDetailComponent from './Component/AddCarDetailComponent';
import AddCarImageComponent from './Component/AddCarImageComponent';
import CarSuccessComponent from './Component/CarSuccessComponent';
import BookingComponent from './Component/BookingComponent';
import BookingDetailComponent from './Component/BookingDetailComponent';
import AboutComponent from './Component/About';
import MainLayout from './Component/Layouts/MainLayout';
import AllCars from './Component/AllCars';
import MyBookings from './Component/MyBookings';
import PaymentPage from './Component/PaymentPage';
import PaymentResult from './Component/PaymentResult';
import Feedback from './Component/Feedback';
import CancelBookingModal from './Component/CancelBookingModal';
import CancelPendingBookingModal from './Component/CancelPendingBookingModal';
import CarOwnerBookings from './Component/CarOwnerBookings';
import UpdateCarPage from './Component/UpdateCarPage';
import HowToWork from './Component/HowToWork';
import ChatPage from './Component/ChatPage';
import ChatList from './Component/ChatList';
import ChatLayout from './Component/Layout/ChatLayout';
import { Toaster } from 'react-hot-toast';

// Admin Components
import AdminUsers from './Component/Admin/AdminUsers';
import AdminCars from './Component/Admin/AdminCars';
import AdminTransactions from './Component/Admin/AdminTransactions';
import AdminProfile from './Component/Admin/AdminProfile';
import AdminBookings from './Component/Admin/AdminBookings';

// Customer Components
import SearchResults from './Component/Customer/SearchResults';
import Favorites from './Component/Customer/Favorites';
// import CustomerBookings from './Component/Customer/CustomerBookings';
// import BrowseCars from './Component/Customer/BrowseCars';

import AdminLayout from './Component/Layout/AdminLayout';

function App() {
  return (
    <>
      <Toaster position="top-right" />
      <BrowserRouter>
        <AuthProvider>
          <ToastProvider>
            <Routes>
              {/* Auth Routes - No Layout */}
              <Route path="/dang-nhap" element={<MainLayout><LoginComponent /></MainLayout>} />
              <Route path="/dang-ky" element={<MainLayout><RegisterComponent/></MainLayout>}/>
              
              {/* Public Routes - With Layout */}
              <Route path="/" element={<MainLayout><HomeCom /></MainLayout>} />
              <Route path="/dang-ky-chu-xe" element={<MainLayout><RegisCarOwner/></MainLayout>}/>
              <Route path="/about" element={<MainLayout><AboutComponent /></MainLayout>} />
              <Route path="/how-it-works" element={<MainLayout><HowToWork /></MainLayout>} />
              <Route path="/search" element={<MainLayout><SearchResults /></MainLayout>} />
              <Route path='/chi-tiet-xe/:carId' element={<MainLayout><ChiTietXe /></MainLayout>} />
              <Route path='/thue-xe/:carId' element={<MainLayout><BookingComponent/></MainLayout>}/>
              <Route path='/tat-ca-xe' element={<MainLayout><AllCars /></MainLayout>} />
              <Route path='/huy-don/:bookingId' element={<MainLayout><CancelBookingModal/></MainLayout>}/>
              <Route path='/huy-don-chua-thanh-toan/:bookingId' element={<MainLayout><CancelPendingBookingModal/></MainLayout>}/>
              <Route path='/xe-yeu-thich' element={<MainLayout><Favorites /></MainLayout>} />

              {/* Car Owner Routes - With Layout */}
              <Route path='/home-xe' element={<MainLayout><HomeXeComp/></MainLayout>}/>
              <Route path='/them-xe' element={<MainLayout><AddCarPage /></MainLayout>} />
              <Route path="/thung-rac" element={<MainLayout><BinXe /></MainLayout>} />
              <Route path='/chi-tiet/:carId' element={<MainLayout><CarDetailComponent /></MainLayout>}/>
              <Route path='/them-chi-tiet-xe/:carId' element={<MainLayout><AddCarDetailComponent/></MainLayout>}/>
              <Route path='/them-anh-xe/:carId' element={<MainLayout><AddCarImageComponent /></MainLayout>}/>
              <Route path='/xac-nhan-dang-ky-xe/:carId' element={<MainLayout><CarSuccessComponent/></MainLayout>}/>
              <Route path="/car-owner-bookings" element={<MainLayout><CarOwnerBookings /></MainLayout>} />
              <Route path="/cap-nhat-xe/:carId" element={<MainLayout><UpdateCarPage /></MainLayout>} />

              {/* Admin Routes - With Admin Layout */}
              <Route element={<AdminLayout />}>
                <Route path='/admin' element={<AdminDashboard/>}/>
                <Route path='/admin/users' element={<AdminUsers />} />
                <Route path='/admin/cars' element={<AdminCars />} />
                <Route path='/admin/bookings' element={<AdminBookings />} />
                <Route path='/admin/transactions' element={<AdminTransactions />} />
                <Route path='/admin/profile' element={<AdminProfile />} />
              </Route>

              {/* Protected Routes - With Layout */}
              <Route element={<PrivateRoute />}>
                <Route path="/payment-result" element={<MainLayout><PaymentResult /></MainLayout>} />
                <Route path="/profile" element={<MainLayout><ProfileComponent /></MainLayout>} />
                <Route path='/edit-profile' element={<MainLayout><EditProfile/></MainLayout>}/>
                <Route path='/change-password' element={<MainLayout><ChangePasswordComponent/></MainLayout>}/>
                <Route path='/vi-tien' element={<MainLayout><WalletComponent /></MainLayout>} />
                <Route path='/vn-pay' element={<MainLayout><VnPayComponent /></MainLayout>}/>
                <Route element={<MainLayout><ChatLayout /></MainLayout>}>
                  <Route path='/chat' element={<ChatPage />} />
                  <Route path='/chat/:chatId' element={<ChatPage />} />
                </Route>
                <Route path='/don-hang' element={<MainLayout><MyBookings /></MainLayout>}/>
                <Route path='/don-hang/:bookingId' element={<MainLayout><BookingDetailComponent /></MainLayout>}/>
                <Route path='/thanh-toan/:bookingId' element={<MainLayout><PaymentPage /></MainLayout>}/>
                <Route path='/phan-hoi/:bookingId' element={<MainLayout><Feedback /></MainLayout>}/>
              </Route>

              {/* Payment Result Routes - With Layout */}
              <Route path="/dat-xe/thanh-cong" element={<MainLayout><PaymentResult success={true} /></MainLayout>} />
              <Route path="/thanh-toan-that-bai" element={<MainLayout><PaymentResult success={false} /></MainLayout>} />
            </Routes>
            <ChatPopup />
          </ToastProvider>
        </AuthProvider>
      </BrowserRouter>
    </>
  );
}

export default App;
