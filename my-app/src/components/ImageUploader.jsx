import React, { useRef, useState } from "react";

const ImageUploader = ({
  mode = "add", // "add", "edit", or "save/cancel"
  addButtonText = "Add Image",
  editButtonText = "Edit Image",
  onUpload,
  onSave,
  onCancel,
}) => {
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = ["image/png", "image/jpeg", "image/jpg"];
    if (!allowedTypes.includes(file.type)) {
      alert("Only PNG, JPG, or JPEG are allowed.");
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result;
      onUpload(base64);
    };
    reader.readAsDataURL(file);
  };

  const triggerFileSelect = () => {
    fileInputRef.current.click();
  };

  const handleSave = () => {
    if (selectedFile) {
      onSave();
      setSelectedFile(null);
    }
  };

  const handleCancel = () => {
    setSelectedFile(null);
    onCancel();
  };

  return (
    <div style={{ marginBottom: "10px" }}>
      {mode === "add" && (
        <button type="button" className="edit-profile-btn" onClick={triggerFileSelect}>
          {addButtonText}
        </button>
      )}
      {mode === "edit" && (
        <button type="button" className="edit-profile-btn" onClick={triggerFileSelect}>
          {editButtonText}
        </button>
      )}
      {mode === "save/cancel" && (
        <div className="button-group">
          <button
            type="button"
            className="save-button"
            onClick={handleSave}
            disabled={!selectedFile}
          >
            Save
          </button>
          <button type="button" className="cancel-button" onClick={handleCancel}>
            Cancel
          </button>
        </div>
      )}
      <input
        type="file"
        accept="image/png, image/jpeg"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: "none" }}
      />
    </div>
  );
};

export default ImageUploader;