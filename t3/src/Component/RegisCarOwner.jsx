import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RegisterAccount } from '../BackEnd/authen';
import { FaUser, FaEnvelope, FaLock, FaCarSide } from 'react-icons/fa';
import '../css/Auth.css';

const RegisCarOwner = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [username, setUsername] = useState('');
    const [role] = useState('CAROWNER');
    const [error, setError] = useState({ username: '', email: '', password: '', confirmPassword: '' });
    const [apiError, setApiError] = useState('');
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setApiError('');
        setError({ username: '', email: '', password: '', confirmPassword: '' });

        let formIsValid = true;
        let errors = { username: '', email: '', password: '', confirmPassword: '' };

        if (!username) {
            formIsValid = false;
            errors.username = "Tên đăng ký không được bỏ trống!";
        }
        if (!email) {
            formIsValid = false;
            errors.email = "Email không được bỏ trống!";
        }
        if (!password) {
            formIsValid = false;
            errors.password = "Mật khẩu không được bỏ trống!";
        }
        if (password !== confirmPassword) {
            formIsValid = false;
            errors.confirmPassword = "Mật khẩu nhập lại không khớp!";
        }

        if (!formIsValid) {
            setError(errors);
            return;
        }

        const user = { username, email, password, confirmPassword, roleName: role };

        try {
            const response = await RegisterAccount(user);
            console.log('Đăng ký thành công: ', response);
            localStorage.setItem('registerMessage', 'Đăng ký thành công!');
            navigate('/dang-nhap');
        } catch (error) {
            console.error("Lỗi khi đăng ký:", error.response);

            if (error.response?.data?.error) {
                const message = error.response.data.error;
                if (message.includes("Email đã tồn tại")) {
                    setError(prev => ({ ...prev, email: message.replace('400 BAD_REQUEST "', '').replace('"', '') }));
                } else if (message.includes("Mật khẩu nhập lại không khớp")) {
                    setError(prev => ({ ...prev, confirmPassword: message.replace('400 BAD_REQUEST "', '').replace('"', '') }));
                } else {
                    setApiError(message.replace('400 BAD_REQUEST "', '').replace('"', ''));
                }
            } else {
                setApiError("Có lỗi xảy ra, vui lòng thử lại!");
            }
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-box carowner-box">
                <div className="auth-header">
                    <h2>Đăng Ký Tài Khoản Chủ Xe</h2>
                    <p>Tham gia cùng chúng tôi để cho thuê xe của bạn</p>
                </div>

                {apiError && <div className="alert alert-danger fade-in">{apiError}</div>}

                <form onSubmit={handleRegister} className="auth-form">
                    <div className="form-group">
                        <div className="input-group">
                            <span className="input-icon">
                                <FaUser />
                            </span>
                            <input
                                type="text"
                                placeholder="Tên của bạn"
                                value={username}
                                className={`form-control ${error.username ? 'is-invalid' : ''}`}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </div>
                        {error.username && <div className="invalid-feedback">{error.username}</div>}
                    </div>

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

                    <div className="form-group">
                        <div className="input-group">
                            <span className="input-icon">
                                <FaLock />
                            </span>
                            <input
                                type="password"
                                placeholder="Nhập lại mật khẩu"
                                value={confirmPassword}
                                className={`form-control ${error.confirmPassword ? 'is-invalid' : ''}`}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                        </div>
                        {error.confirmPassword && <div className="invalid-feedback">{error.confirmPassword}</div>}
                    </div>

                    <button type="submit" className="auth-button">
                        <FaCarSide /> Đăng ký làm chủ xe
                    </button>

                    <div className="auth-links">
                        <p>Đã có tài khoản? <a href="/dang-nhap" className="login-link">Đăng nhập ngay</a></p>
                        <a href="/" className="home-link">Về trang chủ</a>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RegisCarOwner;
