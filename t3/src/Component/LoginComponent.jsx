import { useEffect, useState } from "react";
import { useNavigate, useLocation } from 'react-router-dom';
import { LoginAccount } from '../BackEnd/authen';
import { useToast } from '../Alert/ToastContext';
import { useAuth } from "../Authen/AuthContext";
import { FaEnvelope, FaLock, FaSignInAlt } from 'react-icons/fa';
import '../css/Auth.css';

const LoginComponent = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState({ email: '', password: '', general: '' });
    const { showToast } = useToast();
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const registerMessage = localStorage.getItem('registerMessage');
        if (registerMessage) {
            showToast(registerMessage, 'success');
            localStorage.removeItem('registerMessage');
        }

        // Hiển thị thông báo từ state nếu có
        if (location.state?.message) {
            setError(prev => ({
                ...prev,
                general: location.state.message
            }));
        }
    }, [location, showToast]);

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

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            showToast('Đăng nhập thành công!', 'success');

            login(user);

            // Kiểm tra xem có URL chuyển hướng không
            const redirectUrl = localStorage.getItem('redirectAfterLogin');
            if (redirectUrl) {
                localStorage.removeItem('redirectAfterLogin');
                navigate(redirectUrl);
            } else {
                // Chuyển hướng mặc định dựa trên vai trò
                if (user.roles.includes('ADMIN')) {
                    navigate('/admin');
                } else if (user.roles.includes('CAROWNER')) {
                    navigate('/home-xe');
                } else {
                    navigate('/');
                }
            }
            
            // Reload page after a short delay to ensure toast is visible
            setTimeout(() => {
                window.location.reload();
            }, 3000);

        } catch (error) {
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
            showToast(errorMessage, 'error');
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-box login-box">
                <div className="auth-header">
                    <h2>Đăng Nhập</h2>
                    <p>Chào mừng bạn trở lại với dịch vụ thuê xe</p>
                </div>

                {error.general && (
                    <div className="alert alert-danger fade-in">
                        {error.general}
                    </div>
                )}

                <form onSubmit={handleLogin} className="auth-form">
                    <div className="form-group">
                        <div className="input-group">
                            <span className="input-icon">
                                <FaEnvelope />
                            </span>
                            <input
                                type="email"
                                placeholder="Email của bạn"
                                value={email}
                                className={`form-control ${error.email ? 'is-invalid' : ''}`}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        {error.email && <div className="invalid-feedback">{error.email}</div>}
                    </div>

                    <div className="form-group">
                        <div className="input-group">
                            <span className="input-icon">
                                <FaLock />
                            </span>
                            <input
                                type="password"
                                placeholder="Mật khẩu"
                                value={password}
                                className={`form-control ${error.password ? 'is-invalid' : ''}`}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        {error.password && <div className="invalid-feedback">{error.password}</div>}
                    </div>

                    <button type="submit" className="auth-button">
                        <FaSignInAlt /> Đăng Nhập
                    </button>

                    <div className="auth-links">
                        <p>Chưa có tài khoản? <a href="/dang-ky" className="register-link">Đăng ký ngay</a></p>
                        <a href="/" className="home-link">Về trang chủ</a>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LoginComponent;
