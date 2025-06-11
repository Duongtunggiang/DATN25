import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCarById, cancelDelivery } from '../BackEnd/authen';
import ToastNotification from '../Alert/ToastNotification';
import '../css/HuyGiaoXe.css';

const HuyGiaoXe = () => {
    const { carId } = useParams();
    const navigate = useNavigate();
    const [car, setCar] = useState(null);
    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(false);
    const [toastMessage, setToastMessage] = useState('');

    useEffect(() => {
        fetchCarData();
    }, [carId]);

    const fetchCarData = async () => {
        try {
            const data = await getCarById(carId);
            setCar(data);
            if (data.status !== 'DEPOSIT') {
                setToastMessage('Xe không ở trạng thái chờ giao');
                setTimeout(() => navigate(`/chi-tiet-xe/${carId}`), 2000);
            }
        } catch (error) {
            console.error('Lỗi khi lấy thông tin xe:', error);
            setToastMessage('Không thể tải thông tin xe');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!reason.trim()) {
            setToastMessage('Vui lòng nhập lý do hủy giao xe');
            return;
        }

        try {
            setLoading(true);
            await cancelDelivery(carId, reason);
            setToastMessage('Đã hủy giao xe thành công');
            setTimeout(() => navigate(`/chi-tiet-xe/${carId}`), 2000);
        } catch (error) {
            console.error('Lỗi khi hủy giao xe:', error);
            setToastMessage('Không thể hủy giao xe');
        } finally {
            setLoading(false);
        }
    };

    if (!car) {
        return (
            <div className="loading-container">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Đang tải...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="cancel-delivery-page">
            <div className="cancel-delivery-container">
                <h2>Hủy Giao Xe</h2>
                <div className="car-info">
                    <img 
                        src={`http://localhost:8080${car.imagePaths}`} 
                        alt={car.carName} 
                    />
                    <div className="car-details">
                        <h3>{car.carName}</h3>
                        <p className="license-plate">{car.licensePlate}</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="reason">Lý do hủy giao xe:</label>
                        <textarea
                            id="reason"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="Nhập lý do hủy giao xe..."
                            rows="4"
                            required
                        />
                    </div>

                    <div className="button-group">
                        <button 
                            type="button" 
                            className="btn btn-secondary"
                            onClick={() => navigate(`/chi-tiet-xe/${carId}`)}
                            disabled={loading}
                        >
                            Hủy
                        </button>
                        <button 
                            type="submit" 
                            className="btn btn-danger"
                            disabled={loading}
                        >
                            {loading ? 'Đang xử lý...' : 'Xác nhận hủy giao xe'}
                        </button>
                    </div>
                </form>
            </div>

            {toastMessage && (
                <ToastNotification 
                    message={toastMessage} 
                    onClose={() => setToastMessage('')} 
                />
            )}
        </div>
    );
};

export default HuyGiaoXe; 