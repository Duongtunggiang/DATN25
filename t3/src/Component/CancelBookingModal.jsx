import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaTimes } from 'react-icons/fa';
import { cancelBookingWithReason } from '../BackEnd/authen';
import ToastNotification from '../Alert/ToastNotification';
import '../css/CancelBookingModal.css';

const CancelBookingModal = () => {
    const { bookingId } = useParams();
    const navigate = useNavigate();
    const [reason, setReason] = useState('');
    const [toast, setToast] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(true);

    const suggestedReasons = [
        "Tôi đã tìm được xe khác phù hợp hơn",
        "Thời gian thuê xe không còn phù hợp với lịch trình của tôi",
        "Tôi cần thay đổi ngày thuê xe",
        "Tôi muốn hủy để đặt xe khác với giá tốt hơn",
        "Tôi đã thay đổi kế hoạch đi lại",
        "Tôi muốn hủy để đặt xe ở địa điểm khác gần hơn"
    ];

    const handleSuggestionClick = (suggestion) => {
        setReason(suggestion);
        setShowSuggestions(false);
    };

    const handleReasonChange = (e) => {
        const value = e.target.value;
        setReason(value);
        if (!value.trim()) {
            setShowSuggestions(true);
        } else {
            setShowSuggestions(false);
        }
    };

    const handleClose = () => {
        navigate('/don-hang'); 
    };

    const handleCancel = async () => {
        if (!reason.trim()) {
            setToast('Vui lòng nhập lý do hủy đơn');
            setShowSuggestions(true);
            return;
        }

        if (reason.length < 10) {
            setToast('Lý do hủy đơn phải có ít nhất 10 ký tự');
            return;
        }

        try {
            setIsSubmitting(true);
            await cancelBookingWithReason(bookingId, reason);
            setToast('Hủy đơn hàng thành công');
            setTimeout(() => {
                navigate('/don-hang'); 
            }, 1500);
        } catch (error) {
            setToast(error.response?.data?.message || 'Lỗi khi hủy đơn hàng');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="cp-modal-overlay">
            <div className="cp-modal-content">
                <h3 className="cp-modal-title">Hủy đơn hàng #{bookingId}</h3>
                <div className="warning-messages">
                    <p className="warning-text">Lưu ý: Hủy đơn hàng sẽ không thể khôi phục lại</p>
                    <p className="warning-text">Lưu ý*: Nếu bạn hủy đơn sẽ bị triết khấu 10%</p>
                </div>
                <p className="cp-modal-description">
                    Vui lòng cho chúng tôi biết lý do bạn muốn hủy đơn hàng này.
                </p>

                {showSuggestions && (
                    <div className="cp-suggestions-container">
                        <p className="cp-suggestions-title">Gợi ý lý do hủy đơn:</p>
                        <div className="cp-suggestions-list">
                            {suggestedReasons.map((suggestion, index) => (
                                <button
                                    key={index}
                                    className="cp-suggestion-item"
                                    onClick={() => handleSuggestionClick(suggestion)}
                                >
                                    {suggestion}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                <textarea
                    className="cp-reason-textarea"
                    rows="4"
                    value={reason}
                    onChange={handleReasonChange}
                    placeholder="Ví dụ: Tôi đổi ý, thời gian không phù hợp..."
                    disabled={isSubmitting}
                    maxLength={500}
                />
                <div className="cp-char-count">
                    {reason.length}/500 ký tự (tối thiểu 10)
                </div>
                <div className="cp-modal-actions">
                    <button 
                        className="cp-btn-close"
                        onClick={handleClose}
                        disabled={isSubmitting}
                    >
                        <FaTimes />
                    </button>
                    <button 
                        className="cp-btn-confirm"
                        onClick={handleCancel}
                        disabled={isSubmitting || reason.length < 10}
                    >
                        {isSubmitting ? 'Đang xử lý...' : 'Xác nhận hủy'}
                    </button>
                </div>
                {toast && (
                    <ToastNotification
                        message={toast}
                        onClose={() => setToast('')}
                    />
                )}
            </div>
        </div>
    );
};

export default CancelBookingModal;
