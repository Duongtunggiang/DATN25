import React, { useEffect, useState } from 'react';

const ToastNotification = ({ message, onClose }) => {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setVisible(false);
            onClose();
        }, 3000); // 3 giây rồi ẩn

        return () => clearTimeout(timer);
    }, [onClose]);

    if (!visible) return null;

    return (
        <div className="toast-container position-fixed bottom-0 end-0 p-3">
            <div className="toast show bg-success text-white" role="alert">
                <div className="toast-body d-flex justify-content-between align-items-center">
                    {message}
                    <button type="button" className="btn-close btn-close-white ms-3" onClick={onClose}></button>
                </div>
            </div>
        </div>
    );
};

export default ToastNotification;