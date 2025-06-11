import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaChartBar, FaCar, FaUsers, FaWallet, FaClipboardList } from 'react-icons/fa';
import './AdminSidebar.css';

const AdminSidebar = () => {
    const location = useLocation();

    const isActive = (path) => {
        return location.pathname === path;
    };

    const menuItems = [
        { path: '/admin', icon: <FaChartBar />, label: 'Tổng quan' },
        { path: '/admin/users', icon: <FaUsers />, label: 'Quản lý người dùng' },
        { path: '/admin/cars', icon: <FaCar />, label: 'Quản lý xe' },
        { path: '/admin/bookings', icon: <FaClipboardList />, label: 'Quản lý đơn hàng' },
        { path: '/admin/transactions', icon: <FaWallet />, label: 'Quản lý giao dịch' },
    ];

    return (
        <div className="admin-sidebar theme-sidebar">
            <div className="sidebar-content">
                {menuItems.map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={`sidebar-item theme-sidebar-item ${isActive(item.path) ? 'active' : ''}`}
                    >
                        <span className="sidebar-icon">{item.icon}</span>
                        <span className="sidebar-label">{item.label}</span>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default AdminSidebar;