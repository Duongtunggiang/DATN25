import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFavoriteCars } from '../../BackEnd/authen';
import { FaHeart } from 'react-icons/fa';
import FavoriteButton from './FavoriteButton';
import '../../css/AllCars.css';

const Favorites = () => {
    const navigate = useNavigate();
    const [favoriteCars, setFavoriteCars] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchFavoriteCars();
    }, []);

    const fetchFavoriteCars = async () => {
        try {
            const cars = await getFavoriteCars();
            setFavoriteCars(cars);
        } catch (error) {
            console.error("Lỗi khi tải xe yêu thích:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleFavoriteChange = () => {
        // Reload danh sách xe yêu thích khi có thay đổi
        fetchFavoriteCars();
    };

    const formatPrice = (price) => {
        return price ? price.toLocaleString('vi-VN') + '₫/ngày' : 'Đang cập nhật';
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Đang tải danh sách xe yêu thích...</p>
            </div>
        );
    }

    return (
        <div className="all-cars-page">
            <h2 className="page-title">Xe yêu thích của bạn</h2>
            <div className="cars-grid">
                {favoriteCars.length > 0 ? (
                    favoriteCars.map(car => (
                        <div key={car.id} className="car-card">
                            <div className="car-image">
                                <FavoriteButton 
                                    carId={car.id} 
                                    onFavoriteChange={handleFavoriteChange}
                                />
                                <img
                                    src={`http://localhost:8080${car.imagePaths}`}
                                    alt={car.carName}
                                    onError={(e) => {
                                        e.target.src = '/default-car.png';
                                    }}
                                />
                            </div>
                            <div className="car-info">
                                <h3>{car.carName}</h3>
                                <div className="car-details">
                                    <span>{car.transmission}</span>
                                    <span>{car.seats} chỗ</span>
                                    <span>{car.fuel}</span>
                                </div>
                                <div className="car-price">
                                    <strong>{formatPrice(car.pricePerDay)}</strong>
                                </div>
                                <button
                                    className="view-details-btn"
                                    onClick={() => navigate(`/chi-tiet/${car.id}`)}
                                >
                                    Xem chi tiết
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="no-cars-found">
                        <p>Bạn chưa có xe yêu thích nào</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Favorites; 