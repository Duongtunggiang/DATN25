import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUserCog, FaSignOutAlt, FaSun, FaMoon } from 'react-icons/fa';
import '../../css/Headers.css';
import logo from '../../Logo/Logo-removebackgroung.png';
import defaultAvatar from '../../Images/avatars/default-avatar.png';
import { getAdminProfile } from '../../BackEnd/authen';

const AdminHeader = () => {
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [showDropdown, setShowDropdown] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await getAdminProfile();
                setProfile(data);
            } catch (error) {
                console.error("Lỗi khi lấy thông tin người dùng:", error);
            }
        };
        fetchData();

        // Check saved theme
        const savedTheme = localStorage.getItem('admin-theme');
        if (savedTheme === 'dark') {
            setIsDarkMode(true);
            document.body.classList.add('theme-dark');
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('auth_token');
        navigate('/dang-nhap');
    };

    const getAvatarUrl = () => {
        if (!profile?.avatarPath) return defaultAvatar;
        return `http://localhost:8080${profile.avatarPath}`;
    };

    const toggleTheme = () => {
        setIsDarkMode(!isDarkMode);
        if (!isDarkMode) {
            document.body.classList.add('theme-dark');
            localStorage.setItem('admin-theme', 'dark');
        } else {
            document.body.classList.remove('theme-dark');
            localStorage.setItem('admin-theme', 'light');
        }
    };

    return (
        <header className="admin-header theme-nav">
            <div className="admin-header-container">
                <div className="admin-logo-section">
                    <Link to="/admin" className="admin-logo">
                        <img src={logo} alt="Logo" className="admin-header-logo" />
                    </Link>
                </div>

                <div className="admin-header-actions">
                    <button 
                        className="theme-toggle-btn"
                        onClick={toggleTheme}
                        title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                    >
                        {isDarkMode ? <FaSun /> : <FaMoon />}
                    </button>

                    <div className="admin-user-section">
                        <div 
                            className="admin-user-info" 
                            onClick={() => setShowDropdown(!showDropdown)}
                            onMouseEnter={() => setShowDropdown(true)}
                            onMouseLeave={() => setShowDropdown(false)}
                        >
                            <img
                                src={getAvatarUrl()}
                                alt="Avatar"
                                className="admin-user-avatar"
                                onError={(e) => e.target.src = defaultAvatar}
                            />
                            {showDropdown && (
                                <div className="admin-dropdown-menu theme-dropdown">
                                    <Link to="/admin/profile" className="admin-dropdown-item">
                                        <FaUserCog /> Profile
                                    </Link>
                                    <button onClick={handleLogout} className="admin-dropdown-item">
                                        <FaSignOutAlt /> Đăng xuất
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default AdminHeader; 