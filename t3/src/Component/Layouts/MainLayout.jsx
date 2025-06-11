import React from 'react';
import CustomerHeader from '../Headers/CustomerHeader';
import CarOwnerHeader from '../Headers/CarOwnerHeader';
import AdminHeader from '../Headers/AdminHeader';
import Footer from '../Footer';
import '../../css/MainLayout.css';

const MainLayout = ({ children }) => {
    const user = JSON.parse(localStorage.getItem('user'));
    
    const getHeader = () => {
        if (!user) return <CustomerHeader />;
        
        if (user.roles.includes('ADMIN')) {
            return <AdminHeader />;
        } else if (user.roles.includes('CAROWNER')) {
            return <CarOwnerHeader />;
        } else {
            return <CustomerHeader />;
        }
    };

    const getRoleClass = () => {
        if (!user) return 'role-customer';
        
        if (user.roles.includes('ADMIN')) {
            return 'role-admin';
        } else if (user.roles.includes('CAROWNER')) {
            return 'role-carowner';
        } else {
            return 'role-customer';
        }
    };

    return (
        <div className={`main-layout ${getRoleClass()}`}>
            {getHeader()}
            <main className="main-content">
                {children}
            </main>
            <Footer />
        </div>
    );
};

export default MainLayout; 