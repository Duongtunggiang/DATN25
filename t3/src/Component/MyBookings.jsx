import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaTimes, FaMoneyBillWave, FaStar, FaComments, FaEdit, FaClock, FaInfoCircle } from 'react-icons/fa';
import axiosInstance from '../Authen/axiosInstance';
import { cancelBooking, getTimeForDeposit, getCancellationReason, getFeedback } from '../BackEnd/authen';
import ToastNotification from '../Alert/ToastNotification';
import '../css/MyBookings.css';

const MyBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [activeFilter, setActiveFilter] = useState('all');
    const [toastMessage, setToastMessage] = useState('');
    const [showCancelReason, setShowCancelReason] = useState(false);
    const [cancelReason, setCancelReason] = useState('');
    const [selectedBookingId, setSelectedBookingId] = useState(null);
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);
    const [feedbackData, setFeedbackData] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchBookings();
        // Set up interval to update timers every second
        const timerInterval = setInterval(() => {
            setBookings(prevBookings => {
                return prevBookings.map(booking => {
                    if (booking.status === 'PENDING' && booking.timeLeft > 0) {
                        return {
                            ...booking,
                            timeLeft: booking.timeLeft - 1
                        };
                    }
                    return booking;
                });
            });
        }, 1000);

        return () => clearInterval(timerInterval);
    }, [activeFilter]);

    const fetchBookings = async () => {
        try {
            let url = '/api/bookings/my-bookings';
            if (activeFilter !== 'all') {
                if (activeFilter === 'CANCEL') {
                    // Khi filter là CANCEL, gọi API với cả CANCEL và CANCELPENDING
                    const response = await axiosInstance.get('/api/bookings/my-bookings');
                    const allBookings = response.data;
                    const canceledBookings = allBookings.filter(booking => 
                        booking.status === 'CANCEL' || booking.status === 'CANCELPENDING'
                    );
                    setBookings(canceledBookings);
                    return;
                } else if (activeFilter === 'DELIVERING') {
                    // Khi filter là DELIVERING, gọi API với cả DELIVERING và RENTED
                    const response = await axiosInstance.get('/api/bookings/my-bookings');
                    const allBookings = response.data;
                    const deliveringBookings = allBookings.filter(booking => 
                        booking.status === 'DELIVERING' || booking.status === 'RENTED'
                    );
                    setBookings(deliveringBookings);
                    return;
                }
                url = `/api/bookings/my-bookings/filter?status=${activeFilter}`;
            }
            const response = await axiosInstance.get(url);
            const bookingsWithTime = await Promise.all(
                response.data.map(async (booking) => {
                    if (booking.status === 'PENDING') {
                        try {
                            const timeLeft = await getTimeForDeposit(booking.id);
                            if (timeLeft <= 0) {
                                await handleAutoCancelBooking(booking.id);
                                return null;
                            }
                            return { ...booking, timeLeft };
                        } catch (error) {
                            console.error('Error fetching time for booking:', error);
                            return booking;
                        }
                    }
                    return booking;
                })
            );
            setBookings(bookingsWithTime.filter(booking => booking !== null));
        } catch (error) {
            console.error('Error fetching bookings:', error);
            setToastMessage('Không thể tải danh sách đơn hàng');
        }
    };

    const handleAutoCancelBooking = async (bookingId) => {
        try {
            await axiosInstance.put(
                `/api/bookings/${bookingId}/cancel-when-pending?reason=Quá thời gian thanh toán`
            );
            setToastMessage('Đơn hàng đã bị hủy do quá thời gian thanh toán');
            fetchBookings(); 
            window.location.reload();
        } catch (error) {
            console.error('Error auto canceling booking:', error);
            setToastMessage('Có lỗi khi tự động hủy đơn hàng');
        }
    };

    const handleCancelAction = (booking) => {
        if (booking.status === 'PENDING') {
            navigate(`/huy-don-chua-thanh-toan/${booking.id}`);
        } else if (booking.status === 'DEPOSIT') {
            navigate(`/huy-don/${booking.id}`);
        }
    };

    const handleGetCancelBooking = async (booking) => {
        try {
            const reason = await getCancellationReason(booking.id);
            setCancelReason(reason);
            setSelectedBookingId(booking.id);
            setShowCancelReason(true);
        } catch (error) {
            console.error('Error getting cancellation reason:', error);
            setToastMessage('Không thể lấy lý do hủy đơn');
        }
    };

    const handleGetFeedback = async (booking) => {
        try {
            console.log('Starting handleGetFeedback with booking:', booking);
            const feedback = await getFeedback(booking.id);
            console.log('Feedback response:', feedback);
            
            if (!feedback) {
                setToastMessage('Không tìm thấy thông tin đánh giá');
                return;
            }

            setFeedbackData({
                numberFeedback: feedback.numberFeedback || 0,
                contentFeedback: feedback.contentFeedback || 'Chưa có nội dung đánh giá'
            });
            setSelectedBookingId(booking.id);
            setShowFeedbackModal(true);
        } catch (error) {
            console.error('Error in handleGetFeedback:', error);
            setToastMessage(error.response?.data?.message || 'Không thể hiển thị thông tin đánh giá');
        }
    };

    const handleEditFeedback = (bookingId) => {
        navigate(`/phan-hoi/${bookingId}`);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('vi-VN');
    };

    const formatPrice = (price) => {
        return price?.toLocaleString('vi-VN') + ' đ';
    };

    const formatTime = (seconds) => {
        if (seconds <= 0) return "00:00";
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'PENDING': return 'status-pending';
            case 'DEPOSIT': return 'status-deposited';
            case 'DELIVERING': return 'status-delivering';
            case 'RENTED': return 'status-rented';
            case 'RETURNED': return 'status-returned';
            case 'CANCEL': return 'status-canceled';
            case 'CANCELPENDING': return 'status-canceled';
            case 'REFUND': return 'status-refunded';
            case 'FEEDBACK': return 'status-feedback';
            default: return '';
        }
    };

    const getStatusText = (status, timeLeft) => {
        switch (status) {
            case 'PENDING': 
                return (
                    <div className="status-with-timer">
                        <span>Chờ thanh toán</span>
                        {timeLeft !== undefined && (
                            <span className="countdown-timer">
                                <FaClock size={12} />
                                <span className={timeLeft <= 60 ? 'warning' : ''}>
                                    {formatTime(timeLeft)}
                                </span>
                            </span>
                        )}
                    </div>
                );
            case 'DEPOSIT': return 'Đã đặt cọc';
            case 'DELIVERING': return 'Đang giao xe';
            case 'RENTED': return 'Đang thuê';
            case 'RETURNED': return 'Đã trả xe';
            case 'CANCEL': return 'Đã hủy';
            case 'REFUND': return 'Đã hoàn tiền';
            case 'CANCELPENDING': return 'Hủy đơn chưa thanh toán';
            case 'FEEDBACK': return 'Đã đánh giá';
            default: return status;
        }
    };

    const renderActionButtons = (booking) => {
        console.log('Rendering action buttons for booking:', booking);
        switch (booking.status) {
            case 'RETURNED':
                return (
                    <div className="booking-actions">
                        {!booking.numberFeedback && (
                            <button
                                id="booking-feedback-btn"
                                className="btn-action btn-feedback"
                                onClick={() => navigate(`/phan-hoi/${booking.id}`)}
                                title="Đánh giá chuyến đi"
                            >
                                <FaComments />
                            </button>
                        )}
                        {booking.numberFeedback && (
                            <div className="feedback-info">
                                <div className="rating">
                                    {[...Array(5)].map((_, index) => (
                                        <FaStar
                                            key={index}
                                            color={index < booking.numberFeedback ? "#ffc107" : "#e4e5e9"}
                                            size={16}
                                        />
                                    ))}
                                </div>
                                <p className="feedback-text">{booking.contentFeedback}</p>
                                <button
                                    id="booking-edit-feedback-btn"
                                    className="btn-action btn-edit-feedback"
                                    onClick={() => navigate(`/phan-hoi/${booking.id}`)}
                                    title="Chỉnh sửa đánh giá"
                                >
                                    <FaEdit />
                                </button>
                            </div>
                        )}
                    </div>
                );
            case 'PENDING':
            case 'DEPOSIT':
                return (
                    <div className="action-buttons">
                        <button 
                            className="btn-action btn-view"
                            onClick={() => navigate(`/don-hang/${booking.id}`)}
                            title="Xem chi tiết"
                        >
                            <FaEye />
                        </button>
                        {booking.status === 'PENDING' && (
                            <button 
                                className="btn-action btn-pay"
                                onClick={() => navigate(`/thanh-toan/${booking.id}`)}
                                title="Thanh toán"
                            >
                                <FaMoneyBillWave />
                            </button>
                        )}
                        <button 
                            className="btn-action btn-cancel"
                            onClick={() => handleCancelAction(booking)}
                            title="Hủy đơn"
                        >
                            <FaTimes />
                        </button>
                    </div>
                );
            case 'CANCELPENDING':
            case 'CANCEL':
                return (
                    <div className="action-buttons">
                        <button 
                            className="btn-action btn-view"
                            onClick={() => navigate(`/don-hang/${booking.id}`)}
                            title="Xem chi tiết"
                        >
                            <FaEye />
                        </button>
                        <button 
                            className="btn-action btn-info"
                            onClick={() => handleGetCancelBooking(booking)}
                            title="Lý do hủy"
                        >
                            <FaInfoCircle />
                        </button>
                    </div>
                );
            case 'FEEDBACK':
                console.log('Rendering FEEDBACK buttons for booking:', booking);
                return (
                    <div className="action-buttons">
                        <button 
                            className="btn-action btn-view"
                            onClick={() => handleGetFeedback(booking)}
                            title="Xem đánh giá"
                        >
                            <FaEye />
                        </button>
                        <button 
                            className="btn-action btn-edit-feedback"
                            onClick={() => handleEditFeedback(booking.id)}
                            title="Chỉnh sửa đánh giá"
                        >
                            <FaEdit />
                        </button>
                    </div>
                );
            
            default:
                return (
                    <button 
                        className="btn-action btn-view"
                        onClick={() => navigate(`/don-hang/${booking.id}`)}
                        title="Xem chi tiết"
                    >
                        <FaEye />
                    </button>
                );
        }
    };

    return (
        <div className="my-bookings-container mb-5">
            <div className="bookings-header">
                <h2>Đơn thuê xe của tôi</h2>
                <div className="booking-filters">
                    <button 
                        className={`filter-btn ${activeFilter === 'all' ? 'active' : ''}`}
                        onClick={() => setActiveFilter('all')}
                    >
                        Tất cả
                    </button>
                    <button 
                        className={`filter-btn ${activeFilter === 'PENDING' ? 'active' : ''}`}
                        onClick={() => setActiveFilter('PENDING')}
                    >
                        Chờ thanh toán
                    </button>
                    <button 
                        className={`filter-btn ${activeFilter === 'DEPOSIT' ? 'active' : ''}`}
                        onClick={() => setActiveFilter('DEPOSIT')}
                    >
                        Đã thanh toán
                    </button>
                    <button 
                        className={`filter-btn ${activeFilter === 'DELIVERING' ? 'active' : ''}`}
                        onClick={() => setActiveFilter('DELIVERING')}
                    >
                        Đang thuê
                    </button>
                    <button 
                        className={`filter-btn ${activeFilter === 'RETURNED' ? 'active' : ''}`}
                        onClick={() => setActiveFilter('RETURNED')}
                    >
                        Đã trả xe
                    </button>
                    <button 
                        className={`filter-btn ${activeFilter === 'CANCEL' ? 'active' : ''}`}
                        onClick={() => setActiveFilter('CANCEL')}
                    >
                        Đã hủy
                    </button>
                    <button 
                        className={`filter-btn ${activeFilter === 'REFUND' ? 'active' : ''}`}
                        onClick={() => setActiveFilter('REFUND')}
                    >
                        Đã hoàn tiền
                    </button>
                </div>
            </div>

            <div className="bookings-table-container">
                <table className="bookings-table">
                    <thead>
                        <tr>
                            <th>Mã đơn</th>
                            <th>Xe thuê</th>
                            <th>Ngày bắt đầu</th>
                            <th>Ngày kết thúc</th>
                            <th>Tổng tiền</th>
                            <th>Trạng thái</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {bookings.map((booking) => (
                            <tr key={booking.id}>
                                <td>
                                    <a href={`/don-hang/${booking.id}`} className="text-decoration-none text-dark">
                                        #{booking.id}
                                    </a>
                                </td>
                                <td>
                                    {booking.cars.map(car => (
                                        <a key={car.id} href={`/don-hang/${booking.id}`} className="text-decoration-none text-dark">
                                            <div className="car-info">
                                                {car.carName} - {car.licensePlate}
                                            </div>
                                        </a>
                                    ))}
                                </td>
                                <td>{formatDate(booking.startDate)}</td>
                                <td>{formatDate(booking.endDate)}</td>
                                <td className="price-column">{formatPrice(booking.totalPrice)}</td>
                                <td>
                                    <span className={`booking-status-badge ${getStatusBadgeClass(booking.status)}`}>
                                        {getStatusText(booking.status, booking.timeLeft)}
                                    </span>
                                </td>
                                <td>
                                    {renderActionButtons(booking)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showCancelReason && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Lý do hủy đơn #{selectedBookingId}</h3>
                        <p>{cancelReason}</p>
                        <button 
                            className="btn btn-primary"
                            onClick={() => setShowCancelReason(false)}
                        >
                            Đóng
                        </button>
                    </div>
                </div>
            )}

            {showFeedbackModal && feedbackData && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Đánh giá đơn hàng #{selectedBookingId}</h3>
                        <div className="feedback-display">
                            <div className="rating">
                                {[...Array(5)].map((_, index) => (
                                    <FaStar
                                        key={index}
                                        color={index < (feedbackData.numberFeedback || 0) ? "#ffc107" : "#e4e5e9"}
                                        size={20}
                                    />
                                ))}
                            </div>
                            <p className="feedback-content">{feedbackData.contentFeedback || 'Chưa có nội dung đánh giá'}</p>
                        </div>
                        <div className="modal-actions">
                            <button 
                                className="btn btn-secondary"
                                onClick={() => handleEditFeedback(selectedBookingId)}
                            >
                                Chỉnh sửa
                            </button>
                            <button 
                                className="btn btn-primary"
                                onClick={() => setShowFeedbackModal(false)}
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {toastMessage && (
                <ToastNotification 
                    message={toastMessage} 
                    onClose={() => setToastMessage('')} 
                />
            )}
        </div>
    );
};

export default MyBookings; 