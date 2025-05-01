import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import md5 from "md5";
import { fetchReviews } from "../redux/orders";

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
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        const ordersRes = await fetch("http://localhost:5000/orders");
        const ordersData = await ordersRes.json();
        setOrders(ordersData);

        const restaurantsRes = await fetch("http://localhost:5000/restaurants");
        const restaurantsData = await restaurantsRes.json();
        setRestaurants(restaurantsData);

        const ownersRes = await fetch("http://localhost:5000/restaurant_owners");
        const ownersData = await ownersRes.json();
        setRestaurantOwners(ownersData);

        const profileRes = await fetch(`http://localhost:5000/user_profiles?user_id=${user.id}`);
        const profileData = await profileRes.json();
        setProfileData(profileData[0] || {});

        if (user.role === "courier") {
          const courierRes = await fetch(`http://localhost:5000/couriers?user_id=${user.id}`);
          const courierData = await courierRes.json();
          setRoleSpecificData(courierData[0] || {});
          dispatch(fetchReviews({ courierId: user.id }));
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
        setError("Failed to load profile data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchProfileData();
    }
  }, [user, dispatch]);

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
      const { totalOrders, recentOrders } = getOrdersStats(orders, user.id, "courier");
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
          src={profileData?.avatar_url || "https://via.placeholder.com/100"}
          alt="Profile"
          style={{ width: "100px", height: "100px", borderRadius: "50%", marginRight: "20px" }}
        />
        <div>
          <h2>{user.name}'s Profile</h2>
          <p>Role: {user.role.charAt(0).toUpperCase() + user.role.slice(1)}</p>
        </div>
      </div>

      {renderProfile()}

      <div>
        <h3>Account Settings</h3>
        <button style={{ padding: "5px 10px", marginBottom: "10px" }}>Edit Profile</button>
        <form onSubmit={handlePasswordChange}>
          <h4>Change Password</h4>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="New Password (min 8 characters)"
            required
            style={{ padding: "5px", marginBottom: "10px", width: "200px" }}
          />
          {passwordError && <p style={{ color: "red" }}>{passwordError}</p>}
          {passwordSuccess && <p style={{ color: "green" }}>{passwordSuccess}</p>}
          <button type="submit" style={{ padding: "5px 10px" }}>Update Password</button>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;