import React from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

const HomePage = () => {
  const { user } = useSelector((state) => state.auth);

  return (
    <div className="container" style={{ 
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      textAlign: "center"
    }}>
      <h1 style={{ 
        fontSize: "2.5rem",
        marginBottom: "1.5rem",
        borderBottom: "none",
        display: "flex",
        alignItems: "center",
        gap: "0.5rem"
      }}>
    <span>Welcome to</span>
    <span style={{ color: "#3E2A1D" }}>Lamborjeimyn!</span>
  </h1>
      <p style={{ 
        fontSize: "1.2rem",
        color: "#666",
        maxWidth: "600px",
        marginBottom: "2rem"
      }}>
        Online food ordering service. Choose a restaurant, place your order, and enjoy! 
      </p>

      {!user ? (
        <div style={{ display: "flex", gap: "1rem" }}>
          <Link to="/login" className="button">
            Log In
          </Link>
          <Link to="/register" className="button">
            Sign Up
          </Link>
        </div>
      ) : (
        <>
          <h2 style={{ 
            fontSize: "1.8rem",
            color: "#FFCA28",
            marginBottom: "1.5rem"
          }}>
            Hello, {user.name}!
          </h2>
          <div style={{ display: "flex", gap: "1rem" , color: "#666", }}>
            <Link to="/restaurants" className="button">
              Browse Restaurants
            </Link>
            <Link to="/orders" className="button">
              My Orders
            </Link>
          </div>
        </>
      )}
    </div>
  );
};

export default HomePage;