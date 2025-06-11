import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../Authen/axiosInstance';
import { FaCar, FaCalendarAlt, FaMoneyBillWave, FaMapMarkerAlt, FaStar, FaUser, FaPhone, FaWallet, FaCreditCard } from 'react-icons/fa';
import { getWalletBalance, cancelBooking } from '../BackEnd/authen';
import '../css/BookingDetail.css';

const BookingDetailComponent = () => {
    const { bookingId } = useParams();
    const navigate = useNavigate();
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showFeedbackForm, setShowFeedbackForm] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [walletBalance, setWalletBalance] = useState(0);
    const [feedback, setFeedback] = useState({
        rating: 5,
        content: ''
    });

    useEffect(() => {
        fetchBookingDetails();
        fetchWalletBalance();
    }, [bookingId]);

    const fetchWalletBalance = async () => {
        try {
            const walletData = await getWalletBalance();
            setWalletBalance(walletData.balance);
        } catch (error) {
            console.error('Error fetching wallet balance:', error);
        }
    };

    const fetchBookingDetails = async () => {
        try {
            const response = await axiosInstance.get(`/api/bookings/${bookingId}`);
            if (response.data) {
                setBooking(response.data);
            } else {
                throw new Error('Không nhận được dữ liệu đơn hàng');
            }
            setLoading(false);
        } catch (error) {
            console.error('Error fetching booking details:', error);
            setError('Không thể tải thông tin đơn hàng. Vui lòng thử lại sau.');
            setLoading(false);
        }
    };

    const handleFeedbackSubmit = async (e) => {
        e.preventDefault();
        try {
            await axiosInstance.post(`/api/bookings/${bookingId}/feedback`, feedback);
            setShowFeedbackForm(false);
            fetchBookingDetails(); // Refresh booking details to show the feedback
        } catch (error) {
            console.error('Error submitting feedback:', error);
            setError('Không thể gửi đánh giá. Vui lòng thử lại sau.');
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('vi-VN');
    };

    const formatPrice = (price) => {
        return price?.toLocaleString('vi-VN') + ' đ';
    };

    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'PENDING': return 'status-pending';
            case 'DEPOSIT': return 'status-deposited';
            case 'DELIVERING': return 'status-delivering';
            case 'RENTED': return 'status-rented';
            case 'RETURNED': return 'status-returned';
            case 'CANCEL': return 'status-canceled';
            default: return '';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'PENDING': return 'Chờ thanh toán';
            case 'DEPOSIT': return 'Đã đặt cọc';
            case 'DELIVERING': return 'Đang giao xe';
            case 'RENTED': return 'Đang thuê';
            case 'RETURNED': return 'Đã trả xe';
            case 'CANCEL': return 'Đã hủy';
            default: return status;
        }
    };

    const canShowFeedbackForm = (status) => {
        return status === 'RETURNED' && !booking.numberFeedback;
    };

    const canCancel = (status) => {
        return ['PENDING', 'DEPOSIT'].includes(status);
    };

    const canPay = (status) => {
        return status === 'PENDING';
    };

    const handleWalletPayment = async () => {
        try {
            if (!booking || !booking.totalPrice) {
                setError('Không tìm thấy thông tin đơn hàng');
                return;
            }

            if (booking.totalPrice > walletBalance) {
                setError('Số dư trong ví không đủ. Vui lòng nạp thêm tiền để tiếp tục.');
                return;
            }

            setLoading(true);
            const response = await axiosInstance.post(`/api/bookings/wallet-pay?bookingId=${bookingId}`);
            if (response.data && response.data.success) {
                alert('Thanh toán thành công!');
                window.location.href = '/don-hang';
            } else {
                throw new Error(response.data?.message || 'Thanh toán không thành công');
            }
        } catch (error) {
            console.error('Payment error:', error);
            setError(error.response?.data?.message || error.message || 'Có lỗi xảy ra khi thanh toán');
        } finally {
            setLoading(false);
        }
    };

    const handleVnPayPayment = async () => {
        try {
            if (!booking || !booking.totalPrice) {
                setError('Không tìm thấy thông tin đơn hàng');
                return;
            }

            setLoading(true);
            const response = await axiosInstance.get(`/api/vnpay/create-payment?bookingId=${bookingId}`);
            
            if (response.data && response.data.paymentUrl) {
                window.location.href = response.data.paymentUrl;
            } else {
                throw new Error(response.data?.message || 'Không nhận được URL thanh toán');
            }
        } catch (error) {
            console.error('VNPay error:', error);
            setError(error.response?.data?.message || error.message || 'Có lỗi xảy ra khi tạo thanh toán VNPay');
            setLoading(false);
        }
    };

    const handleCancel = async () => {
        if (window.confirm('Bạn có chắc chắn muốn hủy đơn hàng này?')) {
            try {
                setLoading(true);
                await cancelBooking(bookingId);
                setError('');
                fetchBookingDetails(); // Refresh booking details
            } catch (error) {
                console.error('Error canceling booking:', error);
                setError(error.response?.data || 'Không thể hủy đơn hàng. Vui lòng thử lại sau.');
            } finally {
                setLoading(false);
            }
        }
    };

    const PaymentModal = () => (
        <div className={`payment-modal ${showPaymentModal ? 'show' : ''}`}>
            <div className="payment-modal-content">
                <h3>Chọn phương thức thanh toán</h3>
                <div className="wallet-info">
                    <div className="balance-info">
                        <FaWallet className="icon" />
                        <div>
                            <p>Số dư ví:</p>
                            <p className="balance">{walletBalance.toLocaleString('vi-VN')} đ</p>
                        </div>
                    </div>
                    <div className="total-info">
                        <p>Tổng tiền cần thanh toán:</p>
                        <p className="total">{booking?.totalPrice.toLocaleString('vi-VN')} đ</p>
                    </div>
                    {booking?.totalPrice > walletBalance && (
                        <div className="insufficient-funds">
                            Số dư không đủ. Vui lòng nạp thêm tiền vào ví hoặc chọn phương thức khác.
                        </div>
                    )}
                </div>
                <div className="payment-methods">
                    <button 
                        className="btn btn-payment wallet-payment"
                        onClick={handleWalletPayment}
                        disabled={loading || booking?.totalPrice > walletBalance}
                    >
                        <FaWallet />
                        Thanh toán bằng ví
                    </button>
                    <button 
                        className="btn btn-payment vnpay-payment"
                        onClick={handleVnPayPayment}
                        disabled={loading}
                    >
                        <FaCreditCard />
                        Thanh toán VNPay
                    </button>
                </div>
                <button 
                    className="btn btn-secondary"
                    onClick={() => setShowPaymentModal(false)}
                    disabled={loading}
                >
                    Đóng
                </button>
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="booking-detail-container">
                <div className="loading-spinner">Đang tải...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="booking-detail-container">
                <div className="error-message">{error}</div>
                <button className="btn btn-primary" onClick={() => navigate('/don-hang')}>
                    Quay lại danh sách đơn hàng
                </button>
            </div>
        );
    }

    return (
        <div className="booking-detail-container">
            <div className="booking-detail-card">
                <div className="booking-header">
                    <h2>Chi tiết đơn thuê xe #{booking?.id}</h2>
                    <span className={`status-badge ${getStatusBadgeClass(booking?.status)}`}>
                        {getStatusText(booking?.status)}
                    </span>
                </div>

                <div className="booking-content">
                    <div className="section customer-info">
                        <h3><FaUser className="icon" /> Thông tin khách hàng</h3>
                        <div className="info-grid">
                            <div className="info-item">
                                <label>Họ và tên:</label>
                                <span>{booking?.customer?.fullName}</span>
                            </div>
                            <div className="info-item">
                                <label>Số điện thoại:</label>
                                <span>{booking?.customer?.phone}</span>
                            </div>
                        </div>
                    </div>

                    <div className="section rental-info">
                        <h3><FaCalendarAlt className="icon" /> Thông tin thuê xe</h3>
                        <div className="info-grid">
                            <div className="info-item">
                                <label>Ngày bắt đầu:</label>
                                <span>{formatDate(booking?.startDate)}</span>
                            </div>
                            <div className="info-item">
                                <label>Ngày kết thúc:</label>
                                <span>{formatDate(booking?.endDate)}</span>
                            </div>
                            <div className="info-item">
                                <label>Số ngày thuê:</label>
                                <span>
                                    {Math.ceil((new Date(booking?.endDate) - new Date(booking?.startDate)) / (1000 * 60 * 60 * 24) + 1)} ngày
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="section car-info">
                        <h3><FaCar className="icon" /> Thông tin xe thuê</h3>
                        <div className="car-grid">
                            {booking?.cars.map(car => (
                                <div key={car.id} className="car-card">
                                    <div className="car-image">
                                        <img src={`http://localhost:8080${car.imagePaths}`} alt={car.carName} />
                                    </div>
                                    <div className="car-details">
                                        <h4>{car.carName}</h4>
                                        <p><strong>Biển số:</strong> {car.licensePlate}</p>
                                        <p><FaMapMarkerAlt className="icon" /> {car.address}</p>
                                        <p className="price">{formatPrice(car.pricePerDay)}/ngày</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="section payment-info">
                        <h3><FaMoneyBillWave className="icon" /> Thông tin thanh toán</h3>
                        <div className="payment-details">
                            <div className="total-price">
                                <label>Tổng tiền:</label>
                                <span className="price">{formatPrice(booking?.totalPrice)}</span>
                            </div>
                            <div className="payment-method">
                                <label>Phương thức thanh toán:</label>
                                <span>{booking?.paymentMethod === 'WALLET' ? 'Ví tiền' : 'VNPay'}</span>
                            </div>
                        </div>
                    </div>

                    {canShowFeedbackForm(booking?.status) && (
                        <div className="section feedback-section">
                            <h3><FaStar className="icon" /> Đánh giá dịch vụ</h3>
                            {!showFeedbackForm ? (
                                <button 
                                    className="btn btn-primary"
                                    onClick={() => setShowFeedbackForm(true)}
                                >
                                    Đánh giá ngay
                                </button>
                            ) : (
                                <form onSubmit={handleFeedbackSubmit} className="feedback-form">
                                    <div className="rating-input">
                                        <label>Đánh giá:</label>
                                        <div className="star-rating">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <FaStar
                                                    key={star}
                                                    className={star <= feedback.rating ? 'star active' : 'star'}
                                                    onClick={() => setFeedback({...feedback, rating: star})}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                    <div className="feedback-input">
                                        <label>Nhận xét:</label>
                                        <textarea
                                            value={feedback.content}
                                            onChange={(e) => setFeedback({...feedback, content: e.target.value})}
                                            placeholder="Chia sẻ trải nghiệm của bạn..."
                                            rows="4"
                                        />
                                    </div>
                                    <div className="button-group">
                                        <button type="button" className="btn btn-secondary" onClick={() => setShowFeedbackForm(false)}>
                                            Hủy
                                        </button>
                                        <button type="submit" className="btn btn-primary">
                                            Gửi đánh giá
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    )}

                    {booking?.numberFeedback && (
                        <div className="section feedback-display">
                            <h3><FaStar className="icon" /> Đánh giá của bạn</h3>
                            <div className="feedback-content">
                                <div className="star-rating">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <FaStar
                                            key={star}
                                            className={star <= booking.numberFeedback ? 'star active' : 'star'}
                                        />
                                    ))}
                                </div>
                                <p className="feedback-text">{booking.contentFeedback}</p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="booking-actions">
                    <button 
                        className="btn btn-secondary"
                        onClick={() => navigate('/don-hang')}
                    >
                        Quay lại danh sách đơn hàng
                    </button>
                    {canPay(booking?.status) && (
                        <button 
                            className="btn btn-primary"
                            onClick={() => setShowPaymentModal(true)}
                        >
                            Thanh toán ngay
                        </button>
                    )}
                    {canCancel(booking?.status) && (
                        <button 
                            className="btn btn-danger"
                            onClick={handleCancel}
                            disabled={loading}
                        >
                            {loading ? 'Đang xử lý...' : 'Hủy đơn hàng'}
                        </button>
                    )}
                </div>
            </div>
            {showPaymentModal && <PaymentModal />}
        </div>
    );
};

export default BookingDetailComponent; 