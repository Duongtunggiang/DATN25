import React, { useState } from 'react';
import { ChangePassword } from '../BackEnd/authen';

const ChangePasswordComponent = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [responseMessage, setResponseMessage] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    const user = JSON.parse(localStorage.getItem('user'));
    const accountId = user?.id;

    // Kiểm tra mật khẩu mới và mật khẩu xác nhận có khớp không
    if (newPassword !== confirmPassword) {
      setResponseMessage('Mật khẩu mới và mật khẩu xác nhận không khớp!');
      return;
    }

    const payload = {
      oldPassword: currentPassword, 
      newPassword,
      confirmPassword
    };


    try {
      const data = await ChangePassword(payload); // Gửi dữ liệu dưới dạng JSON tới backend
      setResponseMessage(data.message || 'Thay đổi mật khẩu thành công!');
      
      // Clear the token and redirect to login
      localStorage.removeItem('token');
      window.location.href = '/dang-nhap';  // Redirect to login page
    } catch (error) {
      // Handle specific error messages from backend
      setResponseMessage(error.response?.data || 'Đã có lỗi xảy ra, vui lòng thử lại.');
    }
};


  return (
    <div className="container mt-5">
      <h2>Thay đổi mật khẩu</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="currentPassword">Mật khẩu hiện tại</label>
          <input
            type="password"
            className="form-control"
            id="currentPassword"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Nhập mật khẩu hiện tại"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="newPassword">Mật khẩu mới</label>
          <input
            type="password"
            className="form-control"
            id="newPassword"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Nhập mật khẩu mới"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="confirmPassword">Xác nhận mật khẩu mới</label>
          <input
            type="password"
            className="form-control"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Xác nhận mật khẩu mới"
            required
          />
        </div>
        <button type="submit" className="btn btn-primary">Lưu thay đổi</button>
      </form>
      {responseMessage && <div className="mt-3">{responseMessage}</div>}
    </div>
  );
};

export default ChangePasswordComponent;
