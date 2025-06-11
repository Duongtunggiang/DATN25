import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../Authen/axiosInstance';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import '../css/CarSuccess.css';

const CarSuccessComponent = () => {
    const { carId } = useParams();
    const navigate = useNavigate();
    const [car, setCar] = useState(null);
    const [carDetail, setCarDetail] = useState(null);
    const [loading, setLoading] = useState(false);
    const [carImages, setCarImages] = useState([]);
    const [currentImageIndex, setCurrentImageIndex] = useState(-1);

    useEffect(() => {
        fetchCar();
        fetchCarDetail();
        fetchCarImages();
    }, [carId]);

    const fetchCar = async () => {
        const res = await axiosInstance.get(`/api/cars/${carId}`);
        setCar(res.data);
    };

    const fetchCarDetail = async () => {
        const res = await axiosInstance.get(`/api/cars/car-detail/${carId}`);
        setCarDetail(res.data);
    };

    const fetchCarImages = async () => {
        try {
            const res = await axiosInstance.get(`/api/guest/car-images/${carId}`);
            setCarImages(res.data);
        } catch (error) {
            console.error("Không tìm thấy ảnh xe:", error);
        }
    };

    const handleSubmit = async () => {
        try {
            setLoading(true);
            await axiosInstance.post(`/api/cars/success`, {
                id: carId 
            });
            alert("Xe đã gửi yêu cầu đăng ký thành công!");
            navigate("/home-xe");
        } catch (error) {
            alert("Lỗi khi gửi yêu cầu đăng ký");
            console.error(error);
        } finally {
            setLoading(false);
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

    const getCurrentImageSrc = () => {
        if (currentImageIndex === -1) {
            return car.imagePaths ? `http://localhost:8080${car.imagePaths}` : '/default-car.png';
        }
        return `http://localhost:8080${carImages[currentImageIndex]}`;
    };

    if (!car || !carDetail) return (
        <div className="loading-container">
            <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Đang tải...</span>
            </div>
            <p>Đang tải thông tin xe...</p>
        </div>
    );

    const features = [
        { icon: '🚗', label: 'Biển số', value: car.licensePlate },
        { icon: '🎨', label: 'Màu sắc', value: car.color },
        { icon: '💰', label: 'Giá/Ngày', value: `${car.pricePerDay.toLocaleString()} đ` },
        { icon: '⛽', label: 'Nhiên liệu', value: car.fuel },
        { icon: '⚙️', label: 'Truyền động', value: car.transmission },
        { icon: '🛣️', label: 'Quãng đường', value: `${carDetail.mileage} km` }
    ];

    const additionalFeatures = [
        { icon: '📍', label: 'GPS', value: carDetail.gps },
        { icon: '📸', label: 'Camera', value: carDetail.camera },
        { icon: '🎵', label: 'Bluetooth', value: carDetail.bluetooth },
        { icon: '☀️', label: 'Cửa sổ trời', value: carDetail.sunRoof },
        { icon: '🔒', label: 'Khóa trẻ em', value: carDetail.childLock },
        { icon: '👶', label: 'Ghế trẻ em', value: carDetail.childSeat },
        { icon: '📀', label: 'DVD', value: carDetail.dvd },
        { icon: '🔌', label: 'USB', value: carDetail.usb }
    ];

    return (
        <div className="container py-5">
            <div className="card shadow-lg">
                <div className="card-header bg-success text-white">
                    <h2 className="mb-0">Xác nhận đăng ký xe</h2>
                </div>
                <div className="card-body">
                    <div className="row">
                        <div className="col-md-6 mb-4">
                            <div className="car-image-section">
                                <div className="carousel-container">
                                    <img
                                        src={getCurrentImageSrc()}
                                        alt={`${car.carName} - ${currentImageIndex === -1 ? 'Main Image' : `Image ${currentImageIndex + 1}`}`}
                                        className="img-fluid main-image"
                                        onError={(e) => {
                                            e.target.src = '/default-car.png';
                                        }}
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
                        <div className="col-md-6 mb-4">
                            <div className="car-info">
                                <h3 className="car-name">{car.carName}</h3>
                                <div className="features-grid">
                                    {features.map((feature, index) => (
                                        <div key={index} className="feature-item">
                                            <span className="feature-icon">{feature.icon}</span>
                                            <span className="feature-label">{feature.label}</span>
                                            <span className="feature-value">{feature.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="additional-features mt-4">
                        <h4 className="section-title">Tính năng xe</h4>
                        <div className="features-grid-small">
                            {additionalFeatures.map((feature, index) => (
                                <div key={index} className={`feature-chip ${feature.value ? 'active' : 'inactive'}`}>
                                    <span className="feature-icon">{feature.icon}</span>
                                    <span className="feature-label">{feature.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {carDetail.description && (
                        <div className="description-section mt-4">
                            <h4 className="section-title">Mô tả thêm</h4>
                            <p className="description-text">{carDetail.description}</p>
                        </div>
                    )}

                    <div className="action-section mt-4">
                        <button 
                            className={`btn btn-success btn-lg ${loading ? 'loading' : ''}`}
                            onClick={handleSubmit} 
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                    Đang xử lý...
                                </>
                            ) : "Xác nhận đăng ký"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CarSuccessComponent;
