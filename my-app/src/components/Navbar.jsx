import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../redux/auth";
import SearchBar from "./SearchBar";
import "../css/styles.css";

export default function Navbar() {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const handleSearch = (q) => {
    console.log("Search query:", q);
  };

  const handleSetAddress = () => {
    console.log("Set delivery address");
  };

  return (
    <nav className="navbar">
      {/* Logo */}
      <Link to="/" className="navbar-logo">
        Lamborjeimyn
      </Link>

      {/* Search */}
      <SearchBar onSearch={handleSearch} />

      {/* Auth controls */}
      <div className="navbar-auth">
        {user ? (
          <>
            <span className="navbar-user">Hello, {user.name}</span>
            <Link to="/profile" className="navbar-btn">
              Profile
            </Link>
            {/* Кнопка для страницы Orders (доступна для user и admin) */}
            {(user.role !=="admin","owner" ) && (
              <Link to="/orders" className="navbar-btn">
                Orders
              </Link>
            )}
            {/* Кнопка для страницы Owner Dashboard (доступна для owner) */}
            {user.role === "owner" && (
              <Link to="/owner" className="navbar-btn">
                Owner Dashboard
              </Link>
            )}
            {/* Кнопка для страницы Admin Panel (доступна для admin) */}
            {user.role === "admin" && (
              <Link to="/admin" className="navbar-btn">
                Admin Panel
              </Link>
            )}
            <button onClick={handleLogout} className="navbar-btn">
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="navbar-btn navbar-btn--primary">
              Log In
            </Link>
            <Link to="/register" className="navbar-btn">
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}