import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    getCars, 
    getCarDetailById, 
    getBrandForCar,
    getAllbrand,
    getAllSegment,
    getAllCategory,
    getUserProvince,
    getAllFeedbacksByCarId
} from '../BackEnd/authen';
import { FaSearch, FaCar, FaFilter, FaChevronDown, FaChevronUp, FaMapMarkerAlt, FaTimes, FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';
import '@fortawesome/fontawesome-free/css/all.min.css';
import '../css/Home.css';
import FavoriteButton from './Customer/FavoriteButton';

const AllCars = () => {
    const navigate = useNavigate();
    const [cars, setCars] = useState([]);
    const [carDetails, setCarDetails] = useState({});
    const [carBrands, setCarBrands] = useState({});
    const [loading, setLoading] = useState(true);
    const [brands, setBrands] = useState([]);
    const [segments, setSegments] = useState([]);
    const [categories, setCategories] = useState([]);
    const [searchSuggestions, setSearchSuggestions] = useState([]);
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        search: '',
        transmission: '',
        seats: '',
        priceRange: '',
        brandId: '',
        segmentId: '',
        categoryId: '',
        fuel: '',
        location: '',
        startDate: '',
        endDate: ''
    });
    const [locationSuggestions, setLocationSuggestions] = useState([]);
    const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
    const [userProvince, setUserProvince] = useState(null);
    const [showProvinceSuggestion, setShowProvinceSuggestion] = useState(true);
    const [carRatings, setCarRatings] = useState({});

    // Enum options
    const transmissionOptions = [
        { value: 'MANUAL', label: 'Số sàn' },
        { value: 'AUTOMATIC', label: 'Số tự động' },
        { value: 'CVT', label: 'Hộp số CVT' },
        { value: 'DCT', label: 'Hộp số ly hợp kép' }
    ];

    const fuelOptions = [
        { value: 'GASOLINE', label: 'Xăng' },
        { value: 'DIESEL', label: 'Dầu diesel' },
        { value: 'ELECTRIC', label: 'Điện' },
        { value: 'HYBRID', label: 'Hybrid' }
    ];

    useEffect(() => {
        fetchInitialData();
        fetchUserProvince();
    }, []);

    const fetchInitialData = async () => {
        try {
            setLoading(true);
            const [allCars, brandsData, segmentsData, categoriesData] = await Promise.all([
                getCars(),
                getAllbrand(),
                getAllSegment(),
                getAllCategory()
            ]);

            const availableCars = allCars.filter(car => car.status === 'AVAILABLE');
            setCars(availableCars);
            setBrands(brandsData);
            setSegments(segmentsData);
            setCategories(categoriesData);

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
            const detailsPromises = availableCars.map(car => getCarDetailById(car.id));
            const brandsPromises = availableCars.map(car => getBrandForCar(car.id));

            const details = await Promise.all(detailsPromises);
            const brandData = await Promise.all(brandsPromises);

            const carDetailsMap = {};
            const carBrandsMap = {};
            availableCars.forEach((car, index) => {
                carDetailsMap[car.id] = details[index];
                carBrandsMap[car.id] = brandData[index];
            });

            setCarDetails(carDetailsMap);
            setCarBrands(carBrandsMap);
        } catch (error) {
            console.error("Lỗi khi tải dữ liệu:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchUserProvince = async () => {
        try {
            const provinceData = await getUserProvince();
            if (provinceData.hasProvince) {
                setUserProvince(provinceData);
            }
        } catch (error) {
            console.error("Error fetching user province:", error);
        }
    };

    const handleCloseProvinceSuggestion = () => {
        setShowProvinceSuggestion(false);
    };

    const formatPrice = (price) => {
        return price ? price.toLocaleString('vi-VN') + '₫/ngày' : 'Đang cập nhật';
    };

    // Hàm chuẩn hóa chuỗi để tìm kiếm
    const normalizeString = (str) => {
        return str.toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '') // Bỏ dấu
            .replace(/[đĐ]/g, 'd'); // Chuyển đ/Đ thành d
    };

    // Hàm tính độ tương đồng giữa hai chuỗi
    const calculateSimilarity = (str1, str2) => {
        const normalized1 = normalizeString(str1);
        const normalized2 = normalizeString(str2);
        
        if (normalized1.includes(normalized2) || normalized2.includes(normalized1)) {
            return true;
        }

        // Tính độ tương đồng theo Levenshtein distance
        const matrix = Array(normalized1.length + 1).fill().map(() => 
            Array(normalized2.length + 1).fill(0)
        );

        for (let i = 0; i <= normalized1.length; i++) {
            matrix[i][0] = i;
        }
        for (let j = 0; j <= normalized2.length; j++) {
            matrix[0][j] = j;
        }

        for (let i = 1; i <= normalized1.length; i++) {
            for (let j = 1; j <= normalized2.length; j++) {
                if (normalized1[i - 1] === normalized2[j - 1]) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1,
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j] + 1
                    );
                }
            }
        }

        const maxLength = Math.max(normalized1.length, normalized2.length);
        const similarity = 1 - matrix[normalized1.length][normalized2.length] / maxLength;
        return similarity > 0.7; // Ngưỡng tương đồng 70%
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));

        // Hide province suggestion when user types in search
        if (name === 'search' && value) {
            setShowProvinceSuggestion(false);
        }

        // Xử lý gợi ý tìm kiếm
        if (name === 'search' && value) {
            const suggestions = cars
                .filter(car => calculateSimilarity(car.carName, value))
                .map(car => car.carName)
                .slice(0, 5); // Giới hạn 5 gợi ý
            setSearchSuggestions(suggestions);
        } else {
            setSearchSuggestions([]);
        }
    };

    const handleSuggestionClick = (suggestion) => {
        setFilters(prev => ({
            ...prev,
            search: suggestion
        }));
        setSearchSuggestions([]);
    };

    const handleLocationChange = (e) => {
        const { value } = e.target;
        setFilters(prev => ({
            ...prev,
            location: value
        }));
        // Hide province suggestion when user types in location
        if (value) {
            setShowProvinceSuggestion(false);
        }

        if (value) {
            const normalizedSearch = normalizeString(value);
            const suggestions = cars
                .map(car => car.address)
                .filter(address => address && normalizeString(address).includes(normalizedSearch))
                .filter((address, index, self) => self.indexOf(address) === index)
                .slice(0, 5);
            setLocationSuggestions(suggestions);
            setShowLocationSuggestions(true);
        } else {
            setLocationSuggestions([]);
            setShowLocationSuggestions(false);
        }
    };

    const handleLocationSuggestionClick = (suggestion) => {
        setFilters(prev => ({
            ...prev,
            location: suggestion
        }));
        setShowLocationSuggestions(false);
    };

    const filteredCars = cars.filter(car => {
        const matchesSearch = !filters.search || calculateSimilarity(car.carName, filters.search);
        const matchesLocation = !filters.location || calculateSimilarity(car.address, filters.location);
        const matchesTransmission = !filters.transmission || car.transmission === filters.transmission;
        const matchesSeats = !filters.seats || car.seats.toString() === filters.seats;
        const matchesBrandId = !filters.brandId || car.brandId.toString() === filters.brandId;
        const matchesSegmentId = !filters.segmentId || car.segmentId.toString() === filters.segmentId;
        const matchesCategoryId = !filters.categoryId || car.categoryId.toString() === filters.categoryId;
        const matchesFuel = !filters.fuel || car.fuel === filters.fuel;
        
        let matchesPrice = true;
        if (filters.priceRange) {
            const [min, max] = filters.priceRange.split('-').map(Number);
            matchesPrice = car.pricePerDay >= min && car.pricePerDay <= max;
        }

        // Thêm điều kiện lọc theo tỉnh khi có gợi ý tỉnh
        const matchesProvince = !showProvinceSuggestion || !userProvince || 
            (car.address && calculateSimilarity(car.address, userProvince.provinceName));

        return matchesSearch && matchesLocation && matchesTransmission && matchesSeats && 
               matchesBrandId && matchesSegmentId && matchesCategoryId && 
               matchesFuel && matchesPrice && matchesProvince;
    });

    const getTransmissionText = (transmission) => {
        return transmissionOptions.find(t => t.value === transmission)?.label || transmission;
    };

    const getFuelText = (fuel) => {
        return fuelOptions.find(f => f.value === fuel)?.label || fuel;
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

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Đang tải danh sách xe...</p>
            </div>
        );
    }

    return (
        <div className="home-page">
            <div className="container">
                <div className="filter-section">
                    <div className="search-bar">
                        <FaSearch className="search-icon" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm xe..."
                            name="search"
                            value={filters.search}
                            onChange={handleFilterChange}
                        />
                        {searchSuggestions.length > 0 && (
                            <div className="search-suggestions">
                                {searchSuggestions.map((suggestion, index) => (
                                    <div
                                        key={index}
                                        className="suggestion-item"
                                        onClick={() => handleSuggestionClick(suggestion)}
                                    >
                                        {suggestion}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="filters">
                        <div className="search-inputs">
                            <div className="input-group">
                                <FaSearch className="input-icon" />
                                <input
                                    type="text"
                                    placeholder="Địa điểm"
                                    name="location"
                                    value={filters.location}
                                    onChange={handleLocationChange}
                                    onFocus={() => filters.location && setShowLocationSuggestions(true)}
                                    onBlur={() => setTimeout(() => setShowLocationSuggestions(false), 200)}
                                />
                                {showLocationSuggestions && locationSuggestions.length > 0 && (
                                    <div className="search-suggestions">
                                        {locationSuggestions.map((suggestion, index) => (
                                            <div
                                                key={index}
                                                className="suggestion-item"
                                                onClick={() => handleLocationSuggestionClick(suggestion)}
                                            >
                                                <FaMapMarkerAlt className="me-2" />
                                                {suggestion}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <button 
                                className="toggle-filters-btn"
                                onClick={() => setShowFilters(!showFilters)}
                            >
                                {showFilters ? (
                                    <>
                                        <span>Ẩn bộ lọc</span>
                                        <FaChevronUp />
                                    </>
                                ) : (
                                    <>
                                        <span>Thêm bộ lọc</span>
                                        <FaChevronDown />
                                    </>
                                )}
                            </button>
                        </div>

                        {showFilters && (
                            <div className="advanced-filters">
                                <div className="filter-row">
                                    <select
                                        name="brandId"
                                        value={filters.brandId}
                                        onChange={handleFilterChange}
                                    >
                                        <option value="">Chọn hãng xe</option>
                                        {brands.map(brand => (
                                            <option key={brand.id} value={brand.id}>
                                                {brand.brandName}
                                            </option>
                                        ))}
                                    </select>

                                    <select
                                        name="segmentId"
                                        value={filters.segmentId}
                                        onChange={handleFilterChange}
                                    >
                                        <option value="">Chọn phân khúc</option>
                                        {segments.map(segment => (
                                            <option key={segment.id} value={segment.id}>
                                                {segment.name}
                                            </option>
                                        ))}
                                    </select>

                                    <select
                                        name="categoryId"
                                        value={filters.categoryId}
                                        onChange={handleFilterChange}
                                    >
                                        <option value="">Chọn loại xe</option>
                                        {categories.map(category => (
                                            <option key={category.id} value={category.id}>
                                                {category.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="filter-row">
                                    <select
                                        name="transmission"
                                        value={filters.transmission}
                                        onChange={handleFilterChange}
                                    >
                                        <option value="">Chọn hộp số</option>
                                        {transmissionOptions.map(option => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>

                                    <select
                                        name="fuel"
                                        value={filters.fuel}
                                        onChange={handleFilterChange}
                                    >
                                        <option value="">Chọn nhiên liệu</option>
                                        {fuelOptions.map(option => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>

                                    <select
                                        name="seats"
                                        value={filters.seats}
                                        onChange={handleFilterChange}
                                    >
                                        <option value="">Số ghế</option>
                                        <option value="4">4 chỗ</option>
                                        <option value="5">5 chỗ</option>
                                        <option value="7">7 chỗ</option>
                                        <option value="16">16 chỗ</option>
                                    </select>
                                </div>

                                <div className="filter-row">
                                    <select
                                        name="priceRange"
                                        value={filters.priceRange}
                                        onChange={handleFilterChange}
                                    >
                                        <option value="">Giá thuê</option>
                                        <option value="0-500000">Dưới 500.000₫</option>
                                        <option value="500000-1000000">500.000₫ - 1.000.000₫</option>
                                        <option value="1000000-2000000">1.000.000₫ - 2.000.000₫</option>
                                        <option value="2000000-999999999">Trên 2.000.000₫</option>
                                    </select>

                                    <div className="date-inputs">
                                        <input
                                            type="date"
                                            name="startDate"
                                            value={filters.startDate}
                                            onChange={handleFilterChange}
                                            placeholder="Ngày bắt đầu"
                                        />
                                        <input
                                            type="date"
                                            name="endDate"
                                            value={filters.endDate}
                                            onChange={handleFilterChange}
                                            placeholder="Ngày kết thúc"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {showProvinceSuggestion && userProvince && (
                    <div className="province-suggestion-container">
                        <div className="province-suggestion">
                            <div className="province-suggestion-content">
                                <FaMapMarkerAlt className="me-2" />
                                <span className='px-2'>Gợi ý xe ở khu vực:</span><b>{userProvince.provinceName}</b>
                            </div>
                            <button 
                                className="province-suggestion-close"
                                onClick={handleCloseProvinceSuggestion}
                            >
                                <FaTimes />
                            </button>
                        </div>
                    </div>
                )}

                <div className="home-cars-grid">
                    {filteredCars.length > 0 ? (
                        filteredCars.map(car => {
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
                        })
                    ) : (
                        <div className="no-cars-found">
                            <p>Không tìm thấy xe phù hợp với điều kiện tìm kiếm</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AllCars; 