import { Navigate, Outlet } from 'react-router-dom';

const PrivateRoute = () => {
    const user = JSON.parse(localStorage.getItem('user')); // Lấy user từ localStorage

    return user ? <Outlet /> : <Navigate to="/dang-nhap" replace />;
};

export default PrivateRoute;
