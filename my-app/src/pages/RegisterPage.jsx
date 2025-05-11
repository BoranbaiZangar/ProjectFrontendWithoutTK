import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { register } from "../redux/auth";
import { useNavigate, Link } from "react-router-dom"; // Import Link
import md5 from "md5";
import { addToast } from "../redux/toast";

const RegisterPage = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    role: "user",
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

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

    dispatch(addToast({ message: "Attempting registration...", type: "default" }));

    await dispatch(register(formData));

    if (!error) {
      dispatch(addToast({ message: "Registration successful! Please log in.", type: "success" }));
      navigate("/login");
    } else {
      dispatch(addToast({ message: error || "Registration failed.", type: "error" }));
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
          type="email"
          required
        />
        <input
          name="phone"
          value={form.phone}
          onChange={(e) => {
            const value = e.target.value;
            const numericValue = value.replace(/[^0-9]/g, '');
            handleChange({ target: { name: 'phone', value: numericValue } });
          }}
          placeholder="Phone"
          type="tel"
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
          <option value="user">User</option>
          <option value="courier">Courier</option>
          <option value="owner">Restaurant Owner</option>
        </select>
        <button type="submit" disabled={loading}>
          {loading ? "Loading..." : "Register"}
        </button>
        {error && <p style={{ color: "#D81B60" }}>{error}</p>}
      </form>
      <p>
        Already have an account? <Link to="/login">Sign in</Link>
      </p>
    </div>
  );
};

export default RegisterPage;