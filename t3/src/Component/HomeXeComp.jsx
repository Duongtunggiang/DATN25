import React, { useState, useEffect } from 'react';
import { getMyCars, deleteCar, LogoutAccount } from '../BackEnd/authen';
import { useNavigate } from 'react-router-dom';
import { FaTrash } from 'react-icons/fa';
import ToastNotification from '../Alert/ToastNotification';

function HomeXeComp() {
  const [cars, setCars] = useState([]);
  const [toastMessage, setToastMessage] = useState('');
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCars();

    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

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

  const fetchCars = async () => {
    try {
      const cars = await getMyCars();
      setCars(cars);
    } catch (error) {
      console.error("Error fetching cars:", error);
    }
  };

  const formatPrice = (price) => {
    if (typeof price !== 'number') return 'Đang cập nhật';
    return price.toLocaleString('vi-VN') + '₫/ngày';
  };

  const handleLogout = async () => {
    await LogoutAccount();
    document.cookie = 'auth_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    localStorage.removeItem('user');
    localStorage.setItem('logoutMessage', 'Đăng xuất thành công!');
    navigate('/');
    setTimeout(() => window.location.reload(), 100);
  };

  const handleDelete = async (carId) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa xe này không?")) {
      try {
        await deleteCar(carId);
        setToastMessage("Đã xóa xe và chuyển vào thùng rác!");
        fetchCars(); 
      } catch (error) {
        console.error("Lỗi khi xóa xe:", error);
        setToastMessage("Lỗi khi xóa xe.");
      }
    }
  };

  return (
    <div className="container mt-4">
      {user ? (
        <div className="mb-4">
          <h3>Xin chào, {user.username}!</h3>
          <div className="d-flex gap-2">
            <a href="/profile" className="btn btn-info">Cá nhân</a>
            <button onClick={handleLogout} className="btn btn-danger">Đăng xuất</button>
          </div>
        </div>
      ) : (
        <div className="mb-4 d-flex gap-2">
          <a href="/dang-nhap" className="btn btn-primary">Đăng nhập</a>
          <a href="/dang-ky" className="btn btn-secondary">Đăng ký</a>
          <a href="/dang-ky-chu-xe" className='btn btn-warning'>Đăng ký cho thuê xe</a>
        </div>
      )}

      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="text-center flex-grow-1">Danh sách xe cho thuê</h2>
        <a href="/them-xe" className="btn btn-success">+ Thêm xe mới</a>
      </div>
      <a href="/thung-rac" className="btn btn-outline-secondary ms-2">🗑️ Thùng rác</a>

      <div className="row">
        {cars.filter(car => car.status !== 'DELETED').map((car) => (
          <div className="col-md-6 mb-6" key={car.id}>
            <div className="card shadow-sm h-100 border-0">
              <img src={`http://localhost:8080${car.imagePaths}`} alt={car.carName} title={car.carName} className="card-img-top rounded" style={{ height: '200px', objectFit: 'cover' }} />
              <div className="card-body">
                <h5 className="card-title d-flex justify-content-between align-items-center">
                  {car.carName}
                  <button
                    className="btn btn-sm btn-outline-danger"
                    title="Xóa"
                    onClick={() => handleDelete(car.id)}
                  >
                    <FaTrash />
                  </button>
                </h5>
                <p className="card-text text-danger fw-bold">{formatPrice(car.pricePerDay)}</p>
                <span className="badge bg-secondary">{car.status}</span>
                <a href={`/chi-tiet-xe/${car.id}`} className="btn btn-primary w-100 mt-2">Xem chi tiết</a>
              </div>
            </div>
          </div>
        ))}
      </div>
        <a href="/vi-tien" className="btn btn-info me-2">Ví tiền</a>
      {toastMessage && (
        <ToastNotification message={toastMessage} onClose={() => setToastMessage('')} />
      )}
    </div>
  );
}

export default HomeXeComp;
