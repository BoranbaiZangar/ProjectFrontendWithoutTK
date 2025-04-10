// src/pages/OwnerDashboard.js
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";

const OwnerDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [restaurant, setRestaurant] = useState(null);
  const [form, setForm] = useState({ name: "", description: "" });
  const [newDish, setNewDish] = useState({ name: "", price: "" });
  const [editDish, setEditDish] = useState(null);
  const [editDescription, setEditDescription] = useState(false);
  const [editName, setEditName] = useState(false); // Состояние для редактирования названия

  // Ресторанын мәліметтерін алу
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

  // Формадағы өзгерістерді басқару
  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // Ресторанын сақтау немесе жаңарту
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
    setEditName(false); // Закрываем режим редактирования после сохранения
  };

  // Жаңа тағам қосу
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
    await updateRestaurant(updatedRestaurant);
    setNewDish({ name: "", price: "" });
  };

  // Тағамды жою
  const handleDeleteDish = async (dishId) => {
    const updatedDishes = restaurant.dishes.filter((d) => d.id !== dishId);
    const updatedRestaurant = { ...restaurant, dishes: updatedDishes };
    await updateRestaurant(updatedRestaurant);
  };

  // Тағамды редакциялауды бастау
  const handleEditDish = (dish) => {
    setEditDish({ ...dish });
  };

  // Тағамды редакциялауды сақтау
  const handleSaveDish = async () => {
    const updatedDishes = restaurant.dishes.map((d) =>
      d.id === editDish.id ? editDish : d
    );
    const updatedRestaurant = { ...restaurant, dishes: updatedDishes };
    await updateRestaurant(updatedRestaurant);
    setEditDish(null);
  };

  // Сипаттаманы сақтау
  const handleSaveDescription = async () => {
    const updatedRestaurant = { ...restaurant, description: form.description };
    await updateRestaurant(updatedRestaurant);
    setEditDescription(false);
  };

  // Ресторанын жаңарту функциясы
  const updateRestaurant = async (updatedRestaurant) => {
    await fetch(`http://localhost:5000/restaurants/${restaurant.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedRestaurant),
    });
    setRestaurant(updatedRestaurant);
  };

  return (
    <div className="restaurant-detail">
      <h2 className="restaurant-title">Restaurant Owner Dashboard</h2>

      <form onSubmit={handleSubmit}>
        {editName ? (
          <div className="input-wrapper">
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Restaurant Name"
              required
            />
            <label>Restaurant Name</label>
            <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
              <button type="submit">Update Restaurant</button>
              <button
                type="button"
                className="delete-button"
                onClick={() => {
                  setEditName(false);
                  setForm({ ...form, name: restaurant.name }); // Восстановить исходное название
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div style={{ marginBottom: "20px" }}>
            <h3>{form.name}</h3>
            <button
              type="button"
              onClick={() => setEditName(true)}
            >
              Edit Name
            </button>
          </div>
        )}

        {editDescription ? (
          <div className="input-wrapper">
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Description"
              required
            />
            <label>Description</label>
            <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
              <button type="button" onClick={handleSaveDescription}>
                Save Description
              </button>
              <button
                type="button"
                className="delete-button"
                onClick={() => setEditDescription(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="restaurant-description">
            <p>{form.description || "No description yet"}</p>
            <button type="button" onClick={() => setEditDescription(true)}>
              Edit Description
            </button>
          </div>
        )}

        {!editName && !restaurant && (
          <button type="submit">Create Restaurant</button>
        )}
      </form>

      {restaurant && (
        <>
          <h3 className="menu-title">Dishes</h3>
          <ul className="dishes-list">
            {restaurant.dishes?.map((dish) => (
              <li key={dish.id}>
                {editDish && editDish.id === dish.id ? (
                  <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                    <input
                      value={editDish.name}
                      onChange={(e) => setEditDish({ ...editDish, name: e.target.value })}
                    />
                    <input
                      type="number"
                      value={editDish.price}
                      onChange={(e) =>
                        setEditDish({ ...editDish, price: parseFloat(e.target.value) })
                      }
                      style={{ width: "100px" }}
                    />
                    <button onClick={handleSaveDish}>Save</button>
                    <button
                      className="delete-button"
                      onClick={() => setEditDish(null)}
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span>
                      <strong>{dish.name}</strong> — ₸{dish.price}
                    </span>
                    <div style={{ display: "flex", gap: "10px" }}>
                      <button onClick={() => handleEditDish(dish)}>Edit</button>
                      <button
                        className="delete-button"
                        onClick={() => handleDeleteDish(dish.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>

          <h4 className="menu-title">Add Dish</h4>
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <div className="input-wrapper">
              <input
                placeholder="Name"
                value={newDish.name}
                onChange={(e) => setNewDish({ ...newDish, name: e.target.value })}
              />
              <label>Name</label>
            </div>
            <div className="input-wrapper">
              <input
                type="number"
                placeholder="Price"
                value={newDish.price}
                onChange={(e) => setNewDish({ ...newDish, price: e.target.value })}
                style={{ width: "100px" }}
              />
              <label>Price</label>
            </div>
            <button onClick={handleAddDish}>Add</button>
          </div>
        </>
      )}
    </div>
  );
};

export default OwnerDashboard;