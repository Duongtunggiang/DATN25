import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaHeart } from 'react-icons/fa';
import { addFavoriteCar, removeFavoriteCar, checkFavoriteCar, isAuthenticated } from '../../BackEnd/authen';
import '../../css/AllCars.css';

const FavoriteButton = ({ carId, onFavoriteChange }) => {
    const [isFavorite, setIsFavorite] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        checkFavoriteStatus();
    }, [carId]);

    const checkFavoriteStatus = async () => {
        try {
            if (isAuthenticated()) {
                const isFav = await checkFavoriteCar(carId);
                setIsFavorite(isFav);
            }
        } catch (error) {
            console.error('Error checking favorite status:', error);
        }
    };

    const handleFavoriteClick = async (e) => {
        e.stopPropagation(); // Ngăn chặn sự kiện click lan ra ngoài

        if (!isAuthenticated()) {
            localStorage.setItem('redirectAfterLogin', window.location.pathname);
            navigate('/dang-nhap', {
                state: {
                    message: 'Vui lòng đăng nhập để thêm xe vào danh sách yêu thích',
                    redirectTo: window.location.pathname
                }
            });
            return;
        }

        try {
            if (isFavorite) {
                await removeFavoriteCar(carId);
                setIsFavorite(false);
            } else {
                await addFavoriteCar(carId);
                setIsFavorite(true);
            }
            // Gọi callback khi có thay đổi trạng thái yêu thích
            if (onFavoriteChange) {
                onFavoriteChange();
            }
        } catch (error) {
            console.error('Error toggling favorite:', error);
        }
    };

    return (
        <button
            className={`favorite-button ${isFavorite ? 'active' : ''}`}
            onClick={handleFavoriteClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <FaHeart />
        </button>
    );
};

export default FavoriteButton; 