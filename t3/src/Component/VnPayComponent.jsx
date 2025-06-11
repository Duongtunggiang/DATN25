import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../Authen/axiosInstance';
import ToastNotification from '../Alert/ToastNotification';
import { FaMoneyBillWave, FaArrowLeft } from 'react-icons/fa';
import '../css/VnPay.css';

const VnPayComponent = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const modalType = searchParams.get('type');
  const [amountInput, setAmountInput] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  // Format tiền với dấu phẩy và đ
  const formatCurrency = (value) => {
    const number = value.replace(/\D/g, '');
    if (!number) return '';
    return new Intl.NumberFormat('vi-VN').format(number) + ' đ';
  };

  // Chuyển đổi từ chuỗi đã format về số
  const parseCurrency = (formatted) => parseInt(formatted.replace(/\D/g, '') || 0);

  // Xử lý khi người dùng nhập
  const handleInputChange = (e) => {
    const rawValue = e.target.value.replace(/\D/g, '');
    setAmountInput(rawValue);
  };

  // Xử lý kết quả thanh toán từ VNPay
  useEffect(() => {
    const status = searchParams.get('status');
    if (status === 'success') {
      setToastMessage('Nạp tiền thành công!');
    } else if (status === 'fail') {
      setToastMessage('Giao dịch thất bại. Vui lòng thử lại!');
    }
  }, [searchParams]);

  // Gửi yêu cầu thanh toán
  const handleSubmit = async () => {
    const amount = parseCurrency(amountInput);
    if (amount <= 0) {
      setToastMessage('Vui lòng nhập số tiền hợp lệ!');
      return;
    }

    try {
      const response = await axiosInstance.get('/api/vnpay/create-payment', {
        params: {
          amount: amount,
          bankCode: 'NCB',
          locale: 'vn'
        }
      });

      const paymentUrl = response.data.url;
      if (paymentUrl) {
        window.location.href = paymentUrl;
      } else {
        setToastMessage('Không nhận được đường dẫn thanh toán từ VNPay!');
      }
    } catch (error) {
      console.error(error);
      setToastMessage('Đã xảy ra lỗi khi tạo giao dịch VNPay!');
    }
  };

  return (
    <div className="vnpay-container">
      <div className="vnpay-card">
        <div className="vnpay-header">
          <FaMoneyBillWave className="vnpay-icon" />
          <h2>{modalType === 'deposit' ? 'Nạp tiền qua VNPay' : 'Rút tiền'}</h2>
        </div>

        <div className="vnpay-content">
          <div className="amount-input-group">
            <label>Số tiền</label>
            <div className="input-wrapper">
              <input
                type="text"
                value={formatCurrency(amountInput)}
                onChange={handleInputChange}
                placeholder="0 đ"
              />
            </div>
            <div className="amount-preview">
              Bạn sẽ nạp: <strong>{formatCurrency(amountInput) || '0 đ'}</strong>
            </div>
          </div>

          <div className="payment-note">
            <p>Lưu ý:</p>
            <ul>
              <li>Số tiền tối thiểu mỗi lần nạp là 10,000 đ</li>
              <li>Số tiền tối đa mỗi lần nạp là 100,000,000 đ</li>
              <li>Giao dịch được xử lý qua cổng thanh toán VNPay</li>
            </ul>
          </div>

          <div className="vnpay-actions">
            <button className="btn-back" onClick={() => navigate(-1)}>
              <FaArrowLeft /> Quay lại
            </button>
            <button 
              className="btn-confirm" 
              onClick={handleSubmit}
              disabled={parseCurrency(amountInput) < 10000}
            >
              Xác nhận
            </button>
          </div>
        </div>
      </div>

      {toastMessage && (
        <ToastNotification 
          message={toastMessage} 
          onClose={() => setToastMessage('')} 
        />
      )}
    </div>
  );
};

export default VnPayComponent;
