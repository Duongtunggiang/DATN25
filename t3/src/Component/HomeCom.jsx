import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCars, getCarDetailById, getBrandForCar, getAllbrand, getAllSegment, getAllCategory, getAllFeedbacksByCarId } from '../BackEnd/authen';
import ToastNotification from '../Alert/ToastNotification';
import { FaSearch, FaCar, FaUserFriends, FaShieldAlt, FaMapMarkerAlt, FaStar, FaRegStar, FaStarHalfAlt } from 'react-icons/fa';
import '@fortawesome/fontawesome-free/css/all.min.css';
import '../css/Home.css';
import banner1 from '../Images/banner/banner1.jpg';
import banner2 from '../Images/banner/banner2.jpg';
import banner3 from '../Images/banner/banner3.jpg';
import FavoriteButton from './Customer/FavoriteButton';

const HomeCom = () => {
    const navigate = useNavigate();
    const [toastMessage, setToastMessage] = useState('');
    const [cars, setCars] = useState([]);
    const [carDetails, setCarDetails] = useState({});
    const [carBrands, setCarBrands] = useState({});
    const [brands, setBrands] = useState([]);
    const [segments, setSegments] = useState([]);
    const [categories, setCategories] = useState([]);
    const [currentBanner, setCurrentBanner] = useState(0);
    const banners = [banner1, banner2, banner3];
    const [searchParams, setSearchParams] = useState({
        search: '',
        location: '',
        startDate: '',
        endDate: ''
    });
    const [carRatings, setCarRatings] = useState({});

    useEffect(() => {
        try {
            const loginMessage = localStorage.getItem('loginMessage');
            if (loginMessage) {
                setToastMessage(loginMessage);
                localStorage.removeItem('loginMessage'); 
            }
        
            const logoutMessage = localStorage.getItem('logoutMessage');
            if (logoutMessage) {
                setToastMessage(logoutMessage);
                localStorage.removeItem('logoutMessage'); 
            }
        } catch (error) {
            console.error("Error handling localStorage:", error);
        }

        fetchInitialData();

        // Banner auto-slide
        const interval = setInterval(() => {
            setCurrentBanner((prev) => (prev + 1) % banners.length);
        }, 5000); // Change banner every 5 seconds

        return () => clearInterval(interval);
    }, []);

    const fetchInitialData = async () => {
        try {
            console.log('Starting to fetch data...');
            
            // Fetch segments and categories first
            const segmentsData = await getAllSegment();
            const categoriesData = await getAllCategory();
            
            console.log('Segments data:', segmentsData);
            console.log('Categories data:', categoriesData);
            
            // Set segments and categories immediately
            setSegments(Array.isArray(segmentsData) ? segmentsData : []);
            setCategories(Array.isArray(categoriesData) ? categoriesData : []);
            
            // Then fetch cars and brands
            const [allCars, brandsData] = await Promise.all([
                getCars().catch(error => {
                    console.error('Error fetching cars:', error);
                    return [];
                }),
                getAllbrand().catch(error => {
                    console.error('Error fetching brands:', error);
                    return [];
                })
            ]);

            console.log('Cars data:', allCars);

            const availableCars = Array.isArray(allCars) ? allCars.filter(car => car.status === 'AVAILABLE') : [];
            setCars(availableCars);
            setBrands(Array.isArray(brandsData) ? brandsData : []);

            // Fetch ratings for all cars
            const ratingsPromises = availableCars.map(async (car) => {
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

            // Fetch car details and brands for each car
            const detailsPromises = availableCars.map(car => 
                getCarDetailById(car.id).catch(error => {
                    console.error(`Error fetching details for car ${car.id}:`, error);
                    return null;
                })
            );
            const brandsPromises = availableCars.map(car => 
                getBrandForCar(car.id).catch(error => {
                    console.error(`Error fetching brand for car ${car.id}:`, error);
                    return null;
                })
            );

            const details = await Promise.all(detailsPromises);
            const brandData = await Promise.all(brandsPromises);

            console.log('Car Details:', details);
            console.log('Brand Data:', brandData);

            const carDetailsMap = {};
            const carBrandsMap = {};
            availableCars.forEach((car, index) => {
                if (details[index]) {
                    carDetailsMap[car.id] = details[index];
                }
                if (brandData[index]) {
                    carBrandsMap[car.id] = brandData[index];
                }
            });

            setCarDetails(carDetailsMap);
            setCarBrands(carBrandsMap);
        } catch (error) {
            console.error("Lỗi khi tải dữ liệu:", error);
            setToastMessage("Có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại sau.");
        }
    };
    
    const handleSearch = (e) => {
        e.preventDefault();
        try {
            localStorage.setItem('searchParams', JSON.stringify(searchParams));
            const queryParams = new URLSearchParams(searchParams);
            navigate(`/search?${queryParams.toString()}`);
        } catch (error) {
            console.error("Error handling search:", error);
            setToastMessage("Có lỗi xảy ra khi tìm kiếm. Vui lòng thử lại.");
        }
    };

    const formatPrice = (price) => {
        return price ? price.toLocaleString('vi-VN') + '₫/ngày' : 'Đang cập nhật';
    };

    const getTransmissionText = (transmission) => {
        const transmissionOptions = {
            'MANUAL': 'Số sàn',
            'AUTOMATIC': 'Số tự động',
            'CVT': 'Hộp số CVT',
            'DCT': 'Hộp số ly hợp kép'
        };
        return transmissionOptions[transmission] || transmission;
    };

    const getFuelText = (fuel) => {
        const fuelOptions = {
            'GASOLINE': 'Xăng',
            'DIESEL': 'Dầu diesel',
            'ELECTRIC': 'Điện',
            'HYBRID': 'Hybrid'
        };
        return fuelOptions[fuel] || fuel;
    };

    const getSegmentName = (segmentId) => {
        console.log('Segment ID:', segmentId);
        console.log('Available Segments:', segments);
        if (!segments || !Array.isArray(segments)) return 'Chưa có thông tin';
        const segment = segments.find(s => s.id === segmentId);
        console.log('Found Segment:', segment);
        return segment?.name || 'Chưa có thông tin';
    };

    const getCategoryName = (categoryId) => {
        console.log('Category ID:', categoryId);
        console.log('Available Categories:', categories);
        if (!categories || !Array.isArray(categories)) return 'Chưa có thông tin';
        const category = categories.find(c => c.id === categoryId);
        console.log('Found Category:', category);
        return category?.name || 'Chưa có thông tin';
    };

    const getBrandName = (brandId) => {
        if (!brands || !Array.isArray(brands)) return 'Chưa có thông tin';
        const brand = brands.find(b => b.id === brandId);
        return brand?.brandName || 'Chưa có thông tin';
    };

    const renderStars = (rating) => {
        // Ensure rating is a valid number between 0 and 5
        const validRating = Math.min(Math.max(Number(rating) || 0, 0), 5);
        
        const fullStars = Math.floor(validRating);
        const hasHalfStar = validRating % 1 >= 0.5;
        const emptyStars = Math.max(5 - fullStars - (hasHalfStar ? 1 : 0), 0);

        return (
            <div className="star-rating">
                {[...Array(Math.max(0, fullStars))].map((_, index) => (
                    <FaStar key={`full-${index}`} className="text-warning star-icon" />
                ))}
                {hasHalfStar && <FaStarHalfAlt key="half" className="text-warning star-icon" />}
                {[...Array(Math.max(0, emptyStars))].map((_, index) => (
                    <FaRegStar key={`empty-${index}`} className="star-icon" />
                ))}
            </div>
        );
    };

    return (
        <div className="home-page">
            {/* Hero Section */}
            <section className="hero-section">
                <div className="banner-container">
                    {banners.map((banner, index) => (
                        <div
                            key={index}
                            className={`banner ${index === currentBanner ? 'active' : ''}`}
                            style={{ backgroundImage: `url(${banner})` }}
                        />
                    ))}
                    <div className="banner-indicators">
                        {banners.map((_, index) => (
                            <button
                                key={index}
                                className={`indicator ${index === currentBanner ? 'active' : ''}`}
                                onClick={() => setCurrentBanner(index)}
                            />
                        ))}
                    </div>
                </div>
                <div className="hero-content">
                    <h1>Thuê xe dễ dàng, giá tốt nhất</h1>
                    <p>Khám phá hàng nghìn xe chất lượng cao từ các chủ xe uy tín</p>
                    
                    <form onSubmit={handleSearch} className="search-form">
                        <div className="search-inputs">
                            <div className="input-group">
                                <FaSearch className="input-icon" />
                                <input
                                    type="text"
                                    placeholder="Địa điểm"
                                    value={searchParams.location}
                                    onChange={(e) => setSearchParams({...searchParams, location: e.target.value})}
                                />
                            </div>
                            <div className="input-group">
                                <input
                                    type="date"
                                    value={searchParams.startDate}
                                    onChange={(e) => setSearchParams({...searchParams, startDate: e.target.value})}
                                />
                            </div>
                            <div className="input-group">
                                <input
                                    type="date"
                                    value={searchParams.endDate}
                                    onChange={(e) => setSearchParams({...searchParams, endDate: e.target.value})}
                                />
                            </div>
                            <div className="input-group">
                                <FaSearch className="input-icon" />
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm xe..."
                                    value={searchParams.search}
                                    onChange={(e) => setSearchParams({...searchParams, search: e.target.value})}
                                />
                            </div>
                            <button type="submit" className="search-btn">Tìm xe</button>
                        </div>
                    </form>
                </div>
            </section>

            {/* Features Section */}
            <section className="features-section">
                <div className="container">
                    <div className="features-grid">
                        <div className="feature-card">
                            <FaCar className="feature-icon" />
                            <h3>Đa dạng xe</h3>
                            <p>Nhiều loại xe đa dạng phù hợp mọi nhu cầu</p>
                        </div>
                        <div className="feature-card">
                            <FaUserFriends className="feature-icon" />
                            <h3>Chủ xe uy tín</h3>
                            <p>Các chủ xe được xác thực và đánh giá cao</p>
                        </div>
                        <div className="feature-card">
                            <FaShieldAlt className="feature-icon" />
                            <h3>An toàn & Bảo mật</h3>
                            <p>Bảo hiểm đầy đủ và hỗ trợ 24/7</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Featured Cars Section */}
            <section className="featured-cars-section">
                <div className="container">
                    <h2>Xe nổi bật</h2>
                    <div className="home-cars-grid">
                        {cars.slice(0, 6).map(car => {
                            const brandInfo = carBrands[car.id];
                            const carDetail = carDetails[car.id];
                            
                            return (
                                <div key={car.id} className="home-car-card">
                                    <div className="home-car-image">
                                        <FavoriteButton carId={car.id} />
                                        <img 
                                            src={`http://localhost:8080${car.imagePaths}`} 
                                            alt={car.carName}
                                            onError={(e) => {
                                                e.target.src = '/default-car.png';
                                            }}
                                        />
                                    </div>
                                    <div className="home-car-info">
                                        <div className="home-car-info-top">
                                            <h3>{car.carName}</h3>
                                            <div className="home-car-details">
                                                <span>{getTransmissionText(car.transmission)}</span>
                                                <span>{car.seats} chỗ</span>
                                                <span>{getFuelText(car.fuel)}</span>
                                            </div>
                                            <div className="home-car-rating">
                                                {carRatings[car.id] && carRatings[car.id].count > 0 ? (
                                                    <>
                                                        {renderStars(carRatings[car.id].rating)}
                                                        <span className="rating-count">
                                                            ({carRatings[car.id].count} đánh giá)
                                                        </span>
                                                    </>
                                                ) : (
                                                    <span className="rating-count">Chưa có đánh giá</span>
                                                )}
                                            </div>
                                            <div className='d-flex'>
                                                <div className="home-brand-info">
                                                    <b>{brandInfo?.brandName || 'Chưa có thông tin'}</b>
                                                </div>
                                                <div className="home-segment-category-info px-2">
                                                    <span><b>Phân khúc: </b>{getSegmentName(brandInfo?.segmentId)}</span>
                                                    {" - "}
                                                    <span>{getCategoryName(brandInfo?.categoryId)}</span>
                                                </div>
                                                
                                            </div>
                                            
                                            <div className="home-car-price text-danger d-flex">
                                                <strong>{formatPrice(car.pricePerDay)}</strong>
                                                <div className="home-car-address">
                                                    <FaMapMarkerAlt className="me-2" />
                                                    <span>{car.address || 'Chưa có địa chỉ'}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <button 
                                            className="home-view-details-btn"
                                            onClick={() => navigate(`/chi-tiet/${car.id}`)}
                                        >
                                            Xem chi tiết
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <div className="home-view-all-container">
                        <button 
                            className="home-view-all-btn"
                            onClick={() => navigate('/tat-ca-xe')}
                        >
                            Xem tất cả xe
                        </button>
                    </div>
                </div>
            </section>

            {toastMessage && <ToastNotification message={toastMessage} onClose={() => setToastMessage('')} />}
        </div>
    );
}

export default HomeCom;
