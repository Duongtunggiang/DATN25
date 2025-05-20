import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../Authen/axiosInstance';
import ToastNotification from '../Alert/ToastNotification';
import axios from 'axios';

const VnPayComponent = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const modalType = searchParams.get('type'); // 'deposit' hoặc 'withdraw'
  const [amountInput, setAmountInput] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  // Hàm format tiền có dấu phẩy + đ
  const formatCurrency = (value) => {
    const number = parseInt(value.replace(/\D/g, '') || 0);
    return number.toLocaleString('vi-VN') + ' đ';
  };

  // Hàm convert chuỗi tiền format về số
  const parseCurrency = (formatted) => parseInt(formatted.replace(/\D/g, '') || 0);

  // Xử lý kết quả thanh toán trả về từ VNPay
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

            const orderId = `ORDER${Date.now()}`;
            const orderInfo = 'Nạp tiền vào ví VNPay';

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
    <div className="container mt-4">
      <h2>{modalType === 'deposit' ? 'Nạp tiền qua VNPay' : 'Rút tiền'}</h2>

      <div className="mb-3">
        <label>Nhập số tiền</label>
        <input
          type="text"
          className="form-control"
          value={amountInput}
          onChange={(e) => {
            const raw = e.target.value.replace(/\D/g, '');
            setAmountInput(raw);
          }}
          placeholder="Ví dụ: 1000000"
        />
        <div className="form-text mt-1">Bạn sẽ nạp: <strong>{formatCurrency(amountInput)}</strong></div>
      </div>

      <div className="d-flex">
        <button className="btn btn-secondary me-2" onClick={() => navigate(-1)}>Quay lại</button>
        <button className="btn btn-primary" onClick={handleSubmit}>Xác nhận</button>
      </div>

      {toastMessage && (
        <ToastNotification message={toastMessage} onClose={() => setToastMessage('')} />
      )}
    </div>
  );
};

export default VnPayComponent;
