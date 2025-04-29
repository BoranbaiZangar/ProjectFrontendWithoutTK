import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { login, resetError } from "../redux/auth";
import { useNavigate } from "react-router-dom";
import Notification from "../components/Notification";
import "../css/styles.css";

const LoginPage = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [notification, setNotification] = useState(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, user } = useSelector((state) => state.auth);

  // Сбрасываем ошибку и уведомление при монтировании компонента
  useEffect(() => {
    dispatch(resetError());
    setNotification(null);
  }, [dispatch]);

  // Обработка изменений в форме
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Обработка отправки формы
  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(resetError()); // Сбрасываем ошибку перед отправкой
    await dispatch(login(form));
  };

  // Показ уведомлений при ошибке
  useEffect(() => {
    if (error) {
      setNotification({
        message: error,
        type: "error",
      });
    }
  }, [error]);

  // Показ уведомления и перенаправление при успешном логине
  useEffect(() => {
    if (user) {
      setNotification({
        message: "Login successful!",
        type: "success",
      });
      setTimeout(() => {
        navigate("/");
      }, 2000);
    }
  }, [user, navigate]);

  return (
    <div className="container">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="Email"
          required
        />
        <input
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          placeholder="Password"
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? "Loading..." : "Login"}
        </button>
      </form>
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  );
};

export default LoginPage;