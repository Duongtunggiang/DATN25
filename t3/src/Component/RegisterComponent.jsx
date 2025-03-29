import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RegisterAccount } from '../BackEnd/authen';

const RegisterComponent = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [username, setUsername] = useState('');
    const [role, setRole] = useState('CUSTOMER'); 
    const [error, setError] = useState({ username: '', email: '', password: '', confirmPassword: '' });
    const [apiError, setApiError] = useState(''); // Thêm state để lưu lỗi từ backend
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
        
            if (error.response && error.response.data && error.response.data.error) {
                console.error("Chi tiết lỗi từ backend:", error.response.data);
        
                const message = error.response.data.error; 
                if (message.includes("Email đã tồn tại")) {
                    setError((prev) => ({ ...prev, email: message.replace('400 BAD_REQUEST "', '').replace('"', '') }));
                } else if (message.includes("Mật khẩu nhập lại không khớp")) {
                    setError((prev) => ({ ...prev, confirmPassword: message.replace('400 BAD_REQUEST "', '').replace('"', '') }));
                } else {
                    setApiError(message.replace('400 BAD_REQUEST "', '').replace('"', ''));
                }
            } else {
                setApiError("Có lỗi xảy ra, vui lòng thử lại!");
            }
        }
        
        
        
    };
    

    return (
        <div className="container">
            <div className="col-md-6 offset-md-3 mt-5">
                <h3 className="text-center">Đăng Ký Tài Khoản</h3>

                {apiError && <div className="alert alert-danger">{apiError}</div>} 
                {error.email && <div className="invalid-feedback">{error.email}</div>}
                {error.confirmPassword && <div className="invalid-feedback">{error.confirmPassword}</div>}

                <form onSubmit={handleRegister} className="shadow p-4 rounded">
                    <div className="mb-3">
                        <input
                            type="text"
                            placeholder="Tên đăng ký"
                            value={username}
                            className={`form-control ${error.username ? 'is-invalid' : ''}`}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                        {error.username && <div className="invalid-feedback">{error.username}</div>}
                    </div>

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

                    <div className="mb-3">
                        <input
                            type="password"
                            placeholder="Nhập lại mật khẩu"
                            value={confirmPassword}
                            className={`form-control ${error.confirmPassword ? 'is-invalid' : ''}`}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                        {error.confirmPassword && <div className="invalid-feedback">{error.confirmPassword}</div>}
                    </div>

                    <button type="submit" className="btn btn-primary w-100 mb-3">Đăng ký</button>
                    <span>Nếu bạn đã có tài khoản hãy <a href="/dang-nhap">đăng nhập</a>.</span>
                </form>
            </div>
        </div>
    );
};

export default RegisterComponent;
