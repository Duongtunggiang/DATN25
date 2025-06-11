import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getWalletBalance, getCarByIdForCus, createVnPayBookingPayment } from '../BackEnd/authen';
import axiosInstance from '../Authen/axiosInstance';
import { FaCalendarAlt, FaCar, FaWallet, FaCheckCircle, FaArrowRight, FaCreditCard } from 'react-icons/fa';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/Booking.css';

const BookingComponent = () => {
  const { carId } = useParams();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [bookingId, setBookingId] = useState(null);
  const [walletBalance, setWalletBalance] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [calculatedPrice, setCalculatedPrice] = useState(0);
  const [bookingDetails, setBookingDetails] = useState(null);
  const [error, setError] = useState('');
  const [carDetails, setCarDetails] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('WALLET');

  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    carIds: [parseInt(carId)],
    paymentMethod: 'WALLET',
  });

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [walletData, carData] = await Promise.all([
          getWalletBalance(),
          getCarByIdForCus(carId)
        ]);
        setWalletBalance(walletData.balance);
        setCarDetails(carData);
      } catch (error) {
        console.error('Error fetching initial data:', error);
        setError('Không thể tải thông tin. Vui lòng thử lại sau.');
      }
    };
    fetchInitialData();
  }, [carId]);

  const calculatePrice = async () => {
    if (formData.startDate && formData.endDate) {
      try {
        const response = await axiosInstance.post('/api/bookings/calculate', {
          carIds: formData.carIds,
          startDate: formData.startDate,
          endDate: formData.endDate
        });
        if (response.data !== null && response.data !== undefined) {
          setCalculatedPrice(response.data);
          setError(''); // Clear any previous errors
        } else {
          throw new Error('Không thể tính toán giá thuê xe');
        }
      } catch (error) {
        console.error('Error calculating price:', error);
        const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Không thể tính toán giá thuê xe';
        setError(errorMessage);
        setCalculatedPrice(0);
      }
    }
  };

  useEffect(() => {
    if (formData.startDate && formData.endDate) {
      calculatePrice();
    }
  }, [formData.startDate, formData.endDate]);

  const handleNext = async () => {
    setError('');
    if (step === 1) {
      if (!formData.startDate || !formData.endDate) {
        setError('Vui lòng chọn ngày bắt đầu và kết thúc');
        return;
      }

      if (calculatedPrice <= 0) {
        setError('Không thể xác định giá thuê xe. Vui lòng thử lại.');
        return;
      }

      try {
        setLoading(true);
        // Create booking
        const response = await axiosInstance.post('/api/bookings/create', {
          carIds: formData.carIds,
          startDate: formData.startDate,
          endDate: formData.endDate
        });

        // Check if we have a response
        if (!response || !response.data) {
          throw new Error('Không nhận được phản hồi từ server');
        }

        // Log the response for debugging
        console.log('Booking creation response:', response.data);

        // Wait a short moment for the booking to be processed
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Get all bookings to find the newly created one
        try {
          const bookingsResponse = await axiosInstance.get('/api/bookings/my-bookings');
          console.log('All bookings response:', bookingsResponse.data);

          if (bookingsResponse?.data && Array.isArray(bookingsResponse.data)) {
            // Find the most recent booking that matches our dates
            const newBooking = bookingsResponse.data
              .filter(booking => 
                booking.startDate === formData.startDate &&
                booking.endDate === formData.endDate &&
                booking.cars.some(car => formData.carIds.includes(car.id))
              )
              .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))[0];

            if (newBooking?.id) {
              console.log('Found new booking:', newBooking);
              setBookingId(newBooking.id);
              setBookingDetails(newBooking);
              setTotalPrice(calculatedPrice);
              setStep(2);
            } else {
              throw new Error('Không tìm thấy đơn hàng vừa tạo');
            }
          } else {
            throw new Error('Không thể lấy danh sách đơn hàng');
          }
        } catch (fetchError) {
          console.error('Error fetching bookings:', fetchError);
          // Try to get the booking directly from the creation response
          if (response.data.id) {
            setBookingId(response.data.id);
            setBookingDetails(response.data);
            setTotalPrice(calculatedPrice);
            setStep(2);
          } else {
            throw new Error('Không thể xác nhận đơn hàng. Vui lòng kiểm tra trong lịch sử đơn hàng của bạn.');
          }
        }
      } catch (error) {
        console.error('Error creating booking:', error);
        let errorMessage = 'Có lỗi xảy ra khi tạo đơn đặt xe';
        
        if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error.response?.data?.error) {
          errorMessage = error.response.data.error;
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        if (errorMessage.includes('không sẵn sàng')) {
          errorMessage = 'Xe này hiện không có sẵn để đặt. Vui lòng chọn xe khác hoặc thời gian khác.';
        }
        
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    } else if (step === 2) {
      if (paymentMethod === 'WALLET' && calculatedPrice > walletBalance) {
        setError('Số dư trong ví không đủ. Vui lòng nạp thêm tiền để tiếp tục.');
        return;
      }
      setStep(3);
    }
  };

  const handleBack = () => {
    setError('');
    setStep(step - 1);
  };

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePayment = async () => {
    // Ensure we have a valid booking ID
    if (!bookingId) {
      console.error('Missing booking ID');
      setError('Không tìm thấy thông tin đơn hàng. Vui lòng thử lại.');
      return;
    }

    try { 
      setLoading(true);
      console.log('Processing payment for booking:', bookingId);

      if (paymentMethod === 'WALLET') {
        const response = await axiosInstance.post(`/api/bookings/${bookingId}/pay`);
        console.log('Wallet payment response:', response?.data);

        if (response?.data) {
          alert(`Thanh toán thành công: ${calculatedPrice.toLocaleString('vi-VN')}đ cho đơn hàng #${bookingId}`);
          // Redirect to order history page
          window.location.href = '/don-hang';
        } else {
          throw new Error('Không nhận được xác nhận thanh toán từ server');
        }
      } else if (paymentMethod === 'VNPAY') {
        console.log('Initiating VNPay payment for booking:', bookingId);

        const response = await axiosInstance.get('/api/vnpay/create-booking-payment', {
          params: {
            amount: calculatedPrice,
            bankCode: 'NCB',
            locale: 'vn',
            bookingId: bookingId,
            returnUrl: 'http://localhost:3000/dat-xe/thanh-cong'
          }
        });
        
        console.log('VNPay payment response:', response?.data);
        
        if (response?.data?.url) {
          // Redirect to VNPay payment page
          window.location.href = response.data.url;
        } else {
          throw new Error('Không nhận được thông tin thanh toán từ VNPay');
        }
      }
    } catch (error) {
      console.error('Payment error:', error);
      let errorMessage = 'Có lỗi xảy ra khi thanh toán';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <div className="booking-steps mb-4">
      <div className={`step ${step >= 1 ? 'active' : ''}`}>
        <div className="step-icon">
          <FaCar />
        </div>
        <div className="step-label">Thông tin đặt xe</div>
      </div>
      <div className="step-connector"></div>
      <div className={`step ${step >= 2 ? 'active' : ''}`}>
        <div className="step-icon">
          <FaWallet />
        </div>
        <div className="step-label">Thanh toán</div>
      </div>
      <div className="step-connector"></div>
      <div className={`step ${step >= 3 ? 'active' : ''}`}>
        <div className="step-icon">
          <FaCheckCircle />
        </div>
        <div className="step-label">Xác nhận</div>
      </div>
    </div>
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return 'warning';      // Chờ thanh toán
      case 'AVAILABLE': return 'success';    // Sẵn sàng cho thuê
      case 'DEPOSIT': return 'info';         // Đã được cọc
      case 'BOOKED': return 'primary';       // Đã có người thuê
      case 'DELIVERING': return 'delivering'; // Đang giao xe
      case 'RENTED': return 'rented';        // Đang cho thuê
      case 'RETURNED': return 'returned';     // Đã trả xe
      case 'INACTIVE': return 'secondary';    // Tạm ẩn
      case 'DELETED': return 'danger';        // Đã xóa
      case 'REJECTED': return 'rejected';     // Từ chối
      case 'CANCEL': return 'cancel';        // Đã hủy
      case 'REFUND': return 'refund';        // Đã hoàn tiền
      default: return 'secondary';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'PENDING': return 'Chờ thanh toán';
      case 'AVAILABLE': return 'Sẵn sàng cho thuê';
      case 'DEPOSIT': return 'Đã được cọc';
      case 'BOOKED': return 'Đã có người thuê';
      case 'DELIVERING': return 'Đang giao xe';
      case 'RENTED': return 'Đang cho thuê';
      case 'RETURNED': return 'Đã trả xe';
      case 'INACTIVE': return 'Tạm ẩn';
      case 'DELETED': return 'Đã xóa';
      case 'REJECTED': return 'Bị từ chối';
      case 'CANCEL': return 'Đã hủy';
      case 'REFUND': return 'Đã hoàn tiền';
      default: return status;
    }
  };

  const getStatusClass = (status) => {
    if (!status) return '';
    const colorClass = getStatusColor(status);
    return `status-${status.toLowerCase()} status-${colorClass}`;
  };

  const getPaymentMethodText = (method) => {
    const methodMap = {
      'WALLET': 'Ví tiền',
      'VNPAY': 'VNPay',
      'CASH': 'Tiền mặt',
      'BANK_TRANSFER': 'Chuyển khoản',
    };
    return methodMap[method] || method;
  };

  return (
    <div className="booking-container">
      <div className="booking-card">
        {renderStepIndicator()}

        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        {step === 1 && (
          <div className="booking-step-content">
            <h3 className="section-title">
              <FaCalendarAlt className="me-2" />
              Chọn thời gian thuê xe
            </h3>
            
            {carDetails && (
              <div className="car-info-card">
                <div className="row g-4">
                  <div className="col-md-6">
                    <div className="car-image">
                      <img src={`http://localhost:8080${carDetails.imagePaths}`} alt={carDetails.carName} />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="car-details">
                      <h4>{carDetails.carName}</h4>
                      <p><strong>Biển số:</strong> {carDetails.licensePlate}</p>
                      <p className="price"><strong>Giá thuê:</strong> {carDetails.pricePerDay?.toLocaleString('vi-VN')} VNĐ/ngày</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="date-picker-container">
              <div className="form-group">
                <label>Ngày bắt đầu:</label>
                <input
                  type="date"
                  className="form-control"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div className="date-arrow">
                <FaArrowRight />
              </div>
              <div className="form-group">
                <label>Ngày kết thúc:</label>
                <input
                  type="date"
                  className="form-control"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  min={formData.startDate}
                />
              </div>
            </div>

            {calculatedPrice > 0 && (
              <div className="price-preview mt-3">
                <h4>Tổng tiền dự kiến: {calculatedPrice.toLocaleString('vi-VN')} VNĐ</h4>
              </div>
            )}

            <div className="button-group">
              <button 
                className="btn btn-primary btn-lg"
                onClick={handleNext}
                disabled={loading || !formData.startDate || !formData.endDate}
              >
                {loading ? 'Đang xử lý...' : 'Tiếp tục'}
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="booking-step-content">
            <h3 className="section-title">
              <FaWallet className="me-2" />
              Thanh toán
            </h3>

            <div className="payment-info">
              <div className="info-card">
                <div className="info-row">
                  <span>Số dư ví:</span>
                  <span className="value">{walletBalance.toLocaleString('vi-VN')} VNĐ</span>
                </div>
                <div className="info-row total">
                  <span>Tổng tiền cần thanh toán:</span>
                  <span className="value">{calculatedPrice.toLocaleString('vi-VN')} VNĐ</span>
                </div>
              </div>

              <div className="payment-methods mt-4">
                <h4>Chọn phương thức thanh toán:</h4>
                <div className="payment-options">
                  <div className="form-check payment-option">
                    <input
                      type="radio"
                      className="form-check-input"
                      id="wallet"
                      name="paymentMethod"
                      value="WALLET"
                      checked={paymentMethod === 'WALLET'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <label className="form-check-label" htmlFor="wallet">
                      <FaWallet className="me-2" />
                      Ví tiền ({walletBalance.toLocaleString('vi-VN')} VNĐ)
                      {calculatedPrice > walletBalance && (
                        <div>
                          <span className="text-danger ms-2">(Số dư không đủ)</span>
                          <a href="/vi-tien" className='btn btn-primary'>Nạp tiền vào ví</a>
                        </div>
                      )}
                    </label>
                  </div>

                  <div className="form-check payment-option">
                    <input
                      type="radio"
                      className="form-check-input"
                      id="vnpay"
                      name="paymentMethod"
                      value="VNPAY"
                      checked={paymentMethod === 'VNPAY'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <label className="form-check-label" htmlFor="vnpay">
                      <FaCreditCard className="me-2" />
                      VNPay (Thẻ ATM/Thẻ tín dụng)
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="button-group">
              <button 
                className="btn btn-outline-secondary"
                onClick={handleBack}
                disabled={loading}
              >
                Quay lại
              </button>
              <button 
                className="btn btn-primary"
                onClick={handlePayment}
                disabled={loading || (paymentMethod === 'WALLET' && calculatedPrice > walletBalance)}
              >
                {loading ? 'Đang xử lý...' : 'Thanh toán ngay'}
              </button>
            </div>
          </div>
        )}

        {step === 3 && bookingDetails && (
          <div className="booking-step-content">
            <h3 className="section-title">
              <FaCheckCircle className="me-2" />
              Xác nhận đặt xe
            </h3>

            <div className="confirmation-details">
              <div className="info-section">
                <h5>Thông tin khách hàng</h5>
                <div className="info-card">
                  <p><strong>Họ và tên:</strong> {bookingDetails.customer?.fullName}</p>
                  <p><strong>Số điện thoại:</strong> {bookingDetails.customer?.phone}</p>
                </div>
              </div>

              <div className="info-section">
                <h5>Thông tin thuê xe</h5>
                <div className="info-card">
                  <p><strong>Thời gian thuê:</strong></p>
                  <p className="date-range">
                    {new Date(bookingDetails.startDate).toLocaleDateString('vi-VN')} 
                    <FaArrowRight className="mx-2" />
                    {new Date(bookingDetails.endDate).toLocaleDateString('vi-VN')}
                  </p>
                  <p><strong>Số ngày thuê:</strong> {Math.ceil((new Date(bookingDetails.endDate) - new Date(bookingDetails.startDate)) / (1000 * 60 * 60 * 24) + 1)} ngày</p>
                </div>
              </div>

              <div className="info-section">
                <h5>Chi tiết thanh toán</h5>
                <div className="info-card payment-summary">
                  <div className="info-row">
                    <span>Tổng tiền:</span>
                    <span className="total-amount">{totalPrice.toLocaleString('vi-VN')} VNĐ</span>
                  </div>
                  <div className="info-row">
                    <span>Phương thức:</span>
                    <span>{paymentMethod === 'WALLET' ? 'Ví tiền' : 'VNPay'}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="button-group">
              <button 
                className="btn btn-outline-secondary"
                onClick={handleBack}
                disabled={loading}
              >
                Quay lại
              </button>
              <button 
                className="btn btn-success btn-lg"
                onClick={handlePayment}
                disabled={loading}
              >
                {loading ? 'Đang xử lý...' : 'Xác nhận và thanh toán'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingComponent;
