// src/pages/RestaurantsPage.js
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchRestaurants } from "../redux/restaurants";
import { Link } from "react-router-dom";

const RestaurantsPage = () => {
  const dispatch = useDispatch();
  const { list, loading, error } = useSelector((state) => state.restaurants);

  useEffect(() => {
    dispatch(fetchRestaurants());
  }, [dispatch]);

  return (
    <div className="container">
      <h2>Restaurants</h2>
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "#D81B60" }}>{error}</p>}

      {list.length === 0 && !loading && !error && (
        <p>Restaurants have not been added yet.</p>
      )}

      <div className="restaurants-catalog">
        {list.map((r) => (
          <Link
            to={`/restaurants/${r.id}`}
            key={r.id}
            className="restaurant-card"
          >
            <div className="restaurant-content">
              <h3>{r.name}</h3>
              <p>{r.description || "Description is missing"}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default RestaurantsPage;