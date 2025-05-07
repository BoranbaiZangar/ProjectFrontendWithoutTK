import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import md5 from "md5";
import { fetchReviews } from "../redux/orders";
import ImageUploader from "../components/ImageUploader"; // путь подстрой под структуру





const ProfilePage = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { reviews } = useSelector((state) => state.orders);
  const [profileData, setProfileData] = useState(null);
  const [roleSpecificData, setRoleSpecificData] = useState(null);
  const [orders, setOrders] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [restaurantOwners, setRestaurantOwners] = useState([]);
  const [newPassword, setNewPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  // const [passwordSuccess, setPasswordSuccess] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [avatarReset, setAvatarReset] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", address: "" });
const [saveSuccess, setSaveSuccess] = useState("");



useEffect(() => {
  const fetchProfileData = async () => {
    try {
      setLoading(true);

      // Общие списки
      const [ordersData, restaurantsData, ownersData] = await Promise.all([
        fetch("http://localhost:5000/orders").then((r) => r.ok ? r.json() : []),
        fetch("http://localhost:5000/restaurants").then((r) => r.ok ? r.json() : []),
        fetch("http://localhost:5000/restaurant_owners").then((r) => r.ok ? r.json() : []),
      ]);
      setOrders(ordersData);
      setRestaurants(restaurantsData);
      setRestaurantOwners(ownersData);

      // Профиль пользователя
      const profileRes = await fetch(
        `http://localhost:5000/user_profiles?user_id=${user.id}`
      );
      const profileJson = profileRes.ok ? await profileRes.json() : [];
      const profile = profileJson[0] || {};
      setProfileData(profile);

      setFormData({
        name:  user.name  || "",
        email: user.email || "",
        phone: user.phone || "",
        address: profile.address || "",
      });

      // Роль-специфичные данные
      if (user.role === "courier") {
        const courierRes = await fetch(
          `http://localhost:5000/couriers?user_id=${user.id}`
        );
        const courierJson = courierRes.ok ? await courierRes.json() : [];
        setRoleSpecificData(courierJson[0] || {});
        dispatch(fetchReviews({ courierId: user.id }));
      } else if (user.role === "owner") {
        const ownerRes = await fetch(
          `http://localhost:5000/restaurant_owners?user_id=${user.id}`
        );
        const ownerJson = ownerRes.ok ? await ownerRes.json() : [];
        setRoleSpecificData(ownerJson[0] || {});
      } else if (user.role === "moderator") {
        const modRes = await fetch(
          `http://localhost:5000/moderators?user_id=${user.id}`
        );
        const modJson = modRes.ok ? await modRes.json() : [];
        setRoleSpecificData(modJson[0] || {});
      } else if (user.role === "admin") {
        const adminRes = await fetch(
          `http://localhost:5000/admins?user_id=${user.id}`
        );
        const adminJson = adminRes.ok ? await adminRes.json() : [];
        setRoleSpecificData(adminJson[0] || {});
      }

    } catch (err) {
      console.error("Error fetching profile data:", err);
      setError("Failed to load profile data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  if (user) fetchProfileData();
}, [user, dispatch]);


  const handleProfileSubmit = async (e) => {
  e.preventDefault();
  setPasswordError("");
  setSaveSuccess("");

  if (newPassword && newPassword.length < 8) {
    setPasswordError("Пароль должен содержать не менее 8 символов.");
    return;
  }

  try {
    await fetch(`http://localhost:5000/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        ...(newPassword && { password: md5(newPassword) }),
      }),
    });

    await fetch(`http://localhost:5000/user_profiles/${profileData.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ address: formData.address }),
    });

    setSaveSuccess("Профиль успешно обновлён!");
    setNewPassword("");
  } catch (err) {
    console.error("Ошибка при обновлении:", err);
    setPasswordError("Произошла ошибка при обновлении профиля.");
  }
  setProfileData((prev) => ({ ...prev, address: formData.address }));

setFormData((prev) => ({
  ...prev,
  name: formData.name,
  email: formData.email,
  phone: formData.phone,
}));
dispatch({
  type: "auth/UPDATE_USER",
  payload: {
    ...user,
    name: formData.name,
    email: formData.email,
    phone: formData.phone,
  },
});

};


  const handleAvatarUpload = async (base64Image) => {
    try {
      const res = await fetch(`http://localhost:5000/user_profiles/${profileData.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatar_url: base64Image }),
      });

      if (res.ok) {
        setProfileData((prev) => ({ ...prev, avatar_url: base64Image }));
      } else {
        console.error("Failed to update avatar.");
      }
    } catch (err) {
      console.error("Error updating avatar:", err);
    }
  };
  const handleAvatarDelete = async () => {
    try {
      const res = await fetch(`http://localhost:5000/user_profiles/${profileData.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatar_url: "" }),
      });
  
      if (res.ok) {
        localStorage.removeItem("avatarImage");
        setProfileData((prev) => ({ ...prev, avatar_url: "" }));
        setAvatarReset(true); // 🔁 блокируем повторную подгрузку
      } else {
        console.error("Failed to delete avatar.");
      }
    } catch (err) {
      console.error("Error deleting avatar:", err);
    }
  };
<ImageUploader onUpload={handleAvatarUpload} reset={avatarReset} />
  
  
  

  if (!user) {
    return <div style={{ padding: "20px" }}>Please log in to view your profile.</div>;
  }

  if (loading) {
    return <div style={{ padding: "20px" }}>Loading...</div>;
  }

  if (error) {
    return <div style={{ padding: "20px", color: "red" }}>{error}</div>;
  }

  const calculateTotalPrice = (items) => {
    return items.reduce((sum, item) => sum + item.price, 0);
  };

  const getOrdersStats = (orders, userId, roleFilter) => {
    const userOrders = orders.filter((order) => {
      if (roleFilter === "user") return order.user_id === userId || order.userId === userId;
      if (roleFilter === "courier") return order.courier_id === userId && order.status === "Delivered";
      if (roleFilter === "owner") {
        const userRestaurantIds = restaurantOwners
          .filter((owner) => owner.user_id === userId && owner.restaurant_id)
          .map((owner) => owner.restaurant_id);
        return order.restaurant_id && userRestaurantIds.includes(order.restaurant_id);
      }
      return false;
    });

    const totalSpent = userOrders.reduce((sum, order) => sum + calculateTotalPrice(order.items), 0);
    const recentOrders = userOrders.slice(-3).reverse();

    return { totalOrders: userOrders, totalSpent, recentOrders };
  };

  const getFavoriteRestaurant = (orders, userId) => {
    const userOrders = orders.filter((order) => (order.user_id === userId || order.userId === userId) && order.restaurant_id);
    const restaurantCounts = userOrders.reduce((acc, order) => {
      if (restaurants.find((r) => r.id === order.restaurant_id)) {
        acc[order.restaurant_id] = (acc[order.restaurant_id] || 0) + 1;
      }
      return acc;
    }, {});
    const favoriteId = Object.keys(restaurantCounts).reduce(
      (a, b) => (restaurantCounts[a] > restaurantCounts[b] ? a : b),
      null
    );
    return restaurants.find((r) => r.id === favoriteId)?.name || "None";
  };

  const getAverageOrdersPerDay = (orders, userId) => {
    const userOrders = orders.filter((order) => order.courier_id === userId && order.status === "Delivered");
    return userOrders.length; // Возвращаем общее количество доставленных заказов, так как created_at недоступен
  };

  const getCourierAverageRating = () => {
    const courierReviews = reviews.filter((review) => review.courierId === user.id);
    return courierReviews.length > 0
      ? (courierReviews.reduce((sum, review) => sum + review.courierRating, 0) / courierReviews.length).toFixed(1)
      : 0;
  };

  const renderProfile = () => {
    if (user.role === "user") {
      const { totalOrders, totalSpent, recentOrders } = getOrdersStats(orders, user.id, "user");
      const favoriteRestaurant = getFavoriteRestaurant(orders, user.id);

      return (
        <div style={{ marginBottom: "20px" }}>
          <h3>User Profile</h3>
          <p><strong>Name:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Phone:</strong> {user.phone}</p>
          <p><strong>Registration Date:</strong> {new Date(user.created_at).toLocaleDateString()}</p>
          <p><strong>Default Address:</strong> {profileData?.address || "Not set"}</p>
          <h4>Order Statistics</h4>
          <p><strong>Total Orders:</strong> {totalOrders.length}</p>
          <p><strong>Total Spent:</strong> {totalSpent} KZT</p>
          <p><strong>Favorite Restaurant:</strong> {favoriteRestaurant}</p>
          <h4>Last 3 Orders</h4>
          {recentOrders.length > 0 ? (
            <ul>
              {recentOrders.map((order) => (
                <li key={order.id}>
                  Order #{order.id} - Restaurant ID: {order.restaurant_id || "Unknown"} - Status: {order.status} - Total: {calculateTotalPrice(order.items)} KZT
                </li>
              ))}
            </ul>
          ) : (
            <p>No orders found.</p>
          )}
        </div>
      );
    }

    if (user.role === "courier") {
      const {recentOrders } = getOrdersStats(orders, user.id, "courier");
      const totalDeliveries = getAverageOrdersPerDay(orders, user.id);
      const averageRating = getCourierAverageRating();

      return (
        <div style={{ marginBottom: "20px" }}>
          <h3>Courier Profile</h3>
          <p><strong>Name:</strong> {user.name}</p>
          <p><strong>Phone:</strong> {user.phone}</p>
          <p><strong>Vehicle Type:</strong> {roleSpecificData?.vehicle_type || "Not set"}</p>
          <p><strong>Start Date:</strong> {new Date(user.created_at).toLocaleDateString()}</p>
          <p><strong>Availability:</strong> {roleSpecificData?.is_available ? "Available" : "Not Available"}</p>
          <p><strong>Average Rating:</strong> {averageRating} / 5</p>
          <h4>Delivery Statistics</h4>
          <p><strong>Total Deliveries:</strong> {totalDeliveries}</p>
          <h4>Last 3 Deliveries</h4>
          {recentOrders.length > 0 ? (
            <ul>
              {recentOrders.map((order) => (
                <li key={order.id}>
                  Order #{order.id} - Restaurant ID: {order.restaurant_id || "Unknown"} - Total: {calculateTotalPrice(order.items)} KZT
                </li>
              ))}
            </ul>
          ) : (
            <p>No deliveries found.</p>
          )}
        </div>
      );
    }

    if (user.role === "owner") {
      const { totalOrders, totalSpent, recentOrders } = getOrdersStats(orders, user.id, "owner");
      const userRestaurants = restaurants.filter((r) =>
        restaurantOwners.some((owner) => owner.user_id === user.id && owner.restaurant_id === r.id)
      );
      const popularDishes = userRestaurants
        .flatMap((r) =>
          r.dishes.map((dish) => ({
            name: dish.name,
            count: orders.filter((o) => o.restaurant_id === r.id && o.items.some((item) => item.id === dish.id)).length,
          }))
        )
        .sort((a, b) => b.count - a.count)
        .slice(0, 3);

      return (
        <div style={{ marginBottom: "20px" }}>
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
          <p><strong>Total Orders:</strong> {totalOrders.length}</p>
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
                  Order #{order.id} - Restaurant ID: {order.restaurant_id} - Total: {calculateTotalPrice(order.items)} KZT
                </li>
              ))}
            </ul>
          ) : (
            <p>No orders found.</p>
          )}
        </div>
      );
    }

    if (user.role === "moderator") {
      return (
        <div style={{ marginBottom: "20px" }}>
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
      const activeUsersToday = [...new Set(orders.map((order) => order.user_id || order.userId))].length;
      const ordersToday = orders.length;

      return (
        <div style={{ marginBottom: "20px" }}>
          <h3>Admin Profile</h3>
          <p><strong>Name:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Phone:</strong> {user.phone}</p>
          <p><strong>Admin Since:</strong> {new Date(user.created_at).toLocaleDateString()}</p>
          <p><strong>Users Blocked:</strong> 3 (Placeholder)</p>
          <p><strong>Restaurants Approved/Banned:</strong> 10 / 1 (Placeholder)</p>
          <p><strong>Active Users:</strong> {activeUsersToday}</p>
          <p><strong>Total Orders on Platform:</strong> {ordersToday}</p>
          <p><strong>Last Actions:</strong> Banned user #42 on {new Date().toLocaleDateString()} (Placeholder)</p>
        </div>
      );
    }

    return <p>Unknown role.</p>;
  };

  return (
    <div style={{ padding: "20px" }}>
      <div style={{ display: "flex", alignItems: "center", marginBottom: "20px" }}>
      <img
  key={profileData?.avatar_url || "default"}
  src={
    profileData?.avatar_url ||
    localStorage.getItem("avatarImage") ||
    "/default-avatar.png"
  }
  alt="Profile"
  className="profile-avatar"
/>

        <div>
          <h2>{user.name}'s Profile</h2>
          <p>Role: {user.role.charAt(0).toUpperCase() + user.role.slice(1)}</p>
        </div>
      </div>

      {renderProfile()}

      <div style={{ marginTop: "10px" }}>
  <ImageUploader onUpload={handleAvatarUpload} />
  {profileData?.avatar_url && (
    <button className="edit-profile-btn" onClick={handleAvatarDelete}>
      Удалить аватар
    </button>
  )}
</div>


<div style={{ marginTop: "30px" }}>
  <h3>Account Settings</h3>
  <form onSubmit={handleProfileSubmit} className="profile-form">
    <input
      name="name"
      value={formData.name}
      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
      placeholder="Имя"
      required
    />
    <input
      name="email"
      value={formData.email}
      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
      placeholder="Email"
      required
    />
    <input
      name="phone"
      value={formData.phone}
      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
      placeholder="Телефон"
      required
    />
    <input
      name="address"
      value={formData.address}
      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
      placeholder="Адрес"
    />

    <h4 style={{ marginTop: "20px" }}>Сменить пароль</h4>
    <input
      type="password"
      value={newPassword}
      onChange={(e) => setNewPassword(e.target.value)}
      placeholder="Новый пароль (мин. 8 символов)"
    />
    {passwordError && <p className="error-text">{passwordError}</p>}
    {saveSuccess && <p className="success-text">{saveSuccess}</p>}

    <button type="submit" className="edit-profile-btn">Сохранить изменения</button>
  </form>
</div>

    </div>
  );
};

export default ProfilePage;