import React, { useState, useEffect } from 'react';
import { getMyCars, deleteCar, getAllFeedbacksByCarId } from '../BackEnd/authen';
import { useNavigate } from 'react-router-dom';
import { FaTrash, FaEdit, FaCar, FaGasPump, FaCog, FaMoneyBillWave, FaPlus, FaStar, FaRegStar, FaStarHalfAlt, FaMapMarkerAlt, FaUsers, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import ToastNotification from '../Alert/ToastNotification';
import { getStatusColor, getStatusText, formatPrice, getTransmissionText } from '../utils/statusUtils';
import '../css/HomeXe.css';

function HomeXeComp() {
  const [cars, setCars] = useState([]);
  const [toastMessage, setToastMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [carRatings, setCarRatings] = useState({});
  const carsPerPage = 12; // 4 columns x 3 rows
  const navigate = useNavigate();

  useEffect(() => {
    fetchCars();
  }, []);

  const fetchCars = async () => {
    try {
      setLoading(true);
      const cars = await getMyCars();
      setCars(cars);
      
      // Fetch ratings for all cars
      const ratingsPromises = cars.map(async (car) => {
        try {
          const response = await getAllFeedbacksByCarId(car.id);
          if (response && response.feedbacks) {
            const avgRating = response.feedbacks.reduce((acc, curr) => acc + curr.rating, 0) / response.feedbacks.length;
            return { carId: car.id, rating: avgRating, count: response.feedbacks.length };
          }
        } catch (error) {
          console.error(`Error fetching ratings for car ${car.id}:`, error);
        }
        return { carId: car.id, rating: 0, count: 0 };
      });

      const ratings = await Promise.all(ratingsPromises);
      const ratingsMap = ratings.reduce((acc, curr) => {
        acc[curr.carId] = { rating: curr.rating, count: curr.count };
        return acc;
      }, {});
      setCarRatings(ratingsMap);
    } catch (error) {
      console.error("Error fetching cars:", error);
      setToastMessage("Không thể tải danh sách xe.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (carId) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa xe này không?")) {
      try {
        await deleteCar(carId);
        setToastMessage("Đã xóa xe và chuyển vào thùng rác!");
        fetchCars();
      } catch (error) {
        console.error("Lỗi khi xóa xe:", error);
        setToastMessage("Lỗi khi xóa xe.");
      }
    }
  };

  const filteredCars = cars.filter(car => {
    if (filter === 'all') return car.status !== 'DELETED';
    return car.status === filter.toUpperCase();
  });

  // Pagination
  const indexOfLastCar = currentPage * carsPerPage;
  const indexOfFirstCar = indexOfLastCar - carsPerPage;
  const currentCars = filteredCars.slice(indexOfFirstCar, indexOfLastCar);
  const totalPages = Math.ceil(filteredCars.length / carsPerPage);

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    return (
      <div className="car-pagination">
        <button
          className="car-pagination__btn"
          onClick={() => paginate(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <FaChevronLeft />
        </button>
        {[...Array(totalPages)].map((_, index) => (
          <button
            key={index + 1}
            className={`car-pagination__btn ${currentPage === index + 1 ? 'active' : ''}`}
            onClick={() => paginate(index + 1)}
          >
            {index + 1}
          </button>
        ))}
        <button
          className="car-pagination__btn"
          onClick={() => paginate(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          <FaChevronRight />
        </button>
      </div>
    );
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

  if (loading) {
    return (
      <div id="carManagementPage">
        <div className="car-loading">
          <div className="car-loading__spinner">
            <span className="visually-hidden">Đang tải...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div id="carManagementPage">
      <div className="car-management__container">
        <div className="car-management__wrapper">
          <div className="car-stats">
            <div className="car-stat__card">
              <FaCar className="car-stat__icon" />
              <div className="car-stat__info">
                <h3>{cars.filter(car => car.status !== 'DELETED').length}</h3>
                <p>Tổng số xe</p>
              </div>
            </div>
            <div className="car-stat__card">
              <FaGasPump className="car-stat__icon" />
              <div className="car-stat__info">
                <h3>{cars.filter(car => car.status === 'AVAILABLE').length}</h3>
                <p>Xe sẵn sàng</p>
              </div>
            </div>
            <div className="car-stat__card">
              <FaCog className="car-stat__icon" />
              <div className="car-stat__info">
                <h3>{cars.filter(car => ['DEPOSIT', 'BOOKED', 'DELIVERING', 'RENTED'].includes(car.status)).length}</h3>
                <p>Xe đang cho thuê</p>
              </div>
            </div>
            <div className="car-stat__card">
              <FaMoneyBillWave className="car-stat__icon" />
              <div className="car-stat__info">
                <h3>{cars.filter(car => car.status === 'PENDING').length}</h3>
                <p>Xe chờ duyệt</p>
              </div>
            </div>
          </div>

          <div className="car-management__header">
            <div className="car-filters">
              <button 
                className={`car-filter__btn ${filter === 'all' ? 'active' : ''}`}
                onClick={() => { setFilter('all'); setCurrentPage(1); }}
              >
                Tất cả
              </button>
              <button 
                className={`car-filter__btn ${filter === 'available' ? 'active' : ''}`}
                onClick={() => { setFilter('available'); setCurrentPage(1); }}
              >
                Sẵn sàng cho thuê
              </button>
              <button 
                className={`car-filter__btn ${filter === 'renting' ? 'active' : ''}`}
                onClick={() => { setFilter('renting'); setCurrentPage(1); }}
              >
                Đang cho thuê
              </button>
              <button 
                className={`car-filter__btn ${filter === 'pending' ? 'active' : ''}`}
                onClick={() => { setFilter('pending'); setCurrentPage(1); }}
              >
                Chờ duyệt
              </button>
            </div>
            <div className="car-actions">
              <button onClick={() => navigate('/them-xe')} className="car-add__btn">
                <FaPlus /> Thêm xe mới
              </button>
              <button onClick={() => navigate('/thung-rac')} className="car-trash__btn">
                <FaTrash /> Thùng rác
              </button>
            </div>
          </div>

          <div className="car-grid-container-home-xe">
            <div className="car-grid-home-xe">
              {currentCars.map((car) => (
                <div className="car-item-home-xe" key={car.id}>
                  <div className="car-item__image-home-xe">
                    <img 
                      src={`http://localhost:8080${car.imagePaths}`} 
                      alt={car.carName} 
                      loading="lazy"
                    />
                    <span className={`car-item__status car-item__status--${getStatusColor(car.status)}`}>
                      {getStatusText(car.status)}
                    </span>
                  </div>
                  <div className="car-item__details p-2">
                    <h3 className="car-item__title">{car.carName}</h3>
                    <div className="car-item__rating">
                        <div className="rating-section">
                            {carRatings[car.id] && carRatings[car.id].count > 0 ? (
                                <div className="average-rating">
                                    {renderStars(carRatings[car.id].rating)}
                                    <span className="rating-count">
                                        ({carRatings[car.id].count} đánh giá)
                                    </span>
                                </div>
                            ) : (
                                <div className="average-rating">
                                    <span className="rating-count">Chưa có đánh giá</span>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="car-item__info">
                      <span className="car-item__price">{formatPrice(car.pricePerDay)}</span>
                      <div className="car-item__specs">
                        <span><FaUsers /> {car.seats}</span>
                        <span>{getTransmissionText(car.transmission)}</span>
                      </div>
                    </div>
                    <div className="car-item__location">
                      <FaMapMarkerAlt />
                      <span>{car.address}</span>
                    </div>
                    <div className="car-item__actions">
                      <button 
                        onClick={() => navigate(`/chi-tiet-xe/${car.id}`)}
                        className="car-item__btn car-item__btn--primary"
                      >
                        Chi tiết
                      </button>
                      
                      {car.status === 'DEPOSIT' && (
                        <button
                          onClick={() => navigate(`/giao-xe/${car.id}`)}
                          className="car-item__btn car-item__btn--success"
                        >
                          Giao xe
                        </button>
                      )}

                      {['AVAILABLE', 'INACTIVE'].includes(car.status) && (
                        <>
                          <button
                            onClick={() => navigate(`/cap-nhat-xe/${car.id}`)}
                            className="car-item__btn-edit car-item__btn--outline"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleDelete(car.id)}
                            className="car-item__btn-delete car-item__btn--outline"
                          >
                            <FaTrash />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredCars.length === 0 && (
              <div className="car-empty">
                <FaCar className="car-empty__icon" />
                <h3>Chưa có xe nào</h3>
                <p>Hãy thêm xe đầu tiên của bạn để bắt đầu cho thuê</p>
                <button 
                  onClick={() => navigate('/them-xe')} 
                  className="car-item__btn car-item__btn--primary"
                >
                  Thêm xe ngay
                </button>
              </div>
            )}
          </div>

          {renderPagination()}
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
}

export default HomeXeComp;
