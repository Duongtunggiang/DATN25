import React, { useState, useEffect } from 'react';
import { FaEdit, FaTrash, FaCheck, FaBan, FaCar, FaCheckCircle, FaTools, FaClock } from 'react-icons/fa';
import '../../css/Admin.css';
import axiosInstance from '../../Authen/axiosInstance';

const AdminCars = () => {
    const [cars, setCars] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    const fetchCars = async () => {
        try {
            setLoading(true);
            // Fetch pending cars since that's what the backend provides
            const res = await axiosInstance.get('/api/admin/cars/pending');
            if (!res.data || !Array.isArray(res.data)) {
                console.error("Invalid data received from API");
                setCars([]);
                return;
            }
            setCars(res.data);
        } catch (err) {
            console.error("Error fetching cars:", err);
            alert("Không thể tải danh sách xe. Vui lòng thử lại sau!");
            setCars([]);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (carId, newStatus) => {
        if (window.confirm(`Bạn có chắc muốn phê duyệt xe này không?`)) {
            try {
                await axiosInstance.put(`/api/admin/cars/approve/${carId}`);
                alert("Phê duyệt xe thành công!");
                fetchCars(); // Refresh the list
            } catch (err) {
                console.error("Lỗi khi phê duyệt:", err);
                alert("Có lỗi xảy ra khi phê duyệt xe!");
            }
        }
    };

    useEffect(() => {
        fetchCars();
    }, []);

    const filteredCars = cars.filter(car => {
        if (filter === 'all') return true;
        return car.status === filter;
    });

    const totalCars = cars.length;
    const pendingCars = cars.length; // Since we only have pending cars from the API
    const activeCars = 0; // We don't have this information from the API
    const maintenanceCars = 0; // We don't have this information from the API

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
                                <h2>Quản lý xe</h2>
                            </div>

                            {/* Stats Cards */}
                            <div className="stats-grid">
                                <div className="stats-card">
                                    <div className="stats-icon cars">
                                        <FaCar />
                                    </div>
                                    <div className="stats-info">
                                        <h3>{totalCars}</h3>
                                        <p>Tổng số xe chờ duyệt</p>
                                    </div>
                                </div>
                                <div className="stats-card">
                                    <div className="stats-icon users">
                                        <FaCheckCircle />
                                    </div>
                                    <div className="stats-info">
                                        <h3>{activeCars}</h3>
                                        <p>Đang hoạt động</p>
                                    </div>
                                </div>
                                <div className="stats-card">
                                    <div className="stats-icon pending">
                                        <FaClock />
                                    </div>
                                    <div className="stats-info">
                                        <h3>{pendingCars}</h3>
                                        <p>Chờ duyệt</p>
                                    </div>
                                </div>
                                <div className="stats-card">
                                    <div className="stats-icon revenue">
                                        <FaTools />
                                    </div>
                                    <div className="stats-info">
                                        <h3>{maintenanceCars}</h3>
                                        <p>Đang bảo trì</p>
                                    </div>
                                </div>
                            </div>

                            {/* Cars Table */}
                            <div className="admin-table-container">
                                {cars.length > 0 ? (
                                    <table className="admin-table">
                                        <thead>
                                            <tr>
                                                <th>ID</th>
                                                <th>Thông tin xe</th>
                                                <th>Chủ xe</th>
                                                <th>Giá/ngày</th>
                                                <th>Trạng thái</th>
                                                <th>Hành động</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredCars.map(car => (
                                                <tr key={car.id}>
                                                    <td>{car.id}</td>
                                                    <td>
                                                        <div className="car-info">
                                                            <img 
                                                                src={`http://localhost:8080${car.imagePaths}`} 
                                                                alt={car.carName}
                                                                className="car-thumbnail"
                                                            />
                                                            <div>
                                                                <strong>{car.carName}</strong>
                                                                <div className="car-details">
                                                                    <span>{car.transmission}</span>
                                                                    <span>{car.fuel}</span>
                                                                    <span>{car.seats} chỗ</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>{car.owner?.username}</td>
                                                    <td>{car.pricePerDay?.toLocaleString()}đ</td>
                                                    <td>
                                                        <span className="status-badge status-pending">
                                                            Chờ duyệt
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <div className="action-buttons">
                                                            <button 
                                                                className="btn btn-outline-success btn-sm"
                                                                onClick={() => handleStatusChange(car.id)}
                                                                title="Phê duyệt"
                                                            >
                                                                <FaCheck />
                                                            </button>
                                                            <button 
                                                                className="btn btn-outline-danger btn-sm"
                                                                title="Từ chối"
                                                            >
                                                                <FaBan />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <div className="no-data-message">
                                        <FaCar size={48} color="var(--theme-text-color)" opacity={0.5} />
                                        <h3>Không có xe nào đang chờ duyệt</h3>
                                        <p>Hiện tại không có xe nào cần được phê duyệt trong hệ thống.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default AdminCars; 