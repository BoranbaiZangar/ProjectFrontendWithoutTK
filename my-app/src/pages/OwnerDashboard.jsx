// src/pages/OwnerDashboard.js
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";

const OwnerDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [restaurant, setRestaurant] = useState(null);
  const [form, setForm] = useState({ name: "", description: "" });
  const [newDish, setNewDish] = useState({ name: "", price: "" });

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
    const restaurantData = {
      ...restaurant,
      ownerId: user.id,
      name: form.name,
      description: form.description,
      dishes: restaurant?.dishes || [],
    };

    const url = restaurant
      ? `http://localhost:5000/restaurants/${restaurant.id}`
      : "http://localhost:5000/restaurants";
    const method = restaurant ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(restaurantData),
    });

    const updated = await res.json();
    setRestaurant(updated);
  };

  const handleAddDish = async () => {
    if (!newDish.name || !newDish.price) return;

    const updatedDishes = [
      ...(restaurant.dishes || []),
      {
        id: Date.now(),
        name: newDish.name,
        price: parseFloat(newDish.price),
      },
    ];

    const updatedRestaurant = { ...restaurant, dishes: updatedDishes };

    await fetch(`http://localhost:5000/restaurants/${restaurant.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedRestaurant),
    });

    setRestaurant(updatedRestaurant);
    setNewDish({ name: "", price: "" });
  };

  const handleDeleteDish = async (dishId) => {
    const updatedDishes = restaurant.dishes.filter((d) => d.id !== dishId);
    const updatedRestaurant = { ...restaurant, dishes: updatedDishes };

    await fetch(`http://localhost:5000/restaurants/${restaurant.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedRestaurant),
    });

    setRestaurant(updatedRestaurant);
  };

  return (
    <div style={{ maxWidth: "700px", margin: "0 auto" }}>
      <h2 style={{ marginBottom: "1rem" }}>Панель владельца ресторана</h2>

      <form onSubmit={handleSubmit} style={{ marginBottom: "2rem" }}>
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Название ресторана"
          required
          style={{ display: "block", width: "100%", marginBottom: "0.5rem", padding: "0.5rem" }}
        />
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Описание"
          required
          style={{ display: "block", width: "100%", marginBottom: "0.5rem", padding: "0.5rem" }}
        />
        <button
          type="submit"
          style={{
            padding: "0.5rem 1rem",
            backgroundColor: "#2ecc71",
            color: "#fff",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          {restaurant ? "Сохранить" : "Создать ресторан"}
        </button>
      </form>

      {restaurant && (
        <>
          <h3>Блюда</h3>
          <ul style={{ padding: 0, listStyle: "none" }}>
            {restaurant.dishes?.map((dish) => (
              <li
                key={dish.id}
                style={{
                  border: "1px solid #ccc",
                  padding: "0.5rem",
                  marginBottom: "0.5rem",
                  borderRadius: "5px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span>
                  <strong>{dish.name}</strong> — ${dish.price}
                </span>
                <button
                  onClick={() => handleDeleteDish(dish.id)}
                  style={{
                    padding: "0.25rem 0.5rem",
                    backgroundColor: "#e74c3c",
                    color: "#fff",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  Удалить
                </button>
              </li>
            ))}
          </ul>

          <h4>Добавить блюдо</h4>
          <input
            placeholder="Название"
            value={newDish.name}
            onChange={(e) => setNewDish({ ...newDish, name: e.target.value })}
            style={{ marginRight: "0.5rem", padding: "0.5rem" }}
          />
          <input
            type="number"
            placeholder="Цена"
            value={newDish.price}
            onChange={(e) => setNewDish({ ...newDish, price: e.target.value })}
            style={{ marginRight: "0.5rem", padding: "0.5rem", width: "100px" }}
          />
          <button
            onClick={handleAddDish}
            style={{
              padding: "0.5rem 1rem",
              backgroundColor: "#3498db",
              color: "#fff",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Добавить
          </button>
        </>
      )}
    </div>
  );
};

export default OwnerDashboard;
