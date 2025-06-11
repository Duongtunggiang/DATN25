import React, { useEffect, useState } from 'react';
import axiosInstance from '../Authen/axiosInstance';
import '../css/Admin.css';
import { FaUsers, FaCar, FaMoneyBillWave, FaChartLine } from 'react-icons/fa';
import { Line, Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend
);

function AdminDashboard() {
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalCars: 0,
        totalRevenue: 0,
        totalBookings: 0,
        monthlyRevenue: [],
        dailyVisitors: [],
        recentTransactions: []
    });
    const [loading, setLoading] = useState(true);

    const fetchStats = async () => {
        try {
            const [usersRes, carsRes, revenueRes, bookingsRes, transactionsRes] = await Promise.all([
                axiosInstance.get('/api/admin/stats/users'),
                axiosInstance.get('/api/admin/stats/cars'),
                axiosInstance.get('/api/admin/stats/revenue'),
                axiosInstance.get('/api/admin/stats/bookings'),
                axiosInstance.get('/api/admin/transactions/recent')
            ]);

            setStats({
                totalUsers: usersRes.data.total || 0,
                totalCars: carsRes.data.total || 0,
                totalRevenue: revenueRes.data.total || 0,
                totalBookings: bookingsRes.data.total || 0,
                monthlyRevenue: revenueRes.data.monthly || [],
                dailyVisitors: revenueRes.data.visitors || [],
                recentTransactions: Array.isArray(transactionsRes.data) ? transactionsRes.data : []
            });
        } catch (err) {
            console.error("Error fetching statistics:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    const revenueChartData = {
        labels: stats.monthlyRevenue.map(item => item.month),
        datasets: [{
            label: 'Doanh thu theo tháng',
            data: stats.monthlyRevenue.map(item => item.amount),
            fill: false,
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1
        }]
    };

    const visitorsChartData = {
        labels: stats.dailyVisitors.map(item => item.date),
        datasets: [{
            label: 'Lượt truy cập',
            data: stats.dailyVisitors.map(item => item.count),
            backgroundColor: 'rgba(54, 162, 235, 0.5)',
        }]
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
                                <h2>Tổng quan</h2>
                            </div>

                            {/* Stats Cards */}
                            <div className="stats-grid">
                                <div className="stats-card">
                                    <div className="stats-icon users">
                                        <FaUsers />
                                    </div>
                                    <div className="stats-info">
                                        <h3>{stats.totalUsers}</h3>
                                        <p>Người dùng</p>
                                    </div>
                                </div>
                                <div className="stats-card">
                                    <div className="stats-icon cars">
                                        <FaCar />
                                    </div>
                                    <div className="stats-info">
                                        <h3>{stats.totalCars}</h3>
                                        <p>Xe đăng ký</p>
                                    </div>
                                </div>
                                <div className="stats-card">
                                    <div className="stats-icon revenue">
                                        <FaMoneyBillWave />
                                    </div>
                                    <div className="stats-info">
                                        <h3>{stats.totalRevenue.toLocaleString()}đ</h3>
                                        <p>Doanh thu</p>
                                    </div>
                                </div>
                                <div className="stats-card">
                                    <div className="stats-icon pending">
                                        <FaChartLine />
                                    </div>
                                    <div className="stats-info">
                                        <h3>{stats.totalBookings}</h3>
                                        <p>Lượt đặt xe</p>
                                    </div>
                                </div>
                            </div>

                            {/* Charts */}
                            <div className="charts-grid">
                                <div className="chart-container">
                                    <h3>Doanh thu theo tháng</h3>
                                    <Line data={revenueChartData} options={{
                                        responsive: true,
                                        plugins: {
                                            legend: {
                                                position: 'top',
                                            },
                                            title: {
                                                display: true,
                                                text: 'Biểu đồ doanh thu'
                                            }
                                        },
                                        scales: {
                                            y: {
                                                beginAtZero: true,
                                                ticks: {
                                                    callback: value => value.toLocaleString() + 'đ'
                                                }
                                            }
                                        }
                                    }} />
                                </div>
                                <div className="chart-container">
                                    <h3>Lượt truy cập</h3>
                                    <Bar data={visitorsChartData} options={{
                                        responsive: true,
                                        plugins: {
                                            legend: {
                                                position: 'top',
                                            },
                                            title: {
                                                display: true,
                                                text: 'Thống kê lượt truy cập'
                                            }
                                        },
                                        scales: {
                                            y: {
                                                beginAtZero: true
                                            }
                                        }
                                    }} />
                                </div>
                            </div>

                            {/* Recent Activities */}
                            <div className="recent-activities">
                                <h3>Hoạt động gần đây</h3>
                                <div className="admin-table-container">
                                    <table className="admin-table">
                                        <thead>
                                            <tr>
                                                <th>Thời gian</th>
                                                <th>Người dùng</th>
                                                <th>Hoạt động</th>
                                                <th>Số tiền</th>
                                                <th>Trạng thái</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {stats.recentTransactions.map(transaction => (
                                                <tr key={transaction.id}>
                                                    <td>
                                                        <div className="transaction-date">
                                                            <div>{new Date(transaction.date).toLocaleDateString()}</div>
                                                            <small>{new Date(transaction.date).toLocaleTimeString()}</small>
                                                        </div>
                                                    </td>
                                                    <td>{transaction.user?.username}</td>
                                                    <td>
                                                        <span className={`type-badge type-${transaction.type.toLowerCase()}`}>
                                                            {transaction.type}
                                                        </span>
                                                    </td>
                                                    <td className="amount">
                                                        {transaction.amount?.toLocaleString()}đ
                                                    </td>
                                                    <td>
                                                        <span className={`status-badge status-${transaction.status.toLowerCase()}`}>
                                                            {transaction.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default AdminDashboard;
