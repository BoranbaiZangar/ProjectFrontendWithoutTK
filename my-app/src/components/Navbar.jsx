import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../redux/auth";
import SearchBar from "./SearchBar";
import "../css/styles.css";  // make sure you define .navbar, .navbar-logo, .navbar-address, etc.

export default function Navbar() {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const handleSearch = (q) => {
    // TODO: wire up your real search
    console.log("Search query:", q);
  };

  const handleSetAddress = () => {
    // TODO: open address picker/modal
    console.log("Set delivery address");
  };

  return (
    <nav className="navbar">
      {/* Logo */}
      <Link to="/" className="navbar-logo">
        {/* optionally replace with <LogoIcon /> */}
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
            <button onClick={handleLogout} className="navbar-btn">
              Logout
            </button>
          </>
        ) : (
          <Link to="/login" className="navbar-btn navbar-btn--primary">
            Log In
          </Link>
        )}
      </div>
    </nav>
  );
}
