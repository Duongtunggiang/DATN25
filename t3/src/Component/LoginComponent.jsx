import { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { LoginAccount } from '../BackEnd/authen';
import ToastNotification from '../Alert/ToastNotification';
import { useAuth } from "../Authen/AuthContext";

const LoginComponent = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState({ email: '', password: '', general: '' });
    const [toastMessage, setToastMessage] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const registerMessage = localStorage.getItem('registerMessage');
        if (registerMessage) {
            setToastMessage(registerMessage);
            localStorage.removeItem('registerMessage');
        }
    }, []);

    const handleLogin = async (e) => {
    e.preventDefault();
    setError({ email: '', password: '', general: '' });

    let isValid = true;
    const newError = { email: '', password: '', general: '' };

    if (!email) {
        newError.email = 'Email không được bỏ trống!';
        isValid = false;
    }
    if (!password) {
        newError.password = 'Mật khẩu không được bỏ trống!';
        isValid = false;
    }
    if (!isValid) {
        setError(newError);
        return;
    }

    try {
        const res = await LoginAccount({ email, password });

        const token = res.token;
        const user = res.user;

        if (!token || !user) {
            throw new Error('Đăng nhập thất bại!');
        }

        // ✅ Lưu token & user vào localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('loginMessage', 'Đăng nhập thành công!');

        login(user); // Cập nhật context

        if (user.roles.includes('CUSTOMER')) {
            navigate('/');
        } else {
            navigate('/home-xe');
        }

    } catch (error) {
        // Kiểm tra loại lỗi trả về
        let errorMessage = 'Đã xảy ra lỗi! Vui lòng thử lại.';
        
        if (error.response) {
            errorMessage = error.response?.data?.message || 'Email hoặc mật khẩu không đúng!';
        } else if (error.request) {
            errorMessage = 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại kết nối.';
        }

        setError({
            ...error,
            general: errorMessage,
        });
    }
};


    return (
        <div className="container">
            <div className="col-md-6 offset-md-3 mt-5">
                <h3 className="text-center">Đăng Nhập</h3>
                <form onSubmit={handleLogin} className="shadow p-4 rounded">
                    {error.general && <div className="alert alert-danger">{error.general}</div>}
                    <div className="mb-3">
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            className={`form-control ${error.email ? 'is-invalid' : ''}`}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        {error.email && <div className="invalid-feedback">{error.email}</div>}
                    </div>
                    <div className="mb-3">
                        <input
                            type="password"
                            placeholder="Mật khẩu"
                            value={password}
                            className={`form-control ${error.password ? 'is-invalid' : ''}`}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        {error.password && <div className="invalid-feedback">{error.password}</div>}
                    </div>
                    <button type="submit" className="btn btn-primary w-100 mb-3">Đăng nhập</button>
                    <span>Nếu bạn chưa có tài khoản hãy <a href="/dang-ky">đăng ký</a></span><br />
                    <a href="/">Trang chủ</a>
                </form>
            </div>

            {toastMessage && <ToastNotification message={toastMessage} onClose={() => setToastMessage('')} />}
        </div>
    );
};

export default LoginComponent;
