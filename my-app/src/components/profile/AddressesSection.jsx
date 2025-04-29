import React, { useState } from 'react';

export default function AddressesSection({ initialAddresses }) {
  const [addresses, setAddresses] = useState(initialAddresses || []);
  const [newAddr, setNewAddr] = useState('');

  const addAddress = () => {
    if (!newAddr) return;
    const next = { id: Date.now(), value: newAddr };
    setAddresses([...addresses, next]);
    setNewAddr('');
    // TODO: send to server
  };

  const updateAddress = (id, value) => {
    setAddresses(
      addresses.map((a) => (a.id === id ? { ...a, value } : a))
    );
    // TODO: update on server
  };

  return (
    <div className="my-6">
      <h2 className="font-serif text-xl text-[#3E2A1D] mb-2">Addresses</h2>
      <div className="space-y-2">
        {addresses.map((addr) => (
          <input
            key={addr.id}
            type="text"
            className="border p-2 rounded w-full"
            value={addr.value}
            onChange={(e) => updateAddress(addr.id, e.target.value)}
          />
        ))}
        <div className="flex space-x-2">
          <input
            type="text"
            className="border p-2 rounded flex-1"
            placeholder="New address"
            value={newAddr}
            onChange={(e) => setNewAddr(e.target.value)}
          />
          <button
            className="bg-[#6B1E3A] text-white px-4 py-2 rounded"
            onClick={addAddress}
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}