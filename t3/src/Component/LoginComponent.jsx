import { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { LoginAccount } from '../BackEnd/authen';
import ToastNotification from '../Alert/ToastNotification';

const LoginComponent = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState({ email: '', password: '' });
    const [toastMessage, setToastMessage] = useState('');
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
    
        let formIsValid = true;
        let errors = { email: '', password: '' };
    
        if (!email) {
            formIsValid = false;
            errors.email = 'Email không được bỏ trống!';
        }
        if (!password) {
            formIsValid = false;
            errors.password = 'Mật khẩu không được bỏ trống!';
        }
    
        if (!formIsValid) {
            setError(errors);
            return;
        }
        
    
        try {
            // const response = await LoginAccount(user);
            // console.log(response);
            // localStorage.setItem('user', JSON.stringify(response.user));
            // navigate('/');
            const response = await LoginAccount({ email, password });
            localStorage.setItem('user', JSON.stringify(response.user));
            localStorage.setItem('loginMessage', 'Đăng nhập thành công!');
            navigate('/');
        } catch (error) {
            if (error.response) {
                setError({ general: error.response.data?.message || 'Email hoặc mật khẩu không đúng!' });
            } else {
                setError({ general: 'Lỗi kết nối, vui lòng thử lại!' });
            }
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
                    <span>Nếu bạn chưa có tài khoản hãy <a href="/dang-ky">đăng ký</a></span>
                </form>
            </div>

            {toastMessage && <ToastNotification message={toastMessage} onClose={() => setToastMessage('')} />}
        </div>
    );
}

export default LoginComponent;
