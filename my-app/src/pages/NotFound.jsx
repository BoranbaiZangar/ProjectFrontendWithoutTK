import React from "react";
import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>404</h1>
      <h2>Страница не найдена</h2>
      <p>Проверь адрес или вернись на главную.</p>
      <Link to="/">← На главную</Link>
    </div>
  );
};

export default NotFound;
