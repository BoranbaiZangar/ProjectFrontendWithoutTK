import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { addToast } from "../redux/toast";
import "../css/styles.css";

const DEFAULT_AVATAR_URL = "https://static.wixstatic.com/media/35cf67_26f8bcd18f81440a93d08a0ece05c806~mv2.jpg/v1/fit/w_502,h_282,q_90,enc_avif,quality_auto/35cf67_26f8bcd18f81440a93d08a0ece05c806~mv2.jpg";

const OwnerDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [restaurant, setRestaurant] = useState(null);
  const [form, setForm] = useState({ name: "", address: "", description: "", avatar_url: "" });
  const [newDish, setNewDish] = useState({ name: "", price: "" });
  const [editDish, setEditDish] = useState(null);
  const [editName, setEditName] = useState(false);
  const [editAddress, setEditAddress] = useState(false);
  const [editDescription, setEditDescription] = useState(false);
  const [editAvatar, setEditAvatar] = useState(false);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const handleSetInactive = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/restaurants/${restaurant.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...restaurant, status: "inactive" }),
      });
      if (!res.ok) throw new Error();
      const updated = await res.json();
      setRestaurant(updated);
      dispatch(addToast({ message: "Status changed to Inactive", type: "success" }));
    } catch (err) {
      dispatch(addToast({ message: "Failed to deactivate restaurant", type: "error" }));
    } finally {
      setLoading(false);
    }
  };

  const handleSetActive = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/restaurants/${restaurant.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...restaurant, status: "active" }),
      });
      if (!res.ok) throw new Error();
      const updated = await res.json();
      setRestaurant(updated);
      dispatch(addToast({ message: "Status changed to Active", type: "success" }));
    } catch (err) {
      dispatch(addToast({ message: "Failed to activate restaurant", type: "error" }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchRestaurant = async () => {
      try {
        const res = await fetch(`http://localhost:5000/restaurants?owner_id=${user.id}`);
        const data = await res.json();
        if (data.length > 0) {
          setRestaurant(data[0]);
          setForm({
            name: data[0].name,
            address: data[0].address,
            description: data[0].description,
            avatar_url: data[0].avatar_url || "",
          });
        }
      } catch (error) {
        dispatch(addToast({ message: "Failed to load restaurant data.", type: "error" }));
      }
    };
    if (user) {
      fetchRestaurant();
    }
  }, [user, dispatch]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const restaurantData = {
      ...restaurant,
      owner_id: user.id,
      name: form.name,
      address: form.address,
      description: form.description,
      avatar_url: form.avatar_url || "",
      status: restaurant ? restaurant.status : "pending",
      dishes: restaurant?.dishes || [],
    };

    const isCreating = !restaurant;
    const url = isCreating
      ? "http://localhost:5000/restaurants"
      : `http://localhost:5000/restaurants/${restaurant.id}`;
    const method = isCreating ? "POST" : "PUT";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(restaurantData),
      });

      if (!res.ok) throw new Error("Failed to save restaurant.");

      const updated = await res.json();
      setRestaurant(updated);
      setEditName(false);
      setEditAddress(false);
      setEditAvatar(false);
      dispatch(
        addToast({
          message: isCreating ? "Restaurant created successfully!" : "Restaurant updated successfully!",
          type: "success",
        })
      );

      if (isCreating) {
        await fetch("http://localhost:5000/restaurant_owners", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: user.id,
            restaurant_id: updated.id,
          }),
        });
      }
    } catch (error) {
      dispatch(addToast({ message: "Failed to save restaurant.", type: "error" }));
    } finally {
      setLoading(false);
    }
  };

  const handleAddDish = async () => {
    if (!newDish.name || !newDish.price) {
      dispatch(addToast({ message: "Please fill in all dish fields.", type: "error" }));
      return;
    }

    setLoading(true);
    const updatedDishes = [
      ...(restaurant.dishes || []),
      {
        id: Date.now(),
        name: newDish.name,
        price: parseFloat(newDish.price),
      },
    ];

    const updatedRestaurant = { ...restaurant, dishes: updatedDishes };
    try {
      await updateRestaurant(updatedRestaurant);
      setNewDish({ name: "", price: "" });
      dispatch(addToast({ message: "Dish added successfully!", type: "success" }));
    } catch (error) {
      dispatch(addToast({ message: "Failed to add dish.", type: "error" }));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDish = async (dishId) => {
    setLoading(true);
    const updatedDishes = restaurant.dishes.filter((d) => d.id !== dishId);
    const updatedRestaurant = { ...restaurant, dishes: updatedDishes };
    try {
      await updateRestaurant(updatedRestaurant);
      dispatch(addToast({ message: "Dish deleted successfully!", type: "success" }));
    } catch (error) {
      dispatch(addToast({ message: "Failed to delete dish.", type: "error" }));
    } finally {
      setLoading(false);
    }
  };

  const handleEditDish = (dish) => {
    setEditDish({ ...dish });
  };

  const handleSaveDish = async () => {
    setLoading(true);
    const updatedDishes = restaurant.dishes.map((d) =>
      d.id === editDish.id ? editDish : d
    );
    const updatedRestaurant = { ...restaurant, dishes: updatedDishes };
    try {
      await updateRestaurant(updatedRestaurant);
      setEditDish(null);
      dispatch(addToast({ message: "Dish updated successfully!", type: "success" }));
    } catch (error) {
      dispatch(addToast({ message: "Failed to update dish.", type: "error" }));
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDescription = async () => {
    setLoading(true);
    const updatedRestaurant = { ...restaurant, description: form.description };
    try {
      await updateRestaurant(updatedRestaurant);
      setEditDescription(false);
      dispatch(addToast({ message: "Description updated successfully!", type: "success" }));
    } catch (error) {
      dispatch(addToast({ message: "Failed to update description.", type: "error" }));
    } finally {
      setLoading(false);
    }
  };

  const updateRestaurant = async (updatedRestaurant) => {
    const res = await fetch(`http://localhost:5000/restaurants/${restaurant.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedRestaurant),
    });
    if (!res.ok) throw new Error("Failed to update restaurant.");
    setRestaurant(updatedRestaurant);
  };

  return (
    <div className="container">
      <h2>Restaurant Owner Dashboard</h2>

      {!restaurant ? (
        <form onSubmit={handleSubmit} className="restaurant-form">
          <h3>Create Restaurant</h3>
          <div className="input-wrapper">
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Restaurant Name"
              required
            />
            <label>Restaurant Name</label>
          </div>
          <div className="input-wrapper">
            <input
              name="address"
              value={form.address}
              onChange={handleChange}
              placeholder="Restaurant Address"
              required
            />
            <label>Restaurant Address</label>
          </div>
          <div className="input-wrapper">
            <input
              name="avatar_url"
              value={form.avatar_url}
              onChange={handleChange}
              placeholder="Avatar URL (optional)"
            />
            <label>Avatar URL</label>
          </div>
          <div className="input-wrapper">
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Description"
            />
            <label>Description</label>
          </div>
          <button type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create Restaurant"}
          </button>
        </form>
      ) : (
        <>
          <div className="restaurant-section">
            {editAvatar ? (
              <form onSubmit={handleSubmit}>
                <div className="input-wrapper">
                  <input
                    name="avatar_url"
                    value={form.avatar_url}
                    onChange={handleChange}
                    placeholder="Avatar URL"
                  />
                  <label>Avatar URL</label>
                </div>
                <div className="button-group">
                  <button type="submit" disabled={loading}>
                    {loading ? "Updating..." : "Save Avatar"}
                  </button>
                  <button
                    type="button"
                    className="delete-button"
                    onClick={() => {
                      setEditAvatar(false);
                      setForm({ ...form, avatar_url: restaurant.avatar_url || "" });
                    }}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="restaurant-info">
                <div className="avatar-wrapper">
                  <img
                    src={form.avatar_url || DEFAULT_AVATAR_URL}
                    alt="Restaurant Avatar"
                    className="restaurant-avatar"
                  />
                </div>
                <button onClick={() => setEditAvatar(true)} disabled={loading}>
                  Edit Avatar
                </button>
              </div>
            )}
          </div>

          <div className="restaurant-section">
            {editName ? (
              <form onSubmit={handleSubmit}>
                <div className="input-wrapper">
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Restaurant Name"
                    required
                  />
                  <label>Restaurant Name</label>
                </div>
                <div className="button-group">
                  <button type="submit" disabled={loading}>
                    {loading ? "Updating..." : "Save Name"}
                  </button>
                  <button
                    type="button"
                    className="delete-button"
                    onClick={() => {
                      setEditName(false);
                      setForm({ ...form, name: restaurant.name });
                    }}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="restaurant-info">
                <h3>{form.name}</h3>
                <div className="button-group">
                  <button onClick={() => setEditName(true)} disabled={loading}>
                    Edit Name
                  </button>
                  {restaurant.status !== "inactive" ? (
                    <button
                      onClick={handleSetInactive}
                      className="delete-button"
                      disabled={loading}
                    >
                      {loading ? "Setting Inactive..." : "Set Inactive"}
                    </button>
                  ) : (
                    <button
                      onClick={handleSetActive}
                      className="delete-button"
                      disabled={loading}
                    >
                      {loading ? "Setting Active..." : "Set Active"}
                    </button>
                  )}
                </div>
                <p><strong>Status:</strong> {restaurant.status}</p>
              </div>
            )}
          </div>

          <div className="restaurant-section">
            {editAddress ? (
              <form onSubmit={handleSubmit}>
                <div className="input-wrapper">
                  <input
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    placeholder="Restaurant Address"
                    required
                  />
                  <label>Restaurant Address</label>
                </div>
                <div className="button-group">
                  <button type="submit" disabled={loading}>
                    {loading ? "Updating..." : "Save Address"}
                  </button>
                  <button
                    type="button"
                    className="delete-button"
                    onClick={() => {
                      setEditAddress(false);
                      setForm({ ...form, address: restaurant.address });
                    }}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="restaurant-info">
                <p><strong>Address:</strong> {form.address}</p>
                <button onClick={() => setEditAddress(true)} disabled={loading}>
                  Edit Address
                </button>
              </div>
            )}
          </div>

          <div className="restaurant-section">
            {editDescription ? (
              <div className="input-wrapper">
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Description"
                />
                <label>Description</label>
                <div className="button-group">
                  <button onClick={handleSaveDescription} disabled={loading}>
                    {loading ? "Saving..." : "Save Description"}
                  </button>
                  <button
                    type="button"
                    className="delete-button"
                    onClick={() => {
                      setEditDescription(false);
                      setForm({ ...form, description: restaurant.description });
                    }}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="restaurant-info">
                <p><strong>Description:</strong> {form.description || "No description yet"}</p>
                <button onClick={() => setEditDescription(true)} disabled={loading}>
                  Edit Description
                </button>
              </div>
            )}
          </div>

          <div className="restaurant-section">
            <h3>Dishes</h3>
            <ul className="dishes-list">
              {restaurant.dishes?.map((dish) => (
                <li key={dish.id}>
                  {editDish && editDish.id === dish.id ? (
                    <div className="dish-edit-form">
                      <input
                        value={editDish.name}
                        onChange={(e) => setEditDish({ ...editDish, name: e.target.value })}
                        placeholder="Dish Name"
                      />
                      <input
                        type="number"
                        value={editDish.price}
                        onChange={(e) =>
                          setEditDish({ ...editDish, price: parseFloat(e.target.value) })
                        }
                        placeholder="Price"
                        style={{ width: "100px" }}
                      />
                      <div className="button-group">
                        <button onClick={handleSaveDish} disabled={loading}>
                          {loading ? "Saving..." : "Save"}
                        </button>
                        <button
                          className="delete-button"
                          onClick={() => setEditDish(null)}
                          disabled={loading}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="dish-item">
                      <span>
                        <strong>{dish.name}</strong> — ₸{dish.price}
                      </span>
                      <div className="button-group">
                        <button onClick={() => handleEditDish(dish)} disabled={loading}>
                          Edit
                        </button>
                        <button
                          className="delete-button"
                          onClick={() => handleDeleteDish(dish.id)}
                          disabled={loading}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>

            <h4>Add Dish</h4>
            <div className="dish-form">
              <div className="input-wrapper">
                <input
                  placeholder="Dish Name"
                  value={newDish.name}
                  onChange={(e) => setNewDish({ ...newDish, name: e.target.value })}
                />
                <label>Dish Name</label>
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
              <button onClick={handleAddDish} disabled={loading}>
                {loading ? "Adding..." : "Add Dish"}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default OwnerDashboard;