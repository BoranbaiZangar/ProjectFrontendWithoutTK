import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { removeToast } from "../redux/toast";
import "../css/Toast.css";

const Toast = () => {
  const toasts = useSelector((state) => state.toasts);
  const dispatch = useDispatch();

  useEffect(() => {
    toasts.forEach((toast) => {
      console.log("Rendering toast:", toast); // Для отладки
      if (toast.autoClose) {
        const timer = setTimeout(() => {
          dispatch(removeToast(toast.id));
        }, toast.autoClose);
        return () => clearTimeout(timer);
      }
    });
  }, [toasts, dispatch]);

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`toast toast-${toast.type} toast-${toast.position.toLowerCase().replace("_", "-")}`}
        >
          <p className="toast-message">{toast.message}</p>
          <button
            className="toast-close"
            onClick={() => dispatch(removeToast(toast.id))}
          >
            ×
          </button>
          <div
            className="toast-progress"
            style={{ animationDuration: `${toast.autoClose}ms` }}
          />
        </div>
      ))}
    </div>
  );
};

export default Toast;