import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchRestaurants } from "../redux/restaurants";
import { Link } from "react-router-dom";
import RestaurantPreviewCard from "../components/RestaurantPreviewCard";
import "../css/homepage.css";

const HomePage = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const { list, loading, error } = useSelector((s) => s.restaurants);

  useEffect(() => {
    if (!list.length && user?.role !== "owner") {
      dispatch(fetchRestaurants());
    }
  }, [dispatch, list.length, user]);

  const previews = list.slice(0, 8);

  return (
    <div className="hp-wrapper">
      {user?.role !== "owner" && (
        <>
          <header className="hp-header">
            <h1 className="hp-title">All Restaurants</h1>
            <Link to="/restaurants" className="hp-link-all">
              See all →
            </Link>
          </header>

          {loading && <p className="hp-info">Loading…</p>}
          {error && <p className="hp-error">{error}</p>}

          {!loading && !error && (
            <div className="hp-grid">
              {previews.map((r) => (
                <RestaurantPreviewCard key={r.id} restaurant={r} />
              ))}
            </div>
          )}
        </>
      )}

      {!user ? (
        <div className="hp-auth"></div>
      ) : (
        <p className="hp-hello">
          Hello, <strong>{user.name}</strong>!{" "}
          {user.role !== "owner" && `Role: ${user.role.charAt(0).toUpperCase() + user.role.slice(1)}`}
        </p>
      )}
    </div>
  );
};

export default HomePage;