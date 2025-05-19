const ToastNotification = ({ message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="toast show position-fixed bottom-0 end-0 m-3 bg-success text-white p-3">
      {message}
    </div>
  );
};

export default ToastNotification;
