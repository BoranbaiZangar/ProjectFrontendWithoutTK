// src/components/Toast.js
import React from "react";

const Toast = ({ message, type }) => {
  const background = type === "error" ? "#e74c3c" : "#2ecc71";

  return (
    <div style={{ ...style, background }}>
      {typeof message === "string" ? message : JSON.stringify(message)}
    </div>
  );
};

const style = {
  position: "fixed",
  bottom: "20px",
  right: "20px",
  color: "#fff",
  padding: "1rem 1.5rem",
  borderRadius: "6px",
  boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
  zIndex: 1000,
};

export default Toast;
