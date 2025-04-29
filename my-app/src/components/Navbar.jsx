// src/components/Navbar.jsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../redux/auth";
import SearchBar from "./SearchBar";
import "../css/styles.css"; 

export default function Navbar() {
  const { user } = useSelector(state => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  // Заглушка для onSearch — потом сюда будете подставлять реальную логику
  const onSearch = query => {
    console.log('Searching for:', query);
  };

  return (
    <nav className="navbar">
   
      <Link to="/" className="navbar-logo">Lamborjeimyn</Link>

      {/* Вот наш вынесенный компонент */}
      <SearchBar onSearch={onSearch} />
 
      <div className="navbar-actions">
        {user ? (
          <>
            <span className="navbar-user">Hello, {user.name}</span>
            <Link to="/profile" className="navbar-btn">Profile</Link>
            <button onClick={handleLogout} className="navbar-btn">Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" className="navbar-btn">Login</Link>
            <Link to="/register" className="navbar-btn navbar-btn--primary">
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
