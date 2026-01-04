import React, { useEffect } from 'react';
import './NotificationToast.css';

const NotificationToast = ({ notification, onClose, onClick }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 8000); // 8초 후 자동 제거

    return () => clearTimeout(timer);
  }, [onClose]);

  if (!notification) return null;

  return (
    <div className="notification-toast" onClick={() => onClick(notification)}>
      <div className="toast-header">
        <span className="toast-type">{notification.type}</span>
        <button className="toast-close" onClick={(e) => { e.stopPropagation(); onClose(); }}>×</button>
      </div>
      <div className="toast-message">{notification.message}</div>
    </div>
  );
};

export default NotificationToast;
