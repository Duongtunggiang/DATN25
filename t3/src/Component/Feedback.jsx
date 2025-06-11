import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaStar } from 'react-icons/fa';
import { submitFeedback } from '../BackEnd/authen';
import ToastNotification from '../Alert/ToastNotification';
import '../css/Feedback.css';

const Feedback = () => {
    const { bookingId } = useParams();
    const navigate = useNavigate();
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [comment, setComment] = useState('');
    const [toastMessage, setToastMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (rating === 0) {
            setToastMessage('Vui lòng chọn số sao đánh giá');
            return;
        }

        try {
            setIsSubmitting(true);
            await submitFeedback(bookingId, {
                numberFeedback: rating,
                contentFeedback: comment
            });
            setToastMessage('Cảm ơn bạn đã đánh giá!');
            setTimeout(() => {
                navigate('/don-hang');
            }, 2000);
        } catch (error) {
            setToastMessage(error.response?.data?.message || 'Có lỗi xảy ra khi gửi đánh giá');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="feedback-page">
            <div className="feedback-container">
                <h2>Đánh giá chuyến đi</h2>
                <form onSubmit={handleSubmit}>
                    <div className="rating-container">
                        <p>Bạn cảm thấy chuyến đi thế nào?</p>
                        <div className="stars">
                            {[...Array(5)].map((star, index) => {
                                const ratingValue = index + 1;
                                return (
                                    <label key={index}>
                                        <input
                                            type="radio"
                                            name="rating"
                                            value={ratingValue}
                                            onClick={() => setRating(ratingValue)}
                                        />
                                        <FaStar
                                            className="star"
                                            color={ratingValue <= (hover || rating) ? "#ffc107" : "#e4e5e9"}
                                            size={40}
                                            onMouseEnter={() => setHover(ratingValue)}
                                            onMouseLeave={() => setHover(rating)}
                                        />
                                    </label>
                                );
                            })}
                        </div>
                    </div>

                    <div className="comment-container">
                        <p>Chia sẻ thêm về trải nghiệm của bạn:</p>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Nhập đánh giá của bạn..."
                            rows="4"
                        />
                    </div>

                    <div className="button-container">
                        <button 
                            type="button" 
                            className="btn btn-secondary"
                            onClick={() => navigate('/don-hang')}
                            disabled={isSubmitting}
                        >
                            Hủy
                        </button>
                        <button 
                            type="submit" 
                            className="btn btn-primary"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Đang gửi...' : 'Gửi đánh giá'}
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

export default Feedback; 