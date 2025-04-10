// src/components/Navbar.js
import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../redux/auth";
import "../css/styles.css"; // Подключаем CSS-файл

const Navbar = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation(); // Получаем текущий URL

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  // Определяем, какую ссылку показывать: "Login" или "Register"
  const isLoginPage = location.pathname === "/login";
  const isRegisterPage = location.pathname === "/register";

  return (
    <nav className="navbar">
      <div className="navbar-links">
        <Link to="/" className="navbar-logo">
          <span style={{ color: "#3E2A1D" }}>Lamborjeimyn</span>
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
            {isLoginPage && (
              <Link to="/register" className="navbar-button">
                Register
              </Link>
            )}
            {isRegisterPage && (
              <Link to="/login" className="navbar-button">
                Login
              </Link>
            )}
            {/* Если пользователь не на странице логина или регистрации, показываем обе ссылки */}
            
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;