import React, { useState } from 'react';

export default function PaymentMethodsSection({ initialPayments }) {
  const [payments, setPayments] = useState(initialPayments || []);
  const [newCard, setNewCard] = useState('');

  const addPayment = () => {
    if (!newCard) return;
    const last4 = newCard.slice(-4);
    const next = { id: Date.now(), last4 };
    setPayments([...payments, next]);
    setNewCard('');
    // TODO: send to server
  };

  const updatePayment = (id, last4) => {
    setPayments(
      payments.map((p) => (p.id === id ? { ...p, last4 } : p))
    );
    // TODO: update on server
  };

  return (
    <div className="my-6">
      <h2 className="font-serif text-xl text-[#3E2A1D] mb-2">Payment Methods</h2>
      <div className="space-y-2">
        {payments.map((pm) => (
          <div key={pm.id} className="flex items-center space-x-2">
            <input
              type="text"
              className="border p-2 rounded w-24"
              value={pm.last4}
              onChange={(e) => updatePayment(pm.id, e.target.value)}
            />
            <span>**** **** **** {pm.last4}</span>
          </div>
        ))}
        <div className="flex space-x-2">
          <input
            type="text"
            className="border p-2 rounded flex-1"
            placeholder="Card number"
            value={newCard}
            onChange={(e) => setNewCard(e.target.value)}
          />
          <button
            className="bg-[#6B1E3A] text-white px-4 py-2 rounded"
            onClick={addPayment}
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}