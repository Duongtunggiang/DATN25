import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaCar, FaUser, FaWallet, FaSignOutAlt, FaBell, FaClipboardList, FaPlus, FaComments } from 'react-icons/fa';
import '../../css/Headers.css';
import logo from '../../Logo/Logo-removebackgroung.png';
import defaultAvatar from '../../Images/avatars/default-avatar.png';
import { GetProfile, getCarOwnerChats } from '../../BackEnd/authen';
import { Nav } from 'react-bootstrap';
import { toast } from 'react-toastify';

const CarOwnerHeader = () => {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState(0);
    const [profile, setProfile] = useState(null);
    const [unreadMessages, setUnreadMessages] = useState(0);
    const [showMessageDropdown, setShowMessageDropdown] = useState(false);
    const [recentChats, setRecentChats] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await GetProfile();
                setProfile(data);
                localStorage.setItem('userRole', 'CAR_OWNER');
            } catch (error) {
                console.error("Lỗi khi lấy thông tin người dùng:", error);
            }
        };
        fetchData();
    }, []);

    // Fetch unread messages count
    useEffect(() => {
        const fetchUnreadMessages = async () => {
            try {
                const chats = await getCarOwnerChats();
                let unreadCount = 0;
                const recentChatsWithUnread = chats.map(chat => {
                    const unread = chat.unreadCount || 0;
                    unreadCount += unread;
                    return {
                        ...chat,
                        unreadCount: unread
                    };
                });
                setUnreadMessages(unreadCount);
                setRecentChats(recentChatsWithUnread);
            } catch (error) {
                console.error("Lỗi khi lấy tin nhắn chưa đọc:", error);
            }
        };

        fetchUnreadMessages();
        // Poll for new messages every 30 seconds
        const interval = setInterval(fetchUnreadMessages, 30000);
        return () => clearInterval(interval);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('auth_token');
        localStorage.removeItem('userRole');
        navigate('/dang-nhap');
    };

    const getAvatarUrl = () => {
        if (!profile?.avatarPath) return defaultAvatar;
        return `http://localhost:8080${profile.avatarPath}`;
    };

    const handleChatClick = (chatId) => {
        navigate(`/chat/${chatId}`);
        setShowMessageDropdown(false);
    };

    return (
        <header className="carowner-header">
            <div className="header-container">
                <div className="logo-section">
                    <Link to="/home-xe" className="logo">
                        <img src={logo} alt="Logo" className="header-logo" />
                        <span>THUÊ XE NHANH</span>
                    </Link>
                </div>

                <nav className="nav-section">
                    <Link to="/home-xe" className="nav-item">
                        <FaCar /> Xe của tôi
                    </Link>
                    <Link to="/them-xe" className="nav-item">
                        <FaPlus /> Thêm xe
                    </Link>
                    <Link to="/vi-tien" className="nav-item">
                        <FaWallet /> Ví tiền
                    </Link>
                    <Link to="/car-owner-bookings" className="nav-item">
                        <FaClipboardList /> Quản lý đơn hàng
                    </Link>
                    <div className="notification-badge message-notification" onClick={() => setShowMessageDropdown(!showMessageDropdown)}>
                        <FaComments />
                        {unreadMessages > 0 && <span className="badge">{unreadMessages}</span>}
                        {showMessageDropdown && (
                            <div className="message-dropdown">
                                {recentChats.length > 0 ? (
                                    recentChats.map(chat => (
                                        <div 
                                            key={chat.id} 
                                            className="message-item"
                                            onClick={() => handleChatClick(chat.id)}
                                        >
                                            <div className="message-sender">{chat.customerName}</div>
                                            {chat.unreadCount > 0 && (
                                                <span className="unread-badge">{chat.unreadCount}</span>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <div className="no-messages">Không có tin nhắn mới</div>
                                )}
                            </div>
                        )}
                    </div>
                </nav>

                <div className="user-section">
                    <div className="user-info">
                        <span className="user-name">{profile?.username}</span>
                        <img
                            src={getAvatarUrl()}
                            alt="Avatar"
                            className="user-avatar"
                            onError={(e) => e.target.src = defaultAvatar}
                        />
                    </div>
                    <div className="dropdown-menu">
                        <Link to="/profile" className="dropdown-item">
                            <FaUser /> Profile
                        </Link>
                        <button onClick={handleLogout} className="dropdown-item">
                            <FaSignOutAlt /> Logout
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default CarOwnerHeader; 