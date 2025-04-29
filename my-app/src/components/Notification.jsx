import React, { useEffect } from "react";
import "../css/styles.css";

const Notification = ({ message, type, onClose }) => {
  console.log("Notification rendered:", { message, type });

  useEffect(() => {
    const timer = setTimeout(() => {
      console.log("Notification auto-closing");
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`notification ${type}`}>
      <span>{message}</span>
      <button className="notification-close" onClick={onClose}>
        ✕
      </button>
    </div>
  );
};

export default Notification;