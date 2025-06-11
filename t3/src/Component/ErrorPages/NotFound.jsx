import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaHome } from 'react-icons/fa';
import '../../css/ErrorPages.css';
import error404 from '../../Images/error-404.png';

const NotFound = () => {
    const navigate = useNavigate();

    const goBack = () => {
        navigate(-1);
    };

    const goHome = () => {
        navigate('/');
    };

    return (
        <div className="error-container">
            <div className="error-content">
                <img src={error404} alt="404 Error" className="error-image" />
                <h1>Không tìm thấy trang</h1>
                <p>Xin lỗi, trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.</p>
                <div className="error-actions">
                    <button onClick={goBack} className="error-button back-button">
                        <FaArrowLeft /> Quay lại
                    </button>
                    <button onClick={goHome} className="error-button home-button">
                        <FaHome /> Trang chủ
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NotFound; 