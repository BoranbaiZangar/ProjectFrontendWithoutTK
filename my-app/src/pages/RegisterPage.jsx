// src/pages/RegisterPage.js
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { register } from "../redux/auth";
import { useNavigate } from "react-router-dom";
import md5 from "md5"; // Импортируем MD5

const RegisterPage = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "Customer",
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth); // Получаем error на верхнем уровне

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // құпиясөзді мд5 арқылы хэшировать ету
    const hashedPassword = md5(form.password);
    const formData = { ...form, password: hashedPassword };

    // ақпараттарды регистрацияға жібереміз крч
    await dispatch(register(formData));

    // ошибкаларға тексереміз
    // егер ошибка болмаса, онда логинге жібереміз
    // егер ошибка болса, онда ештеңе болмайды

    if (!error) {
      navigate("/login");
    }
  };

  return (
    <div className="container">
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Name"
          required
        />
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
        <select name="role" value={form.role} onChange={handleChange}>
          <option value="Customer">I'm Customer</option>
          <option value="Owner">I'm Owner</option>
        </select>
        <button type="submit" disabled={loading}>
          {loading ? "Loading..." : "Register"}
        </button>
        {error && <p style={{ color: "#D81B60" }}>{error}</p>}
      </form>
    </div>
  );
};

export default RegisterPage;