import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getCars, LogoutAccount } from '../BackEnd/authen';
import { useNavigate } from 'react-router-dom';


function HomeXeComp() {
  const [cars, setCars] = useState([]);

      useEffect(() => {
      const fetchCars = async () => {
        try {
          const cars = await getCars(); // đây đã là data
          setCars(cars);
        } catch (error) {
          console.error("Error fetching cars:", error);
        }
      };

      fetchCars();
    }, []);


    const formatPrice = (price) => {
      if (typeof price !== 'number') return 'Đang cập nhật';
      return price.toLocaleString('vi-VN') + '₫/ngày';
    };

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
    <div className="container mt-4">
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

      <a href="/them-xe">Thêm xe mới</a>
      <h2 className="text-center mb-4">Danh sách xe cho thuê</h2>
      <div className="row">
        {cars.map((car) => (
          <div className="col-md-4 mb-4" key={car.id}>
            <div className="card shadow-sm h-100">
              <img src={car.image} className="card-img-top" alt={car.name} />
              <div className="card-body">
                <h5 className="card-title">{car.name}</h5>
                <p className="card-text text-danger fw-bold">{formatPrice(car.price)}</p>
                <a href={`/chi-tiet-xe/${car.id}`} className="btn btn-primary w-100">Xem chi tiết</a>
              </div>
            </div>
          </div>
        ))}
      </div>
      {toastMessage && <ToastNotification message={toastMessage} onClose={() => setToastMessage('')} />}
    </div>
  );
}

export default HomeXeComp;
