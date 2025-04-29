import React, { useState } from 'react';

export default function AvatarSection({ initialAvatar }) {
  const [avatarUrl, setAvatarUrl] = useState(initialAvatar || '');

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setAvatarUrl(url);
    // TODO: upload avatar to server
  };

  return (
    <div className="my-6">
      <h2 className="font-serif text-xl text-[#3E2A1D] mb-2">Profile Avatar</h2>
      <div className="flex items-center space-x-4">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt="Avatar"
            className="w-24 h-24 rounded-full object-cover border"
          />
        ) : (
          <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-500">No Avatar</span>
          </div>
        )}
        <input type="file" accept="image/*" onChange={handleAvatarChange} />
      </div>
    </div>
  );
}