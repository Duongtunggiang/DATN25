import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaWallet, FaCreditCard, FaClock } from 'react-icons/fa';
import axiosInstance from '../Authen/axiosInstance';
import { getWalletBalance, createVnPayBookingPayment, getTimeForDeposit } from '../BackEnd/authen';
import '../css/PaymentPage.css';

const PaymentPage = () => {
    const { bookingId } = useParams();
    const navigate = useNavigate();
    const [booking, setBooking] = useState(null);
    const [walletBalance, setWalletBalance] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [timeLeft, setTimeLeft] = useState(null);

    useEffect(() => {
        fetchBookingDetails();
        fetchWalletBalance();
        fetchTimeForDeposit();

        // Fetch time remaining every 10 seconds
        const intervalId = setInterval(() => {
            fetchTimeForDeposit();
        }, 10000);

        return () => clearInterval(intervalId);
    }, [bookingId]);

    useEffect(() => {
        if (timeLeft !== null && timeLeft > 0) {
            const timerId = setInterval(() => {
                setTimeLeft(prevTime => {
                    if (prevTime <= 1) {
                        clearInterval(timerId);
                        handleAutoCancelBooking();
                        return 0;
                    }
                    return prevTime - 1;
                });
            }, 1000);

            return () => clearInterval(timerId);
        }
    }, [timeLeft]);

    const fetchBookingDetails = async () => {
        try {
            const response = await axiosInstance.get(`/api/bookings/${bookingId}`);
            if (response.data) {
                setBooking(response.data);
                // Nếu đơn hàng không phải trạng thái PENDING, chuyển về trang chi tiết
                if (response.data.status !== 'PENDING') {
                    navigate(`/don-hang/${bookingId}`);
                }
            }
            setLoading(false);
        } catch (error) {
            setError('Không thể tải thông tin đơn hàng');
            setLoading(false);
        }
    };

    const fetchWalletBalance = async () => {
        try {
            const walletData = await getWalletBalance();
            setWalletBalance(walletData.balance);
        } catch (error) {
            console.error('Error fetching wallet balance:', error);
        }
    };

    const fetchTimeForDeposit = async () => {
        try {
            const response = await getTimeForDeposit(bookingId);
            if (response <= 0) {
                handleAutoCancelBooking();
                return;
            }
            setTimeLeft(response);
        } catch (error) {
            console.error('Error fetching deposit time:', error);
            setError('Không thể lấy thời gian thanh toán. Vui lòng thử lại.');
        }
    };

    const handleAutoCancelBooking = async () => {
        try {
            console.log('Attempting to auto-cancel booking...');
            await axiosInstance.put(
                `/api/bookings/${bookingId}/cancel-when-pending?reason=Qua thoi gian thanh toan`
            );
            alert('Đơn hàng đã bị hủy do quá thời gian thanh toán');
            navigate('/don-hang');
        } catch (error) {
            console.error('Error auto canceling booking:', error);
            let errorMessage = 'Có lỗi xảy ra khi tự động hủy đơn hàng.';
            if (error.response && error.response.data && error.response.data.message) {
                errorMessage = error.response.data.message;
            } else if (error.message) {
                errorMessage = error.message;
            }
            alert('Lỗi hủy đơn: ' + errorMessage);
        }
    };

    const handleWalletPayment = async () => {
        try {
            if (booking.totalPrice > walletBalance) {
                setError('Số dư trong ví không đủ. Vui lòng nạp thêm tiền để tiếp tục.');
                return;
            }

            setLoading(true);
            const response = await axiosInstance.post(`/api/bookings/wallet-pay?bookingId=${bookingId}`);
            if (response.data && response.data.success) {
                alert(`Ví của bạn đã trừ ${booking.totalPrice.toLocaleString('vi-VN')}đ cho đơn hàng #${bookingId}`);
                navigate('/don-hang');
            }
        } catch (error) {
            setError(error.response?.data?.message || 'Có lỗi xảy ra khi thanh toán');
        } finally {
            setLoading(false);
        }
    };

    const handleVnPayPayment = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/api/vnpay/create-booking-payment', {
                params: {
                    amount: booking.totalPrice,
                    bankCode: 'NCB',
                    locale: 'vn',
                    bookingId: bookingId,
                    returnUrl: 'http://localhost:3000/dat-xe/thanh-cong'
                }
            });

            if (response.data && response.data.url) {
                window.location.href = response.data.url;
            } else {
                throw new Error('Không nhận được URL thanh toán từ VNPay');
            }
        } catch (error) {
            console.error('VNPay payment error:', error);
            setError(error.response?.data?.message || 'Có lỗi xảy ra khi tạo thanh toán VNPay');
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (seconds) => {
        if (seconds <= 0) return "00:00";
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    if (loading) {
        return (
            <div className="payment-page-container">
                <div className="loading">Đang tải...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="payment-page-container">
                <div className="error-message">{error}</div>
                <button className="btn btn-primary" onClick={() => navigate('/don-hang')}>
                    Quay lại danh sách đơn hàng
                </button>
            </div>
        );
    }

    return (
        <div className="payment-page-container">
            <div className="payment-card">
                <div className="payment-header">
                    <h2>Thanh toán đơn hàng #{booking?.id}</h2>
                    <div className="countdown-timer">
                        <FaClock className="icon" />
                        <span className={timeLeft <= 60 ? 'warning' : ''}>
                            {formatTime(timeLeft)}
                        </span>
                    </div>
                </div>

                <div className="booking-summary">
                    <h3>Thông tin đơn hàng</h3>
                    <div className="summary-content">
                        <div className="summary-item">
                            <span>Xe thuê:</span>
                            <span>{booking?.cars.map(car => `${car.carName} - ${car.licensePlate}`).join(', ')}</span>
                        </div>
                        <div className="summary-item">
                            <span>Thời gian thuê:</span>
                            <span>
                                {new Date(booking?.startDate).toLocaleDateString('vi-VN')} - {new Date(booking?.endDate).toLocaleDateString('vi-VN')}
                            </span>
                        </div>
                        <div className="summary-item total">
                            <span>Tổng tiền:</span>
                            <span>{booking?.totalPrice.toLocaleString('vi-VN')}đ</span>
                        </div>
                    </div>
                </div>

                <div className="payment-methods">
                    <div className="wallet-section">
                        <div className="wallet-info">
                            <FaWallet className="icon" />
                            <div>
                                <p>Số dư ví:</p>
                                <p className="balance">{walletBalance.toLocaleString('vi-VN')}đ</p>
                            </div>
                        </div>
                        {booking?.totalPrice > walletBalance && (
                            <div className="insufficient-funds">
                                <p>Số dư không đủ. Vui lòng nạp thêm tiền vào ví hoặc chọn phương thức khác.</p>
                                <a href="/vi-tien" className='btn btn-primary'>Nạp tiền vào ví</a>
                            </div>
                        )}
                        <button 
                            className="btn btn-payment wallet-payment"
                            onClick={handleWalletPayment}
                            disabled={loading || booking?.totalPrice > walletBalance}
                        >
                            <FaWallet />
                            Thanh toán bằng ví
                        </button>
                    </div>

                    <div className="vnpay-section">
                        <button 
                            className="btn btn-payment vnpay-payment"
                            onClick={handleVnPayPayment}
                            disabled={loading}
                        >
                            <FaCreditCard />
                            Thanh toán VNPay
                        </button>
                    </div>
                </div>

                <div className="payment-actions">
                    <button 
                        className="btn btn-secondary"
                        onClick={() => navigate('/don-hang')}
                        disabled={loading}
                    >
                        Quay lại
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PaymentPage; 