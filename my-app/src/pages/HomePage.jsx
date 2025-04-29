import React, { useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

const CATEGORIES = [
  "All",
  "Pickup",
  "Burgers",
  "Sushi",
  "Pizza",
  "Wok",
  "Pasta",
  "Breakfasts",
  "More",
];

const HomePage = () => {
  const { user } = useSelector((state) => state.auth);
  const [selected, setSelected] = useState("All");

  // placeholder for restaurants; replace with data fetching
  const restaurants = Array.from({ length: 6 }).map((_, i) => ({ id: i }));

  return (
    <div
      className="container"
      style={{
        padding: "2rem 1rem",
        display: "flex",
        flexDirection: "column",
        gap: "2rem",
      }}
    >
     

      {/* Category Tabs */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "0.75rem",
          padding: "0.5rem",
          background: "#f5f5f5",
          borderRadius: "12px",
        }}
      >
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelected(cat)}
            style={{
              padding: "0.5rem 1rem",
              border: "none",
              borderRadius: cat === "All" ? "12px" : "8px",
              background: selected === cat ? "#3E2A1D" : "transparent",
              color: selected === cat ? "#fff" : "#333",
              cursor: "pointer",
            }}
          >
            {cat}
            {cat === "More" && " ▼"}
          </button>
        ))}
      </div>

      {/* Auth / Browse Actions */}
      <div style={{ display: "flex", gap: "1rem" }}>
        {!user ? (
          <>
          
          </>
        ) : (
          <>
            <Link to="/restaurants" className="button">
              Browse Restaurants
            </Link>
            <Link to="/orders" className="button">
              My Orders
            </Link>
          </>
        )}
      </div>

      {/* Restaurants Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "1.5rem",
        }}
      >
        {restaurants.map((r) => (
          <div
            key={r.id}
            style={{
              height: "200px",
              border: "1px solid #ddd",
              borderRadius: "12px",
              background: "#fff",
            }}
          >
            {/* TODO: RestaurantCard component here */}
          </div>
        ))}
      </div>
    </div>
  );
};

export default HomePage;