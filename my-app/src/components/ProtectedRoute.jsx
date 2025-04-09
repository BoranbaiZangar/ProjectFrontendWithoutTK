// src/components/ProtectedRoute.js
import React from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, roles = [] }) => {
  const { user, token } = useSelector((state) => state.auth);

  // Если пользователь не залогинен — редирект на /login
  if (!token || !user) {
    return <Navigate to="/login" />;
  }

  // Если роли указаны и у пользователя другой доступ — редирект на главную
  if (roles.length > 0 && !roles.includes(user.role)) {
    return <Navigate to="/" />;
  }

  // Доступ разрешён — рендерим дочерний компонент
  return children;
};

export default ProtectedRoute;
