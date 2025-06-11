import React, { useState, useEffect } from 'react';
import { FaEye, FaCheck, FaTimes, FaDownload } from 'react-icons/fa';
import '../../css/Admin.css';

const AdminTransactions = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [dateRange, setDateRange] = useState('week');

    useEffect(() => {
        fetchTransactions();
    }, [dateRange]);

    const fetchTransactions = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/admin/transactions?range=${dateRange}`);
            const data = await response.json();
            setTransactions(data);
        } catch (error) {
            console.error('Error fetching transactions:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (transactionId, newStatus) => {
        try {
            await fetch(`/api/admin/transactions/${transactionId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status: newStatus }),
            });
            fetchTransactions();
        } catch (error) {
            console.error('Error updating transaction status:', error);
        }
    };

    const exportTransactions = () => {
        console.log('Exporting transactions...');
    };

    const filteredTransactions = transactions.filter(transaction => {
        if (filter === 'all') return true;
        return transaction.status === filter;
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
                            <div className="header-top">
                                <h2>Quản lý giao dịch</h2>
                                <button 
                                    className="btn btn-outline-primary"
                                    onClick={exportTransactions}
                                >
                                    <FaDownload /> Xuất báo cáo
                                </button>
                            </div>
                            
                            <div className="admin-filters">
                                <div className="filter-group">
                                    <button 
                                        className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                                        onClick={() => setFilter('all')}
                                    >
                                        Tất cả
                                    </button>
                                    <button 
                                        className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
                                        onClick={() => setFilter('pending')}
                                    >
                                        Chờ xử lý
                                    </button>
                                    <button 
                                        className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
                                        onClick={() => setFilter('completed')}
                                    >
                                        Hoàn thành
                                    </button>
                                    <button 
                                        className={`filter-btn ${filter === 'failed' ? 'active' : ''}`}
                                        onClick={() => setFilter('failed')}
                                    >
                                        Thất bại
                                    </button>
                                </div>

                                <div className="filter-group">
                                    <button 
                                        className={`filter-btn ${dateRange === 'week' ? 'active' : ''}`}
                                        onClick={() => setDateRange('week')}
                                    >
                                        Tuần này
                                    </button>
                                    <button 
                                        className={`filter-btn ${dateRange === 'month' ? 'active' : ''}`}
                                        onClick={() => setDateRange('month')}
                                    >
                                        Tháng này
                                    </button>
                                    <button 
                                        className={`filter-btn ${dateRange === 'year' ? 'active' : ''}`}
                                        onClick={() => setDateRange('year')}
                                    >
                                        Năm nay
                                    </button>
                                </div>
                            </div>

                            <div className="admin-table-container">
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Ngày</th>
                                            <th>Người dùng</th>
                                            <th>Loại</th>
                                            <th>Số tiền</th>
                                            <th>Trạng thái</th>
                                            <th>Hành động</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredTransactions.map(transaction => (
                                            <tr key={transaction.id}>
                                                <td>{transaction.id}</td>
                                                <td>
                                                    <div className="transaction-date">
                                                        <div>{new Date(transaction.date).toLocaleDateString()}</div>
                                                        <small>{new Date(transaction.date).toLocaleTimeString()}</small>
                                                    </div>
                                                </td>
                                                <td>{transaction.user.username}</td>
                                                <td>
                                                    <span className={`type-badge type-${transaction.type.toLowerCase()}`}>
                                                        {transaction.type}
                                                    </span>
                                                </td>
                                                <td className="amount">
                                                    {transaction.amount.toLocaleString()}đ
                                                </td>
                                                <td>
                                                    <span className={`status-badge status-${transaction.status.toLowerCase()}`}>
                                                        {transaction.status}
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
                                                        {transaction.status === 'PENDING' && (
                                                            <>
                                                                <button 
                                                                    className="btn btn-outline-success btn-sm"
                                                                    onClick={() => handleStatusChange(transaction.id, 'COMPLETED')}
                                                                    title="Phê duyệt"
                                                                >
                                                                    <FaCheck />
                                                                </button>
                                                                <button 
                                                                    className="btn btn-outline-danger btn-sm"
                                                                    onClick={() => handleStatusChange(transaction.id, 'FAILED')}
                                                                    title="Từ chối"
                                                                >
                                                                    <FaTimes />
                                                                </button>
                                                            </>
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

export default AdminTransactions; 