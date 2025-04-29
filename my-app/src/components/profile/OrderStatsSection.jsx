import React from 'react';

export default function OrderStatsSection({ initialStats }) {
  const { allTime = 0, month = 0 } = initialStats || {};

  return (
    <div className="my-6">
      <h2 className="font-serif text-xl text-[#3E2A1D] mb-2">Order Statistics</h2>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h3 className="text-lg font-medium">All Time</h3>
          <p className="text-2xl">${allTime.toFixed(2)}</p>
        </div>
        <div>
          <h3 className="text-lg font-medium">This Month</h3>
          <p className="text-2xl">${month.toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
}