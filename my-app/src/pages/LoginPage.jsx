import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { login } from "../redux/auth";
import { useNavigate } from "react-router-dom";
import md5 from "md5";
import { addToast } from "../redux/toast";

const LoginPage = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, user } = useSelector((state) => state.auth);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    if (!form.email.includes("@")) {
      dispatch(addToast({ message: "Email must contain '@' symbol.", type: "error" }));
      return false;
    }
    if (form.password.length < 8) {
      dispatch(addToast({ message: "Password must be at least 8 characters long.", type: "error" }));
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const hashedPassword = md5(form.password);
    const formData = { ...form, password: hashedPassword };

    dispatch({ type: "auth/CLEAR_ERROR" });
    await dispatch(login(formData));
  };

  useEffect(() => {
    if (error) {
      dispatch(addToast({ message: error, type: "error" }));
    } else if (user) {
      dispatch(addToast({ message: "Login successful!", type: "success" }));
      setTimeout(() => {
        navigate("/");
      }, 1000);
    }
  }, [error, user, dispatch, navigate]);

  return (
    <div className="container">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="Email (e.g., user@example.com)"
          type="email"
          title="Email must contain '@' symbol"
          required
        />
        <input
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          placeholder="Password (min 8 characters)"
          title="Password must be at least 8 characters"
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? "Loading..." : "Login"}
        </button>
      </form>
    </div>
  );
};

export default LoginPage;