import React, { useState, useEffect } from 'react';
import { FaUserEdit, FaTrash, FaCheck, FaBan } from 'react-icons/fa';
import '../../css/Admin.css';

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/admin/users');
            const data = await response.json();
            setUsers(data);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (userId, newStatus) => {
        try {
            await fetch(`/api/admin/users/${userId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status: newStatus }),
            });
            fetchUsers();
        } catch (error) {
            console.error('Error updating user status:', error);
        }
    };

    const filteredUsers = users.filter(user => {
        if (filter === 'all') return true;
        return user.status === filter;
    });

    if (loading) {
        return (
            <div className="admin-page">
                <section className="admin-section">
                    <div className="admin-container">
                        <div className="admin-wrapper">
                            <div className="admin-content">
                                <div className="admin-loading">
                                    <div className="spinner-border text-primary" role="status">
                                        <span className="visually-hidden">Loading...</span>
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
                            <h2>Quản lý người dùng</h2>
                            <div className="admin-filters">
                                <button 
                                    className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                                    onClick={() => setFilter('all')}
                                >
                                    Tất cả người dùng
                                </button>
                                <button 
                                    className={`filter-btn ${filter === 'active' ? 'active' : ''}`}
                                    onClick={() => setFilter('active')}
                                >
                                    Đang hoạt động
                                </button>
                                <button 
                                    className={`filter-btn ${filter === 'blocked' ? 'active' : ''}`}
                                    onClick={() => setFilter('blocked')}
                                >
                                    Đã khóa
                                </button>
                            </div>

                            <div className="admin-table-container">
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Tên người dùng</th>
                                            <th>Email</th>
                                            <th>Vai trò</th>
                                            <th>Trạng thái</th>
                                            <th>Hành động</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredUsers.map(user => (
                                            <tr key={user.id}>
                                                <td>{user.id}</td>
                                                <td>
                                                    <div className="user-info">
                                                        <img 
                                                            src={user.avatar || '/default-avatar.png'} 
                                                            alt={user.username}
                                                            className="user-avatar"
                                                        />
                                                        {user.username}
                                                    </div>
                                                </td>
                                                <td>{user.email}</td>
                                                <td>
                                                    <span className={`role-badge role-${user.role.toLowerCase()}`}>
                                                        {user.role}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className={`status-badge status-${user.status.toLowerCase()}`}>
                                                        {user.status}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="action-buttons">
                                                        <button 
                                                            className="btn btn-outline-primary btn-sm"
                                                            title="Chỉnh sửa"
                                                        >
                                                            <FaUserEdit />
                                                        </button>
                                                        {user.status === 'ACTIVE' ? (
                                                            <button 
                                                                className="btn btn-outline-danger btn-sm"
                                                                onClick={() => handleStatusChange(user.id, 'BLOCKED')}
                                                                title="Khóa tài khoản"
                                                            >
                                                                <FaBan />
                                                            </button>
                                                        ) : (
                                                            <button 
                                                                className="btn btn-outline-success btn-sm"
                                                                onClick={() => handleStatusChange(user.id, 'ACTIVE')}
                                                                title="Kích hoạt"
                                                            >
                                                                <FaCheck />
                                                            </button>
                                                        )}
                                                        <button 
                                                            className="btn btn-outline-danger btn-sm"
                                                            title="Xóa"
                                                        >
                                                            <FaTrash />
                                                        </button>
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

export default AdminUsers; 