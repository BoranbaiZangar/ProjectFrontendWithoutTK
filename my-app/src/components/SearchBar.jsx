// src/components/SearchBar.jsx
import React, { useState } from 'react';

export default function SearchBar({ onSearch }) {
  const [value, setValue] = useState('');

  const handleClick = () => {
    if (onSearch) onSearch(value);
    // или пока просто console.log:
    console.log('Search:', value);
  };

  return (
    <div className="search-bar">
      <input
        type="text"
        className="search-input"
        placeholder="Search…"
        value={value}
        onChange={e => setValue(e.target.value)}
      />
      <button className="search-btn" onClick={handleClick}>
        Find
      </button>
    </div>
  );
}
