import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminHeader from '../Headers/AdminHeader';
import AdminSidebar from '../AdminSidebar';
import './AdminLayout.css';

const AdminLayout = () => {
    return (
        <div className="admin-layout theme-layout">
            <AdminHeader />
            <div className="admin-main">
                <AdminSidebar />
                <div className="admin-content theme-content">
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default AdminLayout; 