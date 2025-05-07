import React, {  useRef } from "react";

const ImageUploader = ({ onUpload, reset }) => {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = ["image/png", "image/jpeg", "image/jpg"];
    if (!allowedTypes.includes(file.type)) {
      alert("Допустимы только PNG, JPG или JPEG.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result;
      localStorage.setItem("avatarImage", base64);
      onUpload(base64);
    };
    reader.readAsDataURL(file);
  };

  

  const triggerFileSelect = () => {
    fileInputRef.current.click();
  };

  return (
    <div style={{ marginTop: "20px", marginBottom: "10px" }}>
      <button type="button" className="edit-profile-btn" onClick={triggerFileSelect}>
        Загрузить аватар
      </button>
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
