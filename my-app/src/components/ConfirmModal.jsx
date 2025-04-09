import React from "react";

const ConfirmModal = ({ message, onConfirm, onCancel }) => {
  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <p style={{ marginBottom: "1rem" }}>{message}</p>
        <button onClick={onConfirm} style={{ ...btn, background: "#e74c3c" }}>
          Да
        </button>
        <button onClick={onCancel} style={{ ...btn, marginLeft: "1rem" }}>
          Отмена
        </button>
      </div>
    </div>
  );
};

const overlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  backgroundColor: "rgba(0,0,0,0.4)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 999,
};

const modalStyle = {
  backgroundColor: "#fff",
  padding: "2rem",
  borderRadius: "10px",
  boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
};

const btn = {
  padding: "0.5rem 1rem",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer",
};

export default ConfirmModal;
