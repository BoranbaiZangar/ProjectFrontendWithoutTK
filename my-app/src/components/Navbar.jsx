// src/components/Navbar.js
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../redux/auth";
import "../css/styles.css"; // Подключаем CSS-файл (проверьте путь)

const Navbar = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="navbar-links">
        <Link to="/" className="navbar-logo">
        <span style={{ color: "#1abc9c" }}>Lamborjeimyn</span>
        </Link>

        <Link to="/restaurants" className="navbar-link">
          Restaurants
        </Link>

        {(user?.role === "Customer" || user?.role === "Admin") && (
          <Link to="/orders" className="navbar-link">
            Orders
          </Link>
        )}

        {user?.role === "Owner" && (
          <Link to="/owner" className="navbar-link">
            Restaurant Management
          </Link>
        )}

        {user?.role === "Admin" && (
          <Link to="/admin" className="navbar-link">
            Admin Panel
          </Link>
        )}
      </div>

      <div className="navbar-auth">
        {user ? (
          <>
            <span className="navbar-user">Hello, {user.name}</span>
            <button onClick={handleLogout} className="navbar-button">
              Logout
            </button>
          </>
        ) : (
          <>
           
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;