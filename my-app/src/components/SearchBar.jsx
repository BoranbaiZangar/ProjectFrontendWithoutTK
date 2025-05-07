import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    navigate(`/search?query=${encodeURIComponent(q)}`);
  };

  const styles = {
    form: {
      display: "flex",
      alignItems: "center",
      maxWidth: 600,
      margin: "0 auto",
      background: "#fff",
      padding: 20,
      borderRadius: 30,
      boxShadow: "0 6px 25px rgba(0,0,0,0.1)",
      transform: "rotate(-1deg)",
    },
    input: {
      flex: 1,
      padding: "12px 20px",
      border: "1px solid rgba(0,0,0,0.1)",
      borderRadius: "30px 0 0 30px",
      fontFamily: '"Times New Roman", Times, serif',
      fontSize: "1rem",
      outline: "none",
      transition: "border-color 0.3s ease, transform 0.3s ease",
    },
    button: {
      background: "linear-gradient(135deg, #6B1E3A 0%, #C0A062 100%)",
      color: "#FFF",
      padding: "12px 30px",
      border: "none",
      borderRadius: "50px",
      fontFamily: "Georgia, serif",
      fontSize: "1rem",
      cursor: "pointer",
      boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
      transition: "transform 0.3s ease, box-shadow 0.3s ease",
      marginLeft: "-1px"  // сглаживаем стык с инпутом
    }
  };

  return (
    <form onSubmit={handleSearch} style={styles.form}>
      <input
        type="text"
        placeholder="Search for restaurant, dish or item"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={styles.input}
        onFocus={e => e.target.style.borderColor = "#C0A062"}
        onBlur={e => e.target.style.borderColor = "rgba(0,0,0,0.1)"}
      />
      <button
        type="submit"
        style={styles.button}
        onMouseEnter={e => {
          e.target.style.transform = "translateY(-3px) rotate(-2deg)";
          e.target.style.boxShadow = "0 6px 20px rgba(0,0,0,0.3)";
        }}
        onMouseLeave={e => {
          e.target.style.transform = "none";
          e.target.style.boxShadow = "0 4px 15px rgba(0,0,0,0.2)";
        }}
      >
        Find
      </button>
    </form>
  );
}
