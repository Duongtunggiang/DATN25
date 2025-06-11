import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import '../css/PaymentResult.css';

const PaymentResult = ({ success: propSuccess }) => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState('processing');
    const [message, setMessage] = useState('');

    useEffect(() => {
        // Nếu có prop success, sử dụng nó
        if (propSuccess !== undefined) {
            setStatus(propSuccess ? 'success' : 'failed');
            setMessage(propSuccess ? 'Thanh toán thành công!' : 'Thanh toán thất bại. Vui lòng thử lại!');
            if (propSuccess) {
                setTimeout(() => {
                    navigate('/don-hang');
                }, 3000);
            }
            return;
        }

        // Nếu không có prop success, xử lý theo params từ VNPay
        const vnp_ResponseCode = searchParams.get('vnp_ResponseCode');
        const vnp_TransactionStatus = searchParams.get('vnp_TransactionStatus');
        const orderInfo = searchParams.get('vnp_OrderInfo');

        if (vnp_ResponseCode === '00' && vnp_TransactionStatus === '00') {
            setStatus('success');
            setMessage(orderInfo?.startsWith('Thanh toan don dat xe') 
                ? 'Thanh toán đơn đặt xe thành công!'
                : 'Nạp tiền vào ví thành công!');
            
            // Chuyển hướng sau 3 giây
            setTimeout(() => {
                if (orderInfo?.startsWith('Thanh toan don dat xe')) {
                    navigate('/don-hang');
                } else {
                    navigate('/vi-tien');
                }
            }, 3000);
        } else {
            setStatus('failed');
            setMessage('Thanh toán thất bại. Vui lòng thử lại!');
        }
    }, [searchParams, navigate, propSuccess]);

    return (
        <div className="payment-result-container">
            <div className="payment-result-card">
                {status === 'success' ? (
                    <FaCheckCircle className="success-icon" />
                ) : (
                    <FaTimesCircle className="error-icon" />
                )}
                <h2>{message}</h2>
                {searchParams.get('vnp_TxnRef') && (
                    <p>Mã giao dịch: {searchParams.get('vnp_TxnRef')}</p>
                )}
                <div className="action-buttons">
                    <button 
                        className="btn btn-primary"
                        onClick={() => navigate('/don-hang')}
                    >
                        Xem đơn hàng
                    </button>
                    {status === 'failed' && (
                        <button 
                            className="btn btn-secondary"
                            onClick={() => navigate(-1)}
                        >
                            Thử lại
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PaymentResult; 