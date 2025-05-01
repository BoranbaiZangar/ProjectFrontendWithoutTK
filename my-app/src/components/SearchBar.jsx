import React, { useState } from "react";
import PropTypes from "prop-types";
import "../css/styles.css"; // make sure your styles include .search-bar, .search-input, .search-btn

export default function SearchBar({ onSearch }) {
  const [query, setQuery] = useState("");

  const handleClick = () => {
    if (onSearch) onSearch(query);
  };

  return (
    <div className="search-bar">
      <input
        type="text"
        className="search-input"
        placeholder="Search for restaurant, dish or item"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <button className="search-btn" onClick={handleClick}>
        Find
      </button>
    </div>
  );
}

SearchBar.propTypes = {
  onSearch: PropTypes.func,
};
