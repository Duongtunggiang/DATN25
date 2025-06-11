import React, { useState, useEffect } from 'react';
import { FaEye, FaCheck, FaBan } from 'react-icons/fa';
import '../../css/Admin.css';
import axiosInstance from '../../Authen/axiosInstance';

const AdminBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    const fetchBookings = async () => {
        try {
            const res = await axiosInstance.get('/api/admin/bookings');
            console.log("Dữ liệu đơn hàng:", res.data);
            setBookings(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error("Lỗi khi fetch:", err);
            setBookings([]);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (bookingId, newStatus) => {
        if (window.confirm(`Bạn có chắc muốn ${newStatus === 'COMPLETED' ? 'xác nhận hoàn thành' : 'hủy'} đơn hàng này không?`)) {
            try {
                await axiosInstance.put(`/api/admin/bookings/${bookingId}/status/${newStatus}`);
                alert("Cập nhật trạng thái thành công!");
                fetchBookings();
            } catch (err) {
                console.error("Lỗi khi cập nhật:", err);
                alert("Có lỗi xảy ra khi cập nhật trạng thái!");
            }
        }
    };

    useEffect(() => {
        fetchBookings();
    }, []);

    const filteredBookings = bookings.filter(booking => {
        if (filter === 'all') return true;
        return booking.status === filter;
    });

    const getStatusText = (status) => {
        switch (status) {
            case 'PENDING': return 'Chờ xác nhận';
            case 'CONFIRMED': return 'Đã xác nhận';
            case 'COMPLETED': return 'Hoàn thành';
            case 'CANCELLED': return 'Đã hủy';
            default: return status;
        }
    };

    if (loading) {
        return (
            <div className="admin-page">
                <section className="admin-section">
                    <div className="admin-container">
                        <div className="admin-wrapper">
                            <div className="admin-content">
                                <div className="admin-loading">
                                    <div className="spinner-border text-primary" role="status">
                                        <span className="visually-hidden">Đang tải...</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        );
    }

    return (
        <div className="admin-page">
            <section className="admin-section">
                <div className="admin-container">
                    <div className="admin-wrapper">
                        <div className="admin-content">
                            <div className="header-top">
                                <h2>Quản lý đơn hàng ({bookings.length})</h2>
                                <div className="admin-filters">
                                    <button 
                                        className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                                        onClick={() => setFilter('all')}
                                    >
                                        Tất cả đơn
                                    </button>
                                    <button 
                                        className={`filter-btn ${filter === 'PENDING' ? 'active' : ''}`}
                                        onClick={() => setFilter('PENDING')}
                                    >
                                        Chờ xác nhận
                                    </button>
                                    <button 
                                        className={`filter-btn ${filter === 'CONFIRMED' ? 'active' : ''}`}
                                        onClick={() => setFilter('CONFIRMED')}
                                    >
                                        Đã xác nhận
                                    </button>
                                    <button 
                                        className={`filter-btn ${filter === 'COMPLETED' ? 'active' : ''}`}
                                        onClick={() => setFilter('COMPLETED')}
                                    >
                                        Hoàn thành
                                    </button>
                                    <button 
                                        className={`filter-btn ${filter === 'CANCELLED' ? 'active' : ''}`}
                                        onClick={() => setFilter('CANCELLED')}
                                    >
                                        Đã hủy
                                    </button>
                                </div>
                            </div>

                            <div className="admin-table-container">
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th>Mã đơn</th>
                                            <th>Thông tin xe</th>
                                            <th>Khách hàng</th>
                                            <th>Thời gian thuê</th>
                                            <th>Tổng tiền</th>
                                            <th>Trạng thái</th>
                                            <th>Hành động</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredBookings.map(booking => (
                                            <tr key={booking.id}>
                                                <td>#{booking.id}</td>
                                                <td>
                                                    <div className="car-info">
                                                        <img 
                                                            src={`http://localhost:8080${booking.car?.imagePaths}`}
                                                            alt={booking.car?.carName}
                                                            className="car-thumbnail"
                                                        />
                                                        <div>
                                                            <strong>{booking.car?.carName}</strong>
                                                            <div className="car-details">
                                                                <span>{booking.car?.licensePlate}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>{booking.user?.username}</td>
                                                <td>
                                                    <div className="booking-dates">
                                                        <div>Từ: {new Date(booking.startDate).toLocaleDateString()}</div>
                                                        <div>Đến: {new Date(booking.endDate).toLocaleDateString()}</div>
                                                    </div>
                                                </td>
                                                <td className="amount">{booking.totalAmount?.toLocaleString()}đ</td>
                                                <td>
                                                    <span className={`status-badge status-${booking.status.toLowerCase()}`}>
                                                        {getStatusText(booking.status)}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="action-buttons">
                                                        <button 
                                                            className="btn btn-outline-primary btn-sm"
                                                            title="Xem chi tiết"
                                                        >
                                                            <FaEye />
                                                        </button>
                                                        {booking.status === 'CONFIRMED' && (
                                                            <button 
                                                                className="btn btn-outline-success btn-sm"
                                                                onClick={() => handleStatusChange(booking.id, 'COMPLETED')}
                                                                title="Xác nhận hoàn thành"
                                                            >
                                                                <FaCheck />
                                                            </button>
                                                        )}
                                                        {booking.status === 'PENDING' && (
                                                            <button 
                                                                className="btn btn-outline-danger btn-sm"
                                                                onClick={() => handleStatusChange(booking.id, 'CANCELLED')}
                                                                title="Hủy đơn"
                                                            >
                                                                <FaBan />
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default AdminBookings; 