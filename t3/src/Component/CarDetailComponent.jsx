import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { getBrandForCar, getCarByIdForCus, getCarImagesByCarId, getCarDetailById, isAuthenticated, createChat, getAllFeedbacksByCarId } from '../BackEnd/authen';
import { FaCar, FaCogs, FaGasPump, FaRoad, FaCalendarAlt, FaPalette, FaUsers, FaMapMarkerAlt, FaMoneyBillWave, FaChevronLeft, FaChevronRight, FaBluetooth, FaMapMarked, FaSun, FaLock, FaBaby, FaCompactDisc, FaUsb, FaCamera, FaSmokingBan, FaPaw, FaUtensils, FaMountain, FaBroom, FaTruck, FaComments, FaStar, FaRegStar, FaStarHalfAlt, FaTimes } from 'react-icons/fa';
import '../css/tab.css';

const CarDetailComponent = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [car, setCar] = useState(null);
  const [brand, setBrand] = useState(null);
  const [activeTab, setActiveTab] = useState(1);
  const [carImages, setCarImages] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(-1);
  const [carDetail, setCarDetail] = useState(null);
  const { carId } = useParams();
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [allFeedbacks, setAllFeedbacks] = useState([]);
  const [showAllFeedbacks, setShowAllFeedbacks] = useState(false);

  useEffect(() => {
    if (carId && carId !== "undefined") {
      console.log("Car ID từ URL:", carId);
      fetchCar();
      fetchCarImages();
      fetchCarDetail();
      fetchFeedbacks();
    } else {
      console.error("carId không hợp lệ:", carId);
    }
  }, [carId]);

  const fetchCar = async () => {
    try {
      const data = await getCarByIdForCus(carId);
      setCar(data);
      const dataBrand = await getBrandForCar(carId);
      setBrand(dataBrand);
    } catch (error) {
      console.error("Không tìm thấy thông tin xe:", error);
    }
  };

  const fetchCarImages = async () => {
    try {
      const images = await getCarImagesByCarId(carId);
      setCarImages(images);
    } catch (error) {
      console.error("Không tìm thấy ảnh xe:", error);
    }
  };

  const fetchCarDetail = async () => {
    try {
      const detail = await getCarDetailById(carId);
      setCarDetail(detail);
    } catch (error) {
      console.error("Không tìm thấy thông tin chi tiết xe:", error);
    }
  };

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

  const formatPrice = (price) => {
    return price ? price.toLocaleString('vi-VN') + '₫/ngày' : 'Đang cập nhật';
  };

  const handleBookCar = () => {
    if (!isAuthenticated()) {
      localStorage.setItem('redirectAfterLogin', `/chi-tiet/${carId}`);
      navigate("/dang-nhap", { 
        state: { 
          message: "Vui lòng đăng nhập để thuê xe",
          redirectTo: `/chi-tiet/${carId}`
        } 
      });
      return;
    }
    navigate(`/thue-xe/${carId}`);
  };

  const handleStartChat = async () => {
    if (!isAuthenticated()) {
      localStorage.setItem('redirectAfterLogin', `/chi-tiet/${carId}`);
      navigate("/dang-nhap", { 
        state: { 
          message: "Vui lòng đăng nhập để nhắn tin với chủ xe",
          redirectTo: `/chi-tiet/${carId}`
        } 
      });
      return;
    }

    try {
      setIsChatLoading(true);
      const chatData = await createChat(carId);
      navigate(`/chat/${chatData.id}`);
    } catch (error) {
      console.error("Lỗi khi tạo cuộc trò chuyện:", error);
      // You might want to show an error message to the user here
    } finally {
      setIsChatLoading(false);
    }
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

  useEffect(() => {
    const loginSuccess = new URLSearchParams(location.search).get('loginSuccess');
    if (loginSuccess === 'true') {
      navigate(`/thue-xe/${carId}`);
    }
  }, [location]);

  if (!car) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Đang tải thông tin xe...</p>
      </div>
    );
  }

  const getCurrentImageSrc = () => {
    if (currentImageIndex === -1) {
      return car.imagePaths ? `http://localhost:8080${car.imagePaths}` : '/default-image.jpg';
    }
    return `http://localhost:8080${carImages[currentImageIndex]}`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return 'warning';      // Chờ duyệt
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
      case 'PENDING': return 'Chờ duyệt';
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
    return `status-${status.toLowerCase()}`;
  };

  const getTransmissionText = (transmission) => {
    const transmissionMap = {
      'MANUAL': 'Số sàn',
      'AUTOMATIC': 'Số tự động',
      'CVT': 'Hộp số CVT',
      'DCT': 'Hộp số ly hợp kép',
    };
    return transmissionMap[transmission] || transmission;
  };

  const getFuelText = (fuel) => {
    const fuelMap = {
      'GASOLINE': 'Xăng',
      'DIESEL': 'Dầu diesel',
      'ELECTRIC': 'Điện',
      'HYBRID': 'Hybrid',
    };
    return fuelMap[fuel] || fuel;
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
    };
    return featureMap[feature] || feature.replace(/([A-Z])/g, ' $1').toLowerCase();
  };

  const renderStars = (rating) => {
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

  return (
    <div className='container px-5'>
      <div className="car-detail-container px-5">
        <div className="car-detail-header">
          <h2>{car.carName}</h2>
          <p>{brand ? brand.brandName : 'Đang tải...'} - {car.model}</p>
        </div>

        <div className="row">
          <div className="col-md-8">
            <div className="car-image-section">
              <div className="carousel-container">
                <img
                  src={getCurrentImageSrc()}
                  alt={`${car.carName} - ${currentImageIndex === -1 ? 'Main Image' : `Image ${currentImageIndex + 1}`}`}
                  className="img-fluid main-image"
                />
                {(carImages.length > 0 || car.imagePaths) && (
                  <div className="carousel-controls">
                    <button onClick={previousImage} className="carousel-control prev">
                      <FaChevronLeft />
                    </button>
                    <button onClick={nextImage} className="carousel-control next">
                      <FaChevronRight />
                    </button>
                  </div>
                )}
                <div className="thumbnail-container">
                  {car.imagePaths && (
                    <img
                      src={`http://localhost:8080${car.imagePaths}`}
                      alt={`${car.carName} - Main Image`}
                      className={`thumbnail ${currentImageIndex === -1 ? 'active' : ''}`}
                      onClick={() => setCurrentImageIndex(-1)}
                      onError={(e) => {
                        e.target.src = '/default-car.png';
                      }}
                    />
                  )}
                  {carImages.map((image, index) => (
                    <img
                      key={index}
                      src={`http://localhost:8080${image}`}
                      alt={`${car.carName} - Image ${index + 1}`}
                      className={`thumbnail ${index === currentImageIndex ? 'active' : ''}`}
                      onClick={() => setCurrentImageIndex(index)}
                      onError={(e) => {
                        e.target.src = '/default-car.png';
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="booking-section">
              <div className="price-display">
                {formatPrice(car.pricePerDay)}
              </div>
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
              <div className="action-buttons">
                <button className="book-button" onClick={handleBookCar}>
                  Đặt xe ngay
                </button>
                <button 
                  className="chat-button" 
                  onClick={handleStartChat}
                  disabled={isChatLoading}
                >
                  <FaComments /> {isChatLoading ? 'Đang xử lý...' : 'Nhắn tin với chủ xe'}
                </button>
                {allFeedbacks && allFeedbacks.length > 0 && (
                  <button 
                    className="feedback-button"
                    onClick={() => setShowAllFeedbacks(true)}
                  >
                    <FaComments className="me-2" />
                    Xem tất cả đánh giá
                  </button>
                )}
              </div>
              <div className="car-info-item">
                <FaMapMarkerAlt />
                <span>{car.address}</span>
              </div>
            </div>
          </div>
        </div>

        <div className='col-md-12'>
          <div className="car-info-section">
            <div className="car-features">
              <div className="feature-item">
                <FaCar />
                <span>Hãng xe: {brand ? brand.brandName : 'Đang tải...'}</span>
              </div>
              <div className="feature-item">
                <FaCogs />
                <span>Hộp số: {getTransmissionText(car.transmission)}</span>
              </div>
              <div className="feature-item">
                <FaGasPump />
                <span>Nhiên liệu: {getFuelText(car.fuel)}</span>
              </div>
              <div className="feature-item">
                <FaUsers />
                <span>Số ghế: {car.seats}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="container mt-5 mb-4">
          <div className="tab-header">
            <button
              type="button"
              className={`tab ${activeTab === 1 ? 'active' : ''}`}
              onClick={() => setActiveTab(1)}
            >
              Thông số kỹ thuật
            </button>
            <button
              type="button"
              className={`tab ${activeTab === 2 ? 'active' : ''}`}
              onClick={() => setActiveTab(2)}
            >
              Điều khoản thuê xe
            </button>
            <button
              type="button"
              className={`tab ${activeTab === 3 ? 'active' : ''}`}
              onClick={() => setActiveTab(3)}
            >
              Thông tin thêm
            </button>
          </div>

          <div className="tab-content">
            {activeTab === 1 && (
              <div className="specifications-grid">
                <div className="specification-item">
                  <strong>Biển số xe</strong>
                  <span>{car.licensePlate}</span>
                </div>
                <div className="specification-item">
                  <strong>Năm sản xuất</strong>
                  <span>{car.year}</span>
                </div>
                <div className="specification-item">
                  <strong>Màu sắc</strong>
                  <span>{car.color}</span>
                </div>
                <div className="specification-item">
                  <strong>Số ghế</strong>
                  <span>{car.seats} chỗ</span>
                </div>
                <div className="specification-item">
                  <strong>Hộp số</strong>
                  <span>{getTransmissionText(car.transmission)}</span>
                </div>
                <div className="specification-item">
                  <strong>Nhiên liệu</strong>
                  <span>{getFuelText(car.fuel)}</span>
                </div>
                {carDetail && (
                  <>
                    <div className="specification-item">
                      <strong>Số km đã đi</strong>
                      <span>{carDetail.mileage} km</span>
                    </div>
                    <div className="specification-item">
                      <strong>Định mức nhiên liệu</strong>
                      <span>{carDetail.fuelCommission} lít/100km</span>
                    </div>
                  </>
                )}
              </div>
            )}
            {activeTab === 2 && (
              <div>
                <h3>Điều khoản và quy định thuê xe</h3>
                <div className="terms-section">
                  <div className="terms-grid">
                    {carDetail && (
                      <>
                        {carDetail.noSmoking && (
                          <div className="term-item">
                            <FaSmokingBan className="term-icon" />
                            <span>Không hút thuốc trên xe</span>
                          </div>
                        )}
                        {carDetail.noPets && (
                          <div className="term-item">
                            <FaPaw className="term-icon" />
                            <span>Không mang thú cưng</span>
                          </div>
                        )}
                        {carDetail.noEating && (
                          <div className="term-item">
                            <FaUtensils className="term-icon" />
                            <span>Không ăn uống trên xe</span>
                          </div>
                        )}
                        {carDetail.returnFullTank && (
                          <div className="term-item">
                            <FaGasPump className="term-icon" />
                            <span>Trả xe với bình xăng đầy</span>
                          </div>
                        )}
                        {carDetail.noOffroad && (
                          <div className="term-item">
                            <FaMountain className="term-icon" />
                            <span>Không đi địa hình</span>
                          </div>
                        )}
                        {carDetail.cleanCar && (
                          <div className="term-item">
                            <FaBroom className="term-icon" />
                            <span>Vệ sinh xe sạch sẽ khi trả</span>
                          </div>
                        )}
                        {carDetail.noDeliveryService && (
                          <div className="term-item">
                            <FaTruck className="term-icon" />
                            <span>Không sử dụng để giao hàng</span>
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  <div className="general-terms">
                    <h4>Quy định chung</h4>
                    <ul>
                      <li>CMND/CCCD và GPLX (bắt buộc)</li>
                      <li>Hộ khẩu hoặc KT3 (tùy trường hợp)</li>
                      <li>Đặt cọc: 15-30 triệu (tiền mặt/chuyển khoản) hoặc xe máy + giấy tờ gốc</li>
                      <li>Thời gian thuê tính theo ngày (24 tiếng)</li>
                      <li>Phụ thu quá giờ: 10%/giờ, quá 3h tính 1 ngày</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
            {activeTab === 3 && (
              <div>
                <h3>Trang bị trên xe</h3>
                <div className="features-grid">
                  {carDetail && (
                    <>
                      {carDetail.bluetooth && (
                        <div className="feature-item">
                          <FaBluetooth className="feature-icon" />
                          <span>{getFeatureText('bluetooth')}</span>
                        </div>
                      )}
                      {carDetail.gps && (
                        <div className="feature-item">
                          <FaMapMarked className="feature-icon" />
                          <span>{getFeatureText('gps')}</span>
                        </div>
                      )}
                      {carDetail.sunRoof && (
                        <div className="feature-item">
                          <FaSun className="feature-icon" />
                          <span>{getFeatureText('sunRoof')}</span>
                        </div>
                      )}
                      {carDetail.childLock && (
                        <div className="feature-item">
                          <FaLock className="feature-icon" />
                          <span>{getFeatureText('childLock')}</span>
                        </div>
                      )}
                      {carDetail.childSeat && (
                        <div className="feature-item">
                          <FaBaby className="feature-icon" />
                          <span>{getFeatureText('childSeat')}</span>
                        </div>
                      )}
                      {carDetail.dvd && (
                        <div className="feature-item">
                          <FaCompactDisc className="feature-icon" />
                          <span>{getFeatureText('dvd')}</span>
                        </div>
                      )}
                      {carDetail.usb && (
                        <div className="feature-item">
                          <FaUsb className="feature-icon" />
                          <span>{getFeatureText('usb')}</span>
                        </div>
                      )}
                      {carDetail.camera && (
                        <div className="feature-item">
                          <FaCamera className="feature-icon" />
                          <span>{getFeatureText('camera')}</span>
                        </div>
                      )}
                    </>
                  )}
                </div>
                {carDetail?.description && (
                  <div className="car-description">
                    <h4>Mô tả thêm</h4>
                    <p>{carDetail.description}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      {renderFeedbackList()}
    </div>
  );
};

export default CarDetailComponent;
