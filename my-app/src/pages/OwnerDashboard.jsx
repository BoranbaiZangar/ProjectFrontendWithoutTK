// src/pages/OwnerDashboard.js
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";

const DEFAULT_IMAGE =
  "https://sovyatka.ru/800/600/http/chuonggoi.net/wp-content/uploads/2018/05/bi-quyet-kinh-doanh-nha-hang.jpg";

const AVAILABLE_CATEGORIES = [
  "Burger",
  "Doner",
  "Sushi",
  "Pizza",
  "Wok",
  "Pasta",
];

const OwnerDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [restaurant, setRestaurant] = useState(null);

  const [form, setForm] = useState({
    name: "",
    description: "",
    imageUrl: "",
    categories: [],
  });

  const [newDish, setNewDish] = useState({ name: "", price: "" });
  const [editDish, setEditDish] = useState(null);
  const [editDescription, setEditDescription] = useState(false);
  const [editName, setEditName] = useState(false);

  // Fetch existing restaurant (if any)
  useEffect(() => {
    async function fetchRestaurant() {
      const res = await fetch(
        `http://localhost:5000/restaurants?ownerId=${user.id}`
      );
      const data = await res.json();
      if (data.length > 0) {
        const r = data[0];
        setRestaurant(r);
        setForm({
          name: r.name,
          description: r.description,
          imageUrl: r.imageUrl || "",
          categories: r.categories || [],
        });
      }
    }
    fetchRestaurant();
  }, [user.id]);

  // Generic form change
  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  // Toggle category checkbox
  const handleCategoryToggle = (cat) => {
    setForm((f) => {
      const has = f.categories.includes(cat);
      return {
        ...f,
        categories: has
          ? f.categories.filter((c) => c !== cat)
          : [...f.categories, cat],
      };
    });
  };

  // Create or update restaurant
  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...restaurant,
      ownerId: user.id,
      name: form.name,
      description: form.description,
      imageUrl: form.imageUrl.trim() || DEFAULT_IMAGE,
      categories: form.categories,
      dishes: restaurant?.dishes || [],
    };

    const url = restaurant
      ? `http://localhost:5000/restaurants/${restaurant.id}`
      : "http://localhost:5000/restaurants";
    const method = restaurant ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const updated = await res.json();
    setRestaurant(updated);
    setEditName(false);
  };

  const updateRestaurant = async (updatedRestaurant) => {
    await fetch(
      `http://localhost:5000/restaurants/${updatedRestaurant.id}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedRestaurant),
      }
    );
    setRestaurant(updatedRestaurant);
  };

  // Dish handlers (unchanged)
  const handleAddDish = async () => {
    if (!newDish.name || !newDish.price) return;
    const updatedDishes = [
      ...(restaurant.dishes || []),
      { id: Date.now(), name: newDish.name, price: parseFloat(newDish.price) },
    ];
    const updatedRestaurant = { ...restaurant, dishes: updatedDishes };
    await updateRestaurant(updatedRestaurant);
    setNewDish({ name: "", price: "" });
  };

  const handleDeleteDish = async (dishId) => {
    const updated = restaurant.dishes.filter((d) => d.id !== dishId);
    await updateRestaurant({ ...restaurant, dishes: updated });
  };

  const handleEditDish = (dish) => setEditDish({ ...dish });

  const handleSaveDish = async () => {
    const updatedDishes = restaurant.dishes.map((d) =>
      d.id === editDish.id ? editDish : d
    );
    await updateRestaurant({ ...restaurant, dishes: updatedDishes });
    setEditDish(null);
  };

  const handleSaveDescription = async () => {
    await updateRestaurant({
      ...restaurant,
      description: form.description,
    });
    setEditDescription(false);
  };

  return (
    <div className="restaurant-detail">
      <h2 className="restaurant-title">Restaurant Owner Dashboard</h2>

      <form onSubmit={handleSubmit}>
        {/* --- Name --- */}
        {editName ? (
          <div className="input-wrapper">
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Restaurant Name"
              required
            />
            <div style={{ marginTop: 10, display: "flex", gap: 10 }}>
              <button type="submit">Save Name</button>
              <button
                type="button"
                className="delete-button"
                onClick={() => {
                  setEditName(false);
                  setForm((f) => ({ ...f, name: restaurant.name }));
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div style={{ marginBottom: 20 }}>
            <h3>{form.name || "Untitled Restaurant"}</h3>
            <button type="button" onClick={() => setEditName(true)}>
              Edit Name
            </button>
          </div>
        )}

        {/* --- Description --- */}
        {editDescription ? (
          <div className="input-wrapper">
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Description"
              required
            />
            <div style={{ marginTop: 10, display: "flex", gap: 10 }}>
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

        {/* --- Image URL --- */}
        <div className="input-wrapper">
          <label htmlFor="imageUrl">Image URL</label>
          <input
            id="imageUrl"
            name="imageUrl"
            type="url"
            value={form.imageUrl}
            onChange={handleChange}
            placeholder="https://example.com/photo.jpg"
          />
          <small>Leave blank to use default image.</small>
        </div>

        {/* --- Categories --- */}
        <fieldset style={{ margin: "1rem 0" }}>
          <legend>Categories</legend>
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            {AVAILABLE_CATEGORIES.map((cat) => (
              <label key={cat} style={{ cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={form.categories.includes(cat)}
                  onChange={() => handleCategoryToggle(cat)}
                />{" "}
                {cat}
              </label>
            ))}
          </div>
        </fieldset>

        {/* --- Create or Update --- */}
        {!restaurant || editName ? (
          <button type="submit">
            {restaurant ? "Update Restaurant" : "Create Restaurant"}
          </button>
        ) : null}
      </form>

      {/* --- Dishes Section (unchanged) --- */}
      {restaurant && (
        <>
          <h3 className="menu-title">Dishes</h3>
          <ul className="dishes-list">
            {restaurant.dishes?.map((dish) => (
              <li key={dish.id}>
                {editDish?.id === dish.id ? (
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <input
                      value={editDish.name}
                      onChange={(e) =>
                        setEditDish((d) => ({ ...d, name: e.target.value }))
                      }
                    />
                    <input
                      type="number"
                      value={editDish.price}
                      onChange={(e) =>
                        setEditDish((d) => ({
                          ...d,
                          price: parseFloat(e.target.value),
                        }))
                      }
                      style={{ width: 100 }}
                    />
                    <button onClick={handleSaveDish}>Save</button>
                    <button onClick={() => setEditDish(null)}>Cancel</button>
                  </div>
                ) : (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span>
                      <strong>{dish.name}</strong> — ₸{dish.price}
                    </span>
                    <div style={{ display: "flex", gap: 10 }}>
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
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <div className="input-wrapper">
              <input
                placeholder="Name"
                value={newDish.name}
                onChange={(e) =>
                  setNewDish((d) => ({ ...d, name: e.target.value }))
                }
              />
              <label>Name</label>
            </div>
            <div className="input-wrapper">
              <input
                type="number"
                placeholder="Price"
                value={newDish.price}
                onChange={(e) =>
                  setNewDish((d) => ({ ...d, price: e.target.value }))
                }
                style={{ width: 100 }}
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
