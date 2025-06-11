import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  getCarOwnerBookings, 
  handleDeliverCar, 
  confirmRentByOwner,
  confirmReturnByOwner,
  refundDepositByCarOwner,
  setCarAvailable
} from '../BackEnd/authen';
import { FaMoneyBillWave, FaCar, FaCheck } from 'react-icons/fa';
import ToastNotification from '../Alert/ToastNotification';

const CarOwnerBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const data = await getCarOwnerBookings();
      setBookings(data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setToastMessage('Không thể tải danh sách đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  const handleStartDelivery = async (bookingId) => {
    if (processing) return;
    try {
      setProcessing(true);
      await handleDeliverCar(bookingId);
      setToastMessage('Đã bắt đầu giao xe');
      await fetchBookings();
    } catch (error) {
      console.error('Error starting delivery:', error);
      setToastMessage(error.message || 'Không thể bắt đầu giao xe');
    } finally {
      setProcessing(false);
    }
  };

  const handleConfirmRent = async (bookingId) => {
    if (processing) return;
    try {
      setProcessing(true);
      await confirmRentByOwner(bookingId);
      setToastMessage('Đã xác nhận cho thuê xe');
      await fetchBookings();
    } catch (error) {
      console.error('Error confirming rent:', error);
      setToastMessage(error.message || 'Không thể xác nhận cho thuê');
    } finally {
      setProcessing(false);
    }
  };

  const handleConfirmReturn = async (bookingId) => {
    if (processing) return;
    try {
      setProcessing(true);
      await confirmReturnByOwner(bookingId);
      setToastMessage('Đã xác nhận nhận xe');
      await fetchBookings();
    } catch (error) {
      console.error('Error confirming return:', error);
      setToastMessage(error.message || 'Không thể xác nhận nhận xe');
    } finally {
      setProcessing(false);
    }
  };

  const handleRefund = async (bookingId) => {
    if (processing) return;
    if (!window.confirm('Bạn có chắc chắn muốn hoàn tiền cho khách hàng?')) return;

    try {
      setProcessing(true);
      await refundDepositByCarOwner(bookingId);
      setToastMessage('Đã hoàn tiền thành công');
      await fetchBookings();
    } catch (error) {
      console.error('Error processing refund:', error);
      setToastMessage(error.message || 'Không thể hoàn tiền');
    } finally {
      setProcessing(false);
    }
  };

  const handleSetAvailable = async (carId, bookingId) => {
    if (processing) return;
    try {
      setProcessing(true);
      await setCarAvailable(carId, bookingId);
      setToastMessage('Đã đặt xe về trạng thái sẵn sàng cho thuê');
      await fetchBookings();
    } catch (error) {
      console.error('Error setting car available:', error);
      setToastMessage(error.message || 'Không thể cập nhật trạng thái xe');
    } finally {
      setProcessing(false);
    }
  };

  const renderActionButtons = (booking) => {
    const status = booking.status;
    
    switch (status) {
      case 'DEPOSIT':
        return (
          <button 
            className="btn btn-primary"
            onClick={() => handleStartDelivery(booking.id)}
            disabled={processing}
          >
            <FaCar className="me-2" />
            Bắt đầu giao xe
          </button>
        );
      
      case 'DELIVERING':
        return (
          <button 
            className="btn btn-success"
            onClick={() => handleConfirmRent(booking.id)}
            disabled={processing}
          >
            <FaCheck className="me-2" />
            Xác nhận đã giao xe
          </button>
        );
      
      case 'RENTED':
        return (
          <button 
            className="btn btn-warning"
            onClick={() => handleConfirmReturn(booking.id)}
            disabled={processing}
          >
            Xác nhận nhận xe
          </button>
        );
      
      case 'CANCEL':
        return booking.status !== 'REFUND' ? (
          <button 
            className="btn btn-warning"
            onClick={() => handleRefund(booking.id)}
            disabled={processing}
          >
            <FaMoneyBillWave className="me-2" />
            Hoàn tiền
          </button>
        ) : null;
      
      case 'RETURNED':
      case 'REFUND':
      case 'FEEDBACK':
        return booking.cars.map(car => (
          <button 
            key={car.id}
            className="btn btn-success"
            onClick={() => handleSetAvailable(car.id, booking.id)}
            disabled={processing}
          >
            Đặt xe {car.licensePlate} sẵn sàng
          </button>
        ));
      
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Đang tải...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <h2>Quản lý đơn đặt xe</h2>
      
      <div className="booking-list">
        {bookings.length === 0 ? (
          <div className="alert alert-info">Không có đơn đặt xe nào</div>
        ) : (
          bookings.map(booking => (
            <div key={booking.id} className="card mb-3">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <h5 className="card-title">Đơn #{booking.id}</h5>
                    <p className="card-text">
                      <strong>Khách hàng:</strong> {booking.customer.fullName}<br />
                      <strong>SĐT:</strong> {booking.customer.phone}<br />
                      <strong>Trạng thái:</strong> <span className={`badge bg-${getStatusColor(booking.status)}`}>
                        {getStatusText(booking.status)}
                      </span>
                    </p>
                  </div>
                  <div className="text-end">
                    <h6>Tổng tiền: {booking.totalPrice.toLocaleString('vi-VN')}đ</h6>
                    <small>
                      Từ: {new Date(booking.startDate).toLocaleDateString('vi-VN')}<br />
                      Đến: {new Date(booking.endDate).toLocaleDateString('vi-VN')}
                    </small>
                  </div>
                </div>

                <div className="car-list mt-3">
                  <h6>Xe thuê:</h6>
                  {booking.cars.map(car => (
                    <div key={car.id} className="car-item">
                      <span>{car.carName} - {car.licensePlate}</span>
                      <span>{car.pricePerDay.toLocaleString('vi-VN')}đ/ngày</span>
                    </div>
                  ))}
                </div>

                <div className="action-buttons mt-3">
                  {renderActionButtons(booking)}
                </div>
              </div>
            </div>
          ))
        )}
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

const getStatusColor = (status) => {
  switch (status) {
    case 'PENDING': return 'warning';
    case 'DEPOSIT': return 'info';
    case 'DELIVERING': return 'primary';
    case 'RENTED': return 'success';
    case 'RETURNED': return 'secondary';
    case 'CANCEL': return 'danger';
    case 'REFUND': return 'dark';
    case 'CANCELPENDING' : return 'danger';
    default: return 'secondary';
  }
};

const getStatusText = (status) => {
  switch (status) {
    case 'PENDING': return 'Chờ duyệt';
    case 'DEPOSIT': return 'Đã đặt cọc';
    case 'DELIVERING': return 'Đang giao xe';
    case 'RENTED': return 'Đang cho thuê';
    case 'RETURNED': return 'Đã trả xe';
    case 'CANCEL': return 'Đã hủy';
    case 'REFUND': return 'Đã hoàn tiền';
    case 'CANCELPENDING' : return 'Hủy đơn hàng chưa thanh toán';
    default: return status;
  }
};

export default CarOwnerBookings; 