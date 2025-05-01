import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import md5 from "md5";
import "../css/styles.css";

const ProfilePage = () => {
  const { user } = useSelector((state) => state.auth);
  const [profileData, setProfileData] = useState(null);
  const [roleSpecificData, setRoleSpecificData] = useState(null);
  const [orders, setOrders] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [newPassword, setNewPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        // Получаем заказы
        const ordersRes = await fetch("http://localhost:5000/orders");
        const ordersData = await ordersRes.json();
        setOrders(ordersData);

        // Получаем рестораны
        const restaurantsRes = await fetch("http://localhost:5000/restaurants");
        const restaurantsData = await restaurantsRes.json();
        setRestaurants(restaurantsData);

        // Получаем данные профиля (avatar_url, address) из user_profiles для всех ролей
        const profileRes = await fetch(`http://localhost:5000/user_profiles?user_id=${user.id}`);
        const profileData = await profileRes.json();
        setProfileData(profileData[0] || {});

        // Получаем дополнительные данные в зависимости от роли
        if (user.role === "courier") {
          const courierRes = await fetch(`http://localhost:5000/couriers?user_id=${user.id}`);
          const courierData = await courierRes.json();
          setRoleSpecificData(courierData[0] || {});
        } else if (user.role === "owner") {
          const ownerRes = await fetch(`http://localhost:5000/restaurant_owners?user_id=${user.id}`);
          const ownerData = await ownerRes.json();
          setRoleSpecificData(ownerData[0] || {});
        } else if (user.role === "moderator") {
          const modRes = await fetch(`http://localhost:5000/moderators?user_id=${user.id}`);
          const modData = await modRes.json();
          setRoleSpecificData(modData[0] || {});
        } else if (user.role === "admin") {
          const adminRes = await fetch(`http://localhost:5000/admins?user_id=${user.id}`);
          const adminData = await adminRes.json();
          setRoleSpecificData(adminData[0] || {});
        }
      } catch (err) {
        console.error("Error fetching profile data:", err);
      }
    };

    if (user) {
      fetchProfileData();
    }
  }, [user]);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters long.");
      return;
    }

    try {
      const hashedPassword = md5(newPassword);
      const res = await fetch(`http://localhost:5000/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: hashedPassword }),
      });

      if (res.ok) {
        setPasswordSuccess("Password updated successfully!");
        setNewPassword("");
      } else {
        setPasswordError("Failed to update password.");
      }
    } catch (err) {
      setPasswordError("An error occurred while updating the password.");
    }
  };

  if (!user) {
    return <div className="container">Please log in to view your profile.</div>;
  }

  // Функции для аналитики
  const getOrdersStats = (orders, userId, roleFilter) => {
    const userOrders = orders.filter((order) => {
      if (roleFilter === "user") return order.user_id === userId;
      if (roleFilter === "courier") return order.courier_id === userId && order.status === "delivered";
      if (roleFilter === "owner") {
        const userRestaurantIds = restaurants
          .filter((r) => r.owner_id === userId)
          .map((r) => r.id);
        return userRestaurantIds.includes(order.restaurant_id);
      }
      return false;
    });

    const today = new Date("2025-05-01"); // Текущая дата из контекста
    const dayOrders = userOrders.filter((order) => {
      const orderDate = new Date(order.created_at);
      return orderDate.toDateString() === today.toDateString();
    });
    const weekOrders = userOrders.filter((order) => {
      const orderDate = new Date(order.created_at);
      return (today - orderDate) / (1000 * 60 * 60 * 24) <= 7;
    });
    const monthOrders = userOrders.filter((order) => {
      const orderDate = new Date(order.created_at);
      return (today - orderDate) / (1000 * 60 * 60 * 24) <= 30;
    });

    const totalSpent = userOrders.reduce((sum, order) => sum + order.total_price, 0);
    const recentOrders = userOrders.slice(-3).reverse();

    return { dayOrders, weekOrders, monthOrders, totalSpent, recentOrders };
  };

  const getFavoriteRestaurant = (orders, userId) => {
    const userOrders = orders.filter((order) => order.user_id === userId);
    const restaurantCounts = userOrders.reduce((acc, order) => {
      acc[order.restaurant_id] = (acc[order.restaurant_id] || 0) + 1;
      return acc;
    }, {});
    const favoriteId = Object.keys(restaurantCounts).reduce((a, b) =>
      restaurantCounts[a] > restaurantCounts[b] ? a : b,
      null
    );
    return restaurants.find((r) => r.id === parseInt(favoriteId))?.name || "None";
  };

  const getAverageOrdersPerDay = (orders, userId, startDate) => {
    const userOrders = orders.filter((order) => order.courier_id === userId && order.status === "delivered");
    const start = new Date(startDate);
    const today = new Date("2025-05-01");
    const days = (today - start) / (1000 * 60 * 60 * 24) || 1; // Избегаем деления на 0
    return (userOrders.length / days).toFixed(2);
  };

  // Рендеринг профиля в зависимости от роли
  const renderProfile = () => {
    if (user.role === "user") {
      const { dayOrders, weekOrders, monthOrders, totalSpent, recentOrders } = getOrdersStats(orders, user.id, "user");
      const favoriteRestaurant = getFavoriteRestaurant(orders, user.id);

      return (
        <div className="profile-section">
          <h3>User Profile</h3>
          <p><strong>Name:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Phone:</strong> {user.phone}</p>
          <p><strong>Registration Date:</strong> {new Date(user.created_at).toLocaleDateString()}</p>
          <p><strong>Default Address:</strong> {profileData?.address || "Not set"}</p>
          <h4>Order Statistics</h4>
          <p><strong>Orders Today:</strong> {dayOrders.length}</p>
          <p><strong>Orders This Week:</strong> {weekOrders.length}</p>
          <p><strong>Orders This Month:</strong> {monthOrders.length}</p>
          <p><strong>Total Spent:</strong> {totalSpent} KZT</p>
          <p><strong>Favorite Restaurant:</strong> {favoriteRestaurant}</p>
          <h4>Last 3 Orders</h4>
          {recentOrders.length > 0 ? (
            <ul>
              {recentOrders.map((order) => (
                <li key={order.id}>
                  Order #{order.id} on {new Date(order.created_at).toLocaleDateString()} - Status: {order.status}
                </li>
              ))}
            </ul>
          ) : (
            <p>No recent orders.</p>
          )}
        </div>
      );
    }

    if (user.role === "courier") {
      const { dayOrders, weekOrders, monthOrders, recentOrders } = getOrdersStats(orders, user.id, "courier");
      const avgOrdersPerDay = getAverageOrdersPerDay(orders, user.id, user.created_at);

      return (
        <div className="profile-section">
          <h3>Courier Profile</h3>
          <p><strong>Name:</strong> {user.name}</p>
          <p><strong>Phone:</strong> {user.phone}</p>
          <p><strong>Vehicle Type:</strong> {roleSpecificData?.vehicle_type || "Not set"}</p>
          <p><strong>Start Date:</strong> {new Date(user.created_at).toLocaleDateString()}</p>
          <p><strong>Availability:</strong> {roleSpecificData?.is_available ? "Available" : "Not Available"}</p>
          <h4>Delivery Statistics</h4>
          <p><strong>Deliveries Today:</strong> {dayOrders.length}</p>
          <p><strong>Deliveries This Week:</strong> {weekOrders.length}</p>
          <p><strong>Deliveries This Month:</strong> {monthOrders.length}</p>
          <p><strong>Average Deliveries Per Day:</strong> {avgOrdersPerDay}</p>
          <h4>Last 3 Deliveries</h4>
          {recentOrders.length > 0 ? (
            <ul>
              {recentOrders.map((order) => (
                <li key={order.id}>
                  Order #{order.id} - Total: {order.total_price} KZT
                </li>
              ))}
            </ul>
          ) : (
            <p>No recent deliveries.</p>
          )}
        </div>
      );
    }

    if (user.role === "owner") {
      const { dayOrders, weekOrders, monthOrders, totalSpent, recentOrders } = getOrdersStats(orders, user.id, "owner");
      const userRestaurants = restaurants.filter((r) => r.owner_id === user.id);
      const popularDishes = userRestaurants.flatMap((r) =>
        r.dishes.map((dish) => ({
          name: dish.name,
          count: orders.filter((o) => o.restaurant_id === r.id && o.items.some((item) => item.id === dish.id)).length,
        }))
      ).sort((a, b) => b.count - a.count).slice(0, 3);

      return (
        <div className="profile-section">
          <h3>Restaurant Owner Profile</h3>
          <p><strong>Name:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Phone:</strong> {user.phone}</p>
          <h4>Your Restaurants</h4>
          {userRestaurants.length > 0 ? (
            <ul>
              {userRestaurants.map((restaurant) => (
                <li key={restaurant.id}>
                  {restaurant.name} - {restaurant.address}
                </li>
              ))}
            </ul>
          ) : (
            <p>No restaurants found.</p>
          )}
          <h4>Restaurant Statistics</h4>
          <p><strong>Orders Today:</strong> {dayOrders.length}</p>
          <p><strong>Orders This Week:</strong> {weekOrders.length}</p>
          <p><strong>Orders This Month:</strong> {monthOrders.length}</p>
          <p><strong>Total Revenue:</strong> {totalSpent} KZT</p>
          <h4>Popular Dishes</h4>
          <p><strong>Default Address:</strong> {profileData?.address || "Not set"}</p>
          {popularDishes.length > 0 ? (
            <ul>
              {popularDishes.map((dish, index) => (
                <li key={index}>
                  {dish.name} - Ordered {dish.count} times
                </li>
              ))}
            </ul>
          ) : (
            <p>No popular dishes yet.</p>
          )}
          <h4>Last 3 Orders</h4>
          {recentOrders.length > 0 ? (
            <ul>
              {recentOrders.map((order) => (
                <li key={order.id}>
                  Order #{order.id} on {new Date(order.created_at).toLocaleDateString()} - Total: {order.total_price} KZT
                </li>
              ))}
            </ul>
          ) : (
            <p>No recent orders.</p>
          )}
        </div>
      );
    }

    if (user.role === "moderator") {
      return (
        <div className="profile-section">
          <h3>Moderator Profile</h3>
          <p><strong>Name:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Moderator Since:</strong> {new Date(user.created_at).toLocaleDateString()}</p>
          <p><strong>Couriers Approved:</strong> 5 (Placeholder)</p>
          <p><strong>Couriers Rejected/Removed:</strong> 2 (Placeholder)</p>
          <p><strong>Last Activity:</strong> Approved courier #1234 on {new Date().toLocaleDateString()} (Placeholder)</p>
        </div>
      );
    }

    if (user.role === "admin") {
      const activeUsersToday = [...new Set(orders.filter((order) => {
        const orderDate = new Date(order.created_at);
        return orderDate.toDateString() === new Date("2025-05-01").toDateString();
      }).map((order) => order.user_id))].length;
      const ordersToday = orders.filter((order) => {
        const orderDate = new Date(order.created_at);
        return orderDate.toDateString() === new Date("2025-05-01").toDateString();
      }).length;

      return (
        <div className="profile-section">
          <h3>Admin Profile</h3>
          <p><strong>Name:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Phone:</strong> {user.phone}</p>
          <p><strong>Admin Since:</strong> {new Date(user.created_at).toLocaleDateString()}</p>
          <p><strong>Users Blocked:</strong> 3 (Placeholder)</p>
          <p><strong>Restaurants Approved/Banned:</strong> 10 / 1 (Placeholder)</p>
          <p><strong>Active Users Today:</strong> {activeUsersToday}</p>
          <p><strong>Orders on Platform Today:</strong> {ordersToday}</p>
          <p><strong>Last Actions:</strong> Banned user #42 on {new Date().toLocaleDateString()} (Placeholder)</p>
        </div>
      );
    }

    return <p>Unknown role.</p>;
  };

  return (
    <div className="container profile-container">
      <div className="profile-header">
        <img
          src={profileData?.avatar_url || "https://via.placeholder.com/100"}
          alt="Profile"
          className="profile-avatar"
        />
        <div>
          <h2>{user.name}'s Profile</h2>
          <p>Role: {user.role.charAt(0).toUpperCase() + user.role.slice(1)}</p>
        </div>
      </div>

      {renderProfile()}

      <div className="profile-section">
        <h3>Account Settings</h3>
        <button className="edit-profile-btn">Edit Profile</button>
        <form onSubmit={handlePasswordChange} className="password-form">
          <h4>Change Password</h4>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="New Password (min 8 characters)"
            required
          />
          {passwordError && <p className="error-text">{passwordError}</p>}
          {passwordSuccess && <p className="success-text">{passwordSuccess}</p>}
          <button type="submit">Update Password</button>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;