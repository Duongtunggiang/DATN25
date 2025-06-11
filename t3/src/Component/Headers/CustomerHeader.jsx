import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUser, FaSignOutAlt, FaHeart, FaCalendarAlt, FaWallet, FaComments } from 'react-icons/fa';
import '../../css/Headers.css';
import logo from '../../Logo/Logo-removebackgroung.png';
import defaultAvatar from '../../Images/avatars/default-avatar.png';
import { GetProfile } from '../../BackEnd/authen';

const CustomerHeader = () => {
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        setIsAuthenticated(!!token);
        
        if (token) {
            fetchProfile();
        }
    }, []);

    const fetchProfile = async () => {
        try {
            const data = await GetProfile();
            setProfile(data);
        } catch (error) {
            console.error("Lỗi khi lấy thông tin người dùng:", error);
            // Nếu có lỗi khi lấy profile, có thể token đã hết hạn
            handleLogout();
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        setProfile(null);
        setIsAuthenticated(false);
        navigate('/dang-nhap');
    };

    const getAvatarUrl = () => {
        if (!profile?.avatarPath) return defaultAvatar;
        return `http://localhost:8080${profile.avatarPath}`;
    };

    return (
        <header className="customer-header">
            <div className="header-container">
                <div className="logo-section">
                    <Link to="/" className="logo">
                        <img src={logo} alt="Logo" className="header-logo" />
                        <span>THUÊ XE NHANH</span>
                    </Link>
                </div>

                <nav className="nav-section">
                    <Link to="/tat-ca-xe" className="nav-item">
                        Thuê xe
                    </Link>
                    <Link to="/about" className="nav-item">
                        Giới thiệu
                    </Link>
                    <Link to="/how-it-works" className="nav-item">
                        Hướng dẫn
                    </Link>
                    {!isAuthenticated && (
                        <Link to="/dang-ky-chu-xe" className="nav-item special">
                            Cho thuê xe
                        </Link>
                    )}
                </nav>

                {isAuthenticated && profile ? (
                    <div className="user-section">
                        <div className="user-info">
                            <span className="user-name">{profile.username}</span>
                            <img
                                src={getAvatarUrl()}
                                alt="Avatar"
                                className="user-avatar"
                                onError={(e) => e.target.src = defaultAvatar}
                            />
                        </div>
                        <div className="dropdown-menu">
                            <Link to="/profile" className="dropdown-item">
                                <FaUser /> Tài khoản
                            </Link>
                            <Link to="/xe-yeu-thich" className="dropdown-item">
                                <FaHeart /> Xe yêu thích
                            </Link>
                            <Link to="/don-hang" className="dropdown-item">
                                <FaCalendarAlt /> Đơn thuê xe
                            </Link>
                            <Link to="/vi-tien" className="dropdown-item">
                                <FaWallet /> Ví tiền
                            </Link>
                            <Link to="/chat" className="dropdown-item">
                                <FaComments /> Tin nhắn
                            </Link>
                            <button onClick={handleLogout} className="dropdown-item">
                                <FaSignOutAlt /> Đăng xuất
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="auth-buttons">
                        <Link to="/dang-nhap" className="btn btn-outline-primary">
                            Đăng nhập
                        </Link>
                        <Link to="/dang-ky" className="btn btn-primary">
                            Đăng ký
                        </Link>
                    </div>
                )}
            </div>
        </header>
    );
};

export default CustomerHeader; 