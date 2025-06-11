import React, { useEffect, useState } from 'react';
import './ToastNotification.css';

const ToastNotification = ({ message, type = 'success', onClose }) => {
    const [isExiting, setIsExiting] = useState(false);
    const [progress, setProgress] = useState(100);

    useEffect(() => {
        const duration = 3000; // 3 seconds
        const interval = 10; // Update progress every 10ms
        
        const progressTimer = setInterval(() => {
            setProgress((prev) => {
                const newProgress = Math.max(0, prev - (100 / (duration / interval)));
                if (newProgress === 0) {
                    handleClose();
                }
                return newProgress;
            });
        }, interval);

        return () => {
            clearInterval(progressTimer);
        };
    }, []);

    const handleClose = () => {
        setIsExiting(true);
        setTimeout(() => {
            onClose();
        }, 300); // Match animation duration
    };

    return (
        <div className="custom-toast-wrapper">
            <div className={`custom-toast-notification ${type} ${isExiting ? 'exiting' : ''}`}>
                <div className="custom-toast-content">{message}</div>
                <button 
                    className="custom-toast-close" 
                    onClick={handleClose}
                    aria-label="Close notification"
                >
                    ×
                </button>
                <div className="custom-toast-progress">
                    <div 
                        className="custom-toast-progress-bar"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>
        </div>
    );
};

export default ToastNotification;