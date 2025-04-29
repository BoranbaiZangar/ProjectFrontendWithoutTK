import React, { useState } from 'react';

export default function SecuritySettingsSection() {
  const [password, setPassword] = useState('');

  const changePassword = () => {
    if (!password) return;
    // TODO: implement password change
    setPassword('');
  };

  return (
    <div className="my-6">
      <h2 className="font-serif text-xl text-[#3E2A1D] mb-2">Security Settings</h2>
      <div className="space-y-2">
        <input
          type="password"
          className="border p-2 rounded w-full"
          placeholder="New password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          className="bg-[#6B1E3A] text-white px-4 py-2 rounded"
          onClick={changePassword}
        >
          Change Password
        </button>
      </div>
    </div>
  );
}