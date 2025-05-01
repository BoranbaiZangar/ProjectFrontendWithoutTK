
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../redux/auth";
import SearchBar from "./SearchBar";
import "../css/styles.css";

export default function Navbar() {
  const authState = useSelector((state) => state.auth);
  const user = authState.user;
  const dispatch = useDispatch();
  const navigate = useNavigate();

  function handleLogout() {
    dispatch(logout());
    navigate("/login");
  }

  function handleSearch(query) {
    // Реализуйте логику перенаправления или фильтрации
    console.log("Search query:", query);
  }

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-logo">
        Lamborjeimyn
      </Link>

      <SearchBar onSearch={handleSearch} />

      <div className="navbar-auth">
        {user ? (
          <>
            <span className="navbar-user">Hello, {user.name}</span>
            <Link to="/profile" className="navbar-btn">
              Profile
            </Link>
            {user.role === "user" && (
              <Link to="/cart" className="navbar-btn">
              Cart
            </Link>
            )}
            
            {(user.role === "user" || user.role === "admin" || user.role === "moderator" || user.role === "courier") && (
              <Link to="/orders" className="navbar-btn">
                Orders
              </Link>
            )}
            {user.role === "owner" && (
              <Link to="/owner" className="navbar-btn">
                Owner Dashboard
              </Link>
            )}
            {user.role === "admin" && (
              <Link to="/admin" className="navbar-btn">
                Admin Panel
              </Link>
            )}
            {user.role === "admin" && (
              <Link to="/admin-stats" className="navbar-btn">
                Admin Stats
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
