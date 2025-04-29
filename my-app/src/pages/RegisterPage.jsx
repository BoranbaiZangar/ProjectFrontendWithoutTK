import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { register, resetError } from "../redux/auth";
import { useNavigate } from "react-router-dom";
import Notification from "../components/Notification";
import "../css/styles.css";

const RegisterPage = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "Customer",
  });
  const [notification, setNotification] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  useEffect(() => {
    console.log("Redux State:", { loading, error });
  }, [loading, error]);

  useEffect(() => {
    dispatch(resetError());
    setNotification(null);
    setSubmitted(false);
  }, [dispatch]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Submitting form:", form);
    dispatch(resetError());
    await dispatch(register(form));
    setSubmitted(true);
  };

  useEffect(() => {
    if (error) {
      console.log("Error notification triggered:", error);
      setNotification({
        message: error,
        type: "error",
      });
      setSubmitted(false);
    }
  }, [error]);

  useEffect(() => {
    if (submitted && !loading && !error) {
      console.log("Success notification triggered");
      setNotification({
        message: "Registration successful! Redirecting to login...",
        type: "success",
      });
      setTimeout(() => {
        console.log("Navigating to /login");
        setNotification(null);
        setSubmitted(false);
        navigate("/login");
      }, 3000);
    }
  }, [submitted, loading, error, navigate]);

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

export default RegisterPage;