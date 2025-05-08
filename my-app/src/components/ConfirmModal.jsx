import React from "react";
import "../css/ConfirmModal.css";

const ConfirmModal = ({ message, onConfirm, onCancel }) => {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <p className="modal-message">{message}</p>
        <div className="modal-buttons">
          <button onClick={onConfirm} className="edit-profile-btn modal-confirm">
            Yes
          </button>
          <button onClick={onCancel} className="edit-profile-btn modal-cancel">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;