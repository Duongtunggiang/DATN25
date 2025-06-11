import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  getBrandForCar, 
  getCarById, 
  getCarDetailById, 
  getCarImagesByCarId, 
  updateCarStatus,
  handleDeliverCar,
  handleRefund,
  confirmDelivery,
  confirmReturn,
  confirmRentByOwner,
  confirmReturnByOwner,
  setCarAvailable,
  getCarFeedback,
  getAllCarFeedbacks,
  getStatusBookingByCarId,
  refundDepositByCarOwner,
  getAllFeedbacksByCarId
} from '../BackEnd/authen';
import { 
  FaCar, FaCogs, FaGasPump, FaMapMarkerAlt, FaUsers, 
  FaChevronLeft, FaChevronRight, FaMoneyBillWave,
  FaStar, FaRegStar, FaStarHalfAlt, FaTimes, FaComments 
} from 'react-icons/fa';
import { 
  getStatusColor, 
  getStatusText, 
  getTransmissionText, 
  getFuelText, 
  getFeatureText 
} from '../utils/statusUtils';
import ToastNotification from '../Alert/ToastNotification';
import '../css/ChiTietXe.css';

const ChiTietXe = () => {
  const { carId } = useParams();
  const navigate = useNavigate();
  const [car, setCar] = useState(null);
  const [brand, setBrand] = useState(null);
  const [carDetail, setCarDetail] = useState(null);
  const [carImages, setCarImages] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(-1);
  const [toastMessage, setToastMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [currentBooking, setCurrentBooking] = useState(null);
  const [currentFeedback, setCurrentFeedback] = useState(null);
  const [feedbacks, setFeedbacks] = useState([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showAllFeedbacks, setShowAllFeedbacks] = useState(false);
  const [allFeedbacks, setAllFeedbacks] = useState([]);
  const [bookingStatus, setBookingStatus] = useState(null);

  useEffect(() => {
    if (carId) {
      fetchCarData();
      fetchFeedbacks();
    }
  }, [carId]);

  const fetchFeedbacks = async () => {
    try {
      const response = await getAllFeedbacksByCarId(carId);
      if (response && response.feedbacks) {
        setAllFeedbacks(response.feedbacks);
      }
    } catch (error) {
      console.error("Lỗi khi lấy danh sách đánh giá:", error);
    }
  };

  const fetchCarData = async () => {
    try {
      setLoading(true);
      // Fetch car data first
      const [carData, brandData, detailData, imagesData] = await Promise.all([
        getCarById(carId),
        getBrandForCar(carId),
        getCarDetailById(carId),
        getCarImagesByCarId(carId)
      ]);

      if (!carData) {
        setToastMessage("Không tìm thấy thông tin xe");
        return;
      }

      setCar(carData);
      setBrand(brandData);
      setCarDetail(detailData);
      setCarImages(imagesData || []);

      // Fetch booking status separately to handle errors
      try {
        const statusData = await getStatusBookingByCarId(carId);
        setBookingStatus(statusData);
      } catch (error) {
        console.error("Lỗi khi lấy trạng thái booking:", error?.message || error);
        // Don't set error message for booking status - just set it to null
        setBookingStatus(null);
      }

    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu xe:", error);
      setToastMessage("Không thể tải thông tin xe");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    if (!car || !newStatus) return;

    try {
      setProcessing(true);
      await updateCarStatus(carId, newStatus);
      await fetchCarData();
      setToastMessage(`Đã cập nhật trạng thái xe thành ${getStatusText(newStatus)}`);
    } catch (error) {
      console.error("Lỗi khi cập nhật trạng thái:", error);
      setToastMessage("Không thể cập nhật trạng thái xe");
    } finally {
      setProcessing(false);
    }
  };

  const handleStartDelivery = async () => {
    if (!car || processing) return;

    try {
      setProcessing(true);
      
      if (!currentBooking?.id) {
        setToastMessage("Không tìm thấy thông tin đặt xe");
        return;
      }
      
      await handleDeliverCar(currentBooking.id);
      setToastMessage("Đã bắt đầu giao xe");
      await fetchCarData();
    } catch (error) {
      console.error("Lỗi khi giao xe:", error);
      setToastMessage(error.message || "Không thể cập nhật trạng thái giao xe");
    } finally {
      setProcessing(false);
    }
  };

  const handleConfirmDelivery = async () => {
    if (!car || processing) return;

    try {
      setProcessing(true);
      
      if (!currentBooking?.id) {
        setToastMessage("Không tìm thấy thông tin đặt xe");
        return;
      }

      await confirmRentByOwner(currentBooking.id);
      setToastMessage("Đã xác nhận giao xe thành công");
      await fetchCarData();
    } catch (error) {
      console.error("Lỗi khi xác nhận giao xe:", error);
      setToastMessage(error.message || "Không thể xác nhận giao xe");
    } finally {
      setProcessing(false);
    }
  };

  const handleConfirmReturn = async () => {
    if (!car || processing) return;

    if (!window.confirm('Xác nhận đã nhận xe từ khách hàng?')) {
      return;
    }

    try {
      setProcessing(true);
      
      if (!currentBooking?.id) {
        setToastMessage("Không tìm thấy thông tin đặt xe");
        return;
      }

      await confirmReturnByOwner(currentBooking.id);
      setToastMessage("Đã xác nhận nhận xe thành công");
      await fetchCarData();
    } catch (error) {
      console.error("Lỗi khi xác nhận nhận xe:", error);
      setToastMessage(error.message || "Không thể xác nhận nhận xe");
    } finally {
      setProcessing(false);
    }
  };

  const handleRefundDeposit = async () => {
    if (!car || processing) return;

    if (!window.confirm('Bạn có chắc chắn muốn hoàn tiền cho khách hàng?')) {
      return;
    }

    try {
      setProcessing(true);
      
      if (!car.currentBookingId) {
        setToastMessage("Không tìm thấy thông tin đặt xe");
        return;
      }

      await refundDepositByCarOwner(car.currentBookingId);
      setToastMessage("Đã hoàn tiền thành công");
      await fetchCarData();
    } catch (error) {
      console.error("Lỗi khi hoàn tiền:", error);
      setToastMessage(error.message || "Không thể hoàn tiền. Vui lòng thử lại sau");
    } finally {
      setProcessing(false);
    }
  };

  const handleSetAvailable = async () => {
    if (!car || processing) return;

    if (!window.confirm('Bạn có chắc chắn muốn đặt xe về trạng thái sẵn sàng cho thuê?')) {
      return;
    }

    try {
      setProcessing(true);
      await updateCarStatus(car.id, 'AVAILABLE');
      setToastMessage("Đã đặt xe về trạng thái sẵn sàng cho thuê");
      await fetchCarData();
    } catch (error) {
      console.error("Lỗi khi cập nhật trạng thái xe:", error);
      setToastMessage(error.message || "Không thể cập nhật trạng thái xe");
    } finally {
      setProcessing(false);
    }
  };
  const handleGetStatusBooking = async () => {
    const status = await getStatusBookingByCarId(carId);
    console.log(status);
  };

  const handleViewFeedback = async () => {
    if (!car || processing) return;

    try {
      setProcessing(true);
      const feedbackData = await getCarFeedback(car.id);
      setCurrentFeedback(feedbackData);
      setShowFeedback(true);
    } catch (error) {
      console.error("Lỗi khi lấy đánh giá:", error);
      setToastMessage("Không thể lấy đánh giá. Vui lòng thử lại sau");
    } finally {
      setProcessing(false);
    }
  };

  const handleViewAllFeedbacks = async () => {
    try {
      setProcessing(true);
      setShowAllFeedbacks(true);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách đánh giá:", error);
      setToastMessage("Không thể lấy danh sách đánh giá. Vui lòng thử lại sau");
    } finally {
      setProcessing(false);
    }
  };

  const getStatusClass = (status) => {
    if (!status) return '';
    return `status-${status.toLowerCase()}`;
  };

  const nextImage = () => {
    setCurrentImageIndex((prevIndex) => {
      if (prevIndex === carImages.length - 1) return -1;
      return prevIndex + 1;
    });
  };

  const previousImage = () => {
    setCurrentImageIndex((prevIndex) => {
      if (prevIndex === -1) return carImages.length - 1;
      if (prevIndex === 0) return -1;
      return prevIndex - 1;
    });
  };

  const getCurrentImageSrc = () => {
    if (currentImageIndex === -1) {
      return car.imagePaths ? `http://localhost:8080${car.imagePaths}` : '/default-image.jpg';
    }
    return `http://localhost:8080${carImages[currentImageIndex]}`;
  };

  const renderStars = (rating) => {
    console.log('Rendering stars for rating:', rating); // Debug log
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <div className="star-rating">
        {[...Array(fullStars)].map((_, index) => (
          <FaStar key={`full-${index}`} className="text-warning star-icon" />
        ))}
        {hasHalfStar && <FaStarHalfAlt key="half" className="text-warning star-icon" />}
        {[...Array(emptyStars)].map((_, index) => (
          <FaRegStar key={`empty-${index}`} className="star-icon" />
        ))}
      </div>
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderActionButtons = () => {
    if (!car || processing) return null;

    const commonButtons = (
      <>
        {allFeedbacks && allFeedbacks.length > 0 && (
          <button 
            className="btn btn-info me-2"
            onClick={handleViewAllFeedbacks}
            disabled={processing}
          >
            <FaComments className="me-2" />
            Xem tất cả đánh giá
          </button>
        )}
        <Link 
          to={`/cap-nhat-xe/${car.id}`} 
          className="btn btn-warning me-2"
        >
          <FaCogs className="me-2" />
          Cập nhật xe
        </Link>
      </>
    );

    // Only show setAvailable button for CANCEL and RETURNED status
    if (car.status === 'CANCEL' || car.status === 'RETURNED') {
      return (
        <div className="d-flex gap-2">
          {commonButtons}
          <button 
            className="btn btn-success"
            onClick={handleSetAvailable}
            disabled={processing}
          >
            Đặt trạng thái sẵn sàng cho thuê
          </button>
        </div>
      );
    }

    // For other statuses, just show the common buttons
    return commonButtons;
  };

  const renderFeedbackList = () => {
    if (!showAllFeedbacks || !allFeedbacks?.length) return null;

    return (
      <div className="feedback-modal">
        <div className="feedback-content">
          <button 
            className="close-button"
            onClick={() => setShowAllFeedbacks(false)}
          >
            <FaTimes />
          </button>
          <div className="feedback-header">
            <h3>Danh sách đánh giá từ khách hàng</h3>
          </div>
          <div className="feedback-list">
            {allFeedbacks.map((feedback, index) => (
              <div key={index} className="feedback-item">
                <div className="feedback-header">
                  <div className="rating">
                    {[...Array(5)].map((_, i) => (
                      <FaStar
                        key={i}
                        color={i < feedback.rating ? "#ffc107" : "#e4e5e9"}
                        size={16}
                      />
                    ))}
                  </div>
                  <span className="feedback-date">
                    {new Date(feedback.feedbackDate).toLocaleDateString('vi-VN')}
                  </span>
                </div>
                <div className="comment-container">
                  <p className="feedback-text">{feedback.content}</p>
                </div>
                <div className="feedback-booking">
                  <small>Khách hàng: {feedback.customerName}</small>
                </div>
              </div>
            ))}
          </div>
          <div className="feedback-actions">
            <button onClick={() => setShowAllFeedbacks(false)}>
              Đóng
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderFeedback = () => {
    if (!showFeedback || !currentFeedback) return null;

    return (
      <div className="feedback-modal">
        <div className="feedback-content">
          <button 
            className="close-button"
            onClick={() => setShowFeedback(false)}
          >
            <FaTimes />
          </button>
          <div className="feedback-header">
            <h3>Đánh giá gần nhất</h3>
          </div>
          <div className="feedback-list">
            <div className="feedback-item">
              <div className="feedback-header">
                <div className="rating">
                  {[...Array(5)].map((_, i) => (
                    <FaStar
                      key={i}
                      color={i < currentFeedback.numberFeedback ? "#ffc107" : "#e4e5e9"}
                      size={16}
                    />
                  ))}
                </div>
                <span className="feedback-date">
                  {new Date(currentFeedback.createdAt).toLocaleDateString('vi-VN')}
                </span>
              </div>
              <div className="comment-container">
                <p className="feedback-text">{currentFeedback.contentFeedback}</p>
              </div>
              <div className="feedback-booking">
                <small>Mã đơn: #{currentFeedback.bookingId}</small>
              </div>
            </div>
          </div>
          <div className="feedback-actions">
            <button onClick={() => setShowFeedback(false)}>
              Đóng
            </button>
          </div>
        </div>
      </div>
    );
  };

  const getFeatureText = (feature) => {
    const featureMap = {
      'bluetooth': 'Bluetooth',
      'gps': 'Định vị GPS',
      'usb': 'Cổng USB',
      'camera': 'Camera lùi',
      'sunRoof': 'Cửa sổ trời',
      'childSeat': 'Ghế trẻ em',
      'childLock': 'Khóa an toàn trẻ em',
      'dvd': 'Màn hình DVD',
      'airConditioner': 'Điều hòa',
      'airBag': 'Túi khí an toàn',
      'parkingSensor': 'Cảm biến đỗ xe',
      'cruiseControl': 'Kiểm soát hành trình',
      'noSmoking': 'Không hút thuốc trên xe',
      'noPets': 'Không mang thú cưng',
      'noEating': 'Không ăn uống trên xe',
      'returnFullTank': 'Trả xe với bình xăng đầy',
      'noOffroad': 'Không đi địa hình',
      'cleanCar': 'Vệ sinh xe sạch sẽ khi trả',
      'noDeliveryService': 'Không sử dụng để giao hàng'
    };
    return featureMap[feature] || feature.replace(/([A-Z])/g, ' $1').toLowerCase();
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

  if (!car) {
    return (
      <div className="error-container">
        <h3>Không tìm thấy thông tin xe</h3>
        <button className="btn btn-primary" onClick={() => navigate(-1)}>
          Quay lại
        </button>
      </div>
    );
  }

  return (
    <div className="car-detail-page">
      <div className="car-detail-container">
        <div className="car-detail-header">
          <h2>{car.carName}</h2>
          <div className="car-header-info">
            <p>
              {brand?.brandName} - {car.model} {car.year}
              <br />
              <span className="license-plate">Biển số: {car.licensePlate}</span>
            </p>
            {car.status && (
              <span className={`status-badge status-${getStatusColor(car.status)}`}>
                {getStatusText(car.status)}
              </span>
            )}
          </div>
        </div>

        <div className="row">
          <div className="col-md-8">
            <div className="car-image-section">
              <div className="carousel-container">
                <img
                  src={getCurrentImageSrc()}
                  alt={car.carName}
                  className="img-fluid main-image"
                />
                {car.status && (
                  <span className={`status-badge ${getStatusClass(car.status)}`}>
                    {getStatusText(car.status)}
                  </span>
                )}
                {(carImages.length > 0 || car.imagePaths) && (
                  <div className="carousel-controls">
                    <button onClick={previousImage} className="carousel-control prev" title="Ảnh trước">
                      <FaChevronLeft />
                    </button>
                    <button onClick={nextImage} className="carousel-control next" title="Ảnh tiếp theo">
                      <FaChevronRight />
                    </button>
                  </div>
                )}
                <div className="thumbnail-container">
                  {car.imagePaths && (
                    <img
                      src={`http://localhost:8080${car.imagePaths}`}
                      alt={`${car.carName} - Ảnh chính`}
                      className={`thumbnail ${currentImageIndex === -1 ? 'active' : ''}`}
                      onClick={() => setCurrentImageIndex(-1)}
                    />
                  )}
                  {carImages.map((image, index) => (
                    <img
                      key={index}
                      src={`http://localhost:8080${image}`}
                      alt={`${car.carName} - Ảnh ${index + 1}`}
                      className={`thumbnail ${index === currentImageIndex ? 'active' : ''}`}
                      onClick={() => setCurrentImageIndex(index)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="car-info-section">
              <div className="price-section">
                <span className="price">{car.pricePerDay?.toLocaleString('vi-VN')}đ</span>
                <span className="price-period">/ngày</span>
                <div className="rating-section mt-2">
                  {allFeedbacks && allFeedbacks.length > 0 ? (
                    <div className="average-rating">
                      {(() => {
                        const avgRating = allFeedbacks.reduce((acc, curr) => acc + curr.rating, 0) / allFeedbacks.length;
                        return (
                          <>
                            {renderStars(avgRating)}
                            <span className="rating-count">({allFeedbacks.length} đánh giá)</span>
                          </>
                        );
                      })()}
                    </div>
                  ) : (
                    <div className="no-rating">
                      <span>Chưa có đánh giá</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="specs-grid">
                <div className="spec-item" title="Số chỗ ngồi">
                  <FaUsers className="spec-icon" />
                  <span>{car.seats} chỗ</span>
                </div>
                <div className="spec-item" title="Hộp số">
                  <FaCogs className="spec-icon" />
                  <span>{getTransmissionText(car.transmission)}</span>
                </div>
                <div className="spec-item" title="Nhiên liệu">
                  <FaGasPump className="spec-icon" />
                  <span>{getFuelText(car.fuel)}</span>
                </div>
                <div className="spec-item" title="Địa chỉ">
                  <FaMapMarkerAlt className="spec-icon" />
                  <span>{car.address}</span>
                </div>
              </div>

              <div className="action-buttons">
                {renderActionButtons()}
              </div>
            </div>
          </div>
        </div>

        {carDetail && (
          <div className="features-section">
            <h3>Tính năng xe</h3>
            <div className="features-grid">
              {Object.entries(carDetail).map(([key, value]) => {
                if (typeof value === 'boolean' && value) {
                  return (
                    <div key={key} className="feature-item">
                      <FaCar className="feature-icon" />
                      <span>{getFeatureText(key)}</span>
                    </div>
                  );
                }
                return null;
              })}
            </div>
          </div>
        )}
      </div>

      {renderFeedback()}
      {renderFeedbackList()}
      {toastMessage && (
        <ToastNotification 
          message={toastMessage} 
          onClose={() => setToastMessage('')} 
        />
      )}
    </div>
  );
};

export default ChiTietXe;

