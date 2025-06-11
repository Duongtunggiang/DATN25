import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaHome, FaLock } from 'react-icons/fa';
import '../../css/ErrorPages.css';
import error403 from '../../Images/error-403.png';

const Forbidden = () => {
    const navigate = useNavigate();

    const goBack = () => {
        navigate(-1);
    };

    const goHome = () => {
        navigate('/');
    };

    const goLogin = () => {
        navigate('/dang-nhap');
    };

    return (
        <div className="error-container">
            <div className="error-content">
                <img src={error403} alt="403 Error" className="error-image" />
                <h1>Truy cập bị từ chối</h1>
                <p>Xin lỗi, bạn không có quyền truy cập vào trang này.</p>
                <div className="error-actions">
                    <button onClick={goBack} className="error-button back-button">
                        <FaArrowLeft /> Quay lại
                    </button>
                    <button onClick={goLogin} className="error-button login-button">
                        <FaLock /> Đăng nhập
                    </button>
                    <button onClick={goHome} className="error-button home-button">
                        <FaHome /> Trang chủ
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Forbidden; 