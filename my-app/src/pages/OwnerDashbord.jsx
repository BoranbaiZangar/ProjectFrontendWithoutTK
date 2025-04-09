import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const OwnerDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [restaurant, setRestaurant] = useState(null);
  const [form, setForm] = useState({ name: "", description: "" });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRestaurant = async () => {
      const res = await fetch(`http://localhost:5000/restaurants?ownerId=${user.id}`);
      const data = await res.json();
      if (data.length > 0) {
        setRestaurant(data[0]);
        setForm({ name: data[0].name, description: data[0].description });
      }
    };
    fetchRestaurant();
  }, [user]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newRestaurant = {
      ...restaurant,
      ownerId: user.id,
      name: form.name,
      description: form.description,
      dishes: restaurant?.dishes || [],
    };

    if (restaurant) {
      // Обновляем
      await fetch(`http://localhost:5000/restaurants/${restaurant.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newRestaurant),
      });
    } else {
      // Создаём новый
      await fetch("http://localhost:5000/restaurants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newRestaurant),
      });
    }

    navigate("/my-restaurant");
  };

  return (
    <div>
      <h2>{restaurant ? "Редактировать ресторан" : "Создать ресторан"}</h2>
      <form onSubmit={handleSubmit}>
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Название ресторана"
          required
        />
        <br />
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Описание"
          required
        />
        <br />
        <button type="submit">
          {restaurant ? "Сохранить изменения" : "Создать ресторан"}
        </button>
      </form>
    </div>
  );
};

export default OwnerDashboard;
