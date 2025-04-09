import React from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

const HomePage = () => {
  const { user } = useSelector((state) => state.auth);

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>Добро пожаловать в Lamborjeimyn !</h1>
      <p>Онлайн-сервис по заказу еды. Выбирай ресторан, заказывай, наслаждайся 🍕🍣🥗</p>

      {!user ? (
        <>
          <Link to="/login" style={{ marginRight: "1rem" }}>Войти</Link>
          <Link to="/register">Зарегистрироваться</Link>
        </>
      ) : (
        <>
          <h2>Привет, {user.name}!</h2>
          <Link to="/restaurants" style={{ marginRight: "1rem" }}>Посмотреть рестораны</Link>
          {/* <Link to="/orders">Мои заказы</Link> */}
        </>
      )}
    </div>
  );
};

export default HomePage;
