// src/components/Navbar.js
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../redux/auth";

const Navbar = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <nav style={{ padding: "1rem", borderBottom: "1px solid #ccc", marginBottom: "1rem" }}>
      <Link to="/" style={{ marginRight: "1rem", fontWeight: "bold" }}>
        LAMBORJEIMYN
      </Link>

      <Link to="/restaurants" style={{ marginRight: "1rem" }}>
        Рестораны
      </Link>

      {(user?.role === "Customer" || user?.role === "Admin") && (
  <Link to="/orders" style={{ marginRight: "1rem" }}>
    Заказы
  </Link>
)}


      {user?.role === "Owner" && (
        <Link to="/owner" style={{ marginRight: "1rem" }}>
          Управление рестораном
        </Link>
      )}

      {user?.role === "Admin" && (
        <Link to="/admin" style={{ marginRight: "1rem" }}>
          Админ-панель
        </Link>
      )}

      <span style={{ float: "right" }}>
        {user ? (
          <>
            <span style={{ marginRight: "1rem" }}>Привет, {user.name}</span>
            <button onClick={handleLogout}>Выйти</button>
          </>
        ) : (
          <>
            <Link to="/login" style={{ marginRight: "1rem" }}>
              Войти
            </Link>
            <Link to="/register">Зарегистрироваться</Link>
          </>
        )}
      </span>
    </nav>
  );
};

export default Navbar;
