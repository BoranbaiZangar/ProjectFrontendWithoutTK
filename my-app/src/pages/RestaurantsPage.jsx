import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchRestaurants, updateRestaurantStatus } from "../redux/restaurants";
import { Link } from "react-router-dom";

const RestaurantsPage = () => {
  const dispatch = useDispatch();
  const { list, loading, error } = useSelector((state) => state.restaurants);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchRestaurants());
  }, [dispatch]);

  const handleStatusChange = (id, newStatus) => {
    dispatch(updateRestaurantStatus(id, newStatus));
  };

  const isAdminOrModerator = user && (user.role === "admin" || user.role === "moderator");

  return (
    <div >
      <h2>Restaurants</h2>
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "#D81B60" }}>{error}</p>}

      {list.length === 0 && !loading && !error && (
        <p>Restaurants have not been added yet.</p>
      )}

      <div className="restaurants-catalog">
        {list.map((r) => (
          <div key={r.id} className="restaurant-card">
            <Link to={`/restaurants/${r.id}`} className="restaurant-content">
              <h3>{r.name}</h3>
              <p>{r.description || "Description is missing"}</p>
              {isAdminOrModerator && (
                <p>
                  <strong>Status:</strong> {r.status}
                </p>
              )}
            </Link>
            {isAdminOrModerator && r.status === "pending" && (
              <div className="button-group">
                <button
                  onClick={() => handleStatusChange(r.id, "active")}
                  disabled={loading}
                >
                  Approve
                </button>
                <button
                  onClick={() => handleStatusChange(r.id, "rejected")}
                  className="delete-button"
                  disabled={loading}
                >
                  Reject
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default RestaurantsPage;