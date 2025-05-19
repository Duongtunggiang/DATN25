import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoginAccount, LogoutAccount } from '../BackEnd/authen';
import ToastNotification from '../Alert/ToastNotification';

const HomeCom = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [toastMessage, setToastMessage] = useState('');

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    
        // Kiểm tra nếu có thông báo đăng nhập hoặc đăng xuất
        const loginMessage = localStorage.getItem('loginMessage');
        if (loginMessage) {
            setToastMessage(loginMessage);
            localStorage.removeItem('loginMessage'); 
        }
    
        const logoutMessage = localStorage.getItem('logoutMessage');
        if (logoutMessage) {
            setToastMessage(logoutMessage);
            localStorage.removeItem('logoutMessage'); 
        }
    }, []);
    
    const handleLogout = async () => {
        await LogoutAccount();
        document.cookie = 'auth_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        localStorage.removeItem('user');
        localStorage.setItem('logoutMessage', 'Đăng xuất thành công!');
        navigate('/'); 
        setTimeout(() => {
            window.location.reload(); 
        }, 100); 
    };
    

    return (
        <div>
            <h2>Trang chủ</h2>
            {user ? (
                <div>
                    <h3>Xin chào, {user.username}!</h3>
                    <br /><a href="/profile">Cá nhân</a>
                    <button onClick={handleLogout} className="btn btn-danger">Đăng xuất</button>
                </div>
            ) : (
                <div>
                    <a href="/dang-nhap" className="btn btn-primary me-2">Đăng nhập</a>
                    <a href="/dang-ky" className="btn btn-secondary">Đăng ký</a>
                    <a href="/dang-ky-chu-xe" className=' btn btn-warning'> Đăng ký cho thuê xe</a>
                </div>
            )}
            <a href="/chat">Chat with AI</a>
            {toastMessage && <ToastNotification message={toastMessage} onClose={() => setToastMessage('')} />}
        </div>
    );
}

export default HomeCom;
