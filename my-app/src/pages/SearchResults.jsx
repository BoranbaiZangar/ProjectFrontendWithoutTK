import React, { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";

export default function SearchResults() {
  const { search } = useLocation();
  const query = new URLSearchParams(search).get("query")?.toLowerCase() || "";
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAndFilter() {
      setLoading(true);
      try {
        const res = await fetch("http://localhost:5000/restaurants");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const restaurants = await res.json();

        const matched = [];
        restaurants.forEach(r => {
          if (r.name.toLowerCase().includes(query)) {
            matched.push({ type: "restaurant", id: r.id, name: r.name, description: r.description });
          }
          (r.dishes || []).forEach(d => {
            if (d.name.toLowerCase().includes(query)) {
              matched.push({
                type: "dish",
                id: d.id,
                name: d.name,
                restaurantId: r.id,
                restaurantName: r.name,
                description: d.description
              });
            }
          });
        });

        setResults(matched);
      } catch (err) {
        console.error("Error during search:", err);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }

    if (query) fetchAndFilter();
    else setLoading(false);
  }, [query]);

  if (loading) {
    return <p style={{ padding: 20 }}>Loading…</p>;
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Search results for “{query}”</h2>
      {results.length === 0 ? (
        <p>No results found.</p>
      ) : (
        <div className="search-results">
          {results.map((item, idx) => (
            <Link
              key={idx}
              to={
                item.type === "restaurant"
                  ? `/restaurants/${item.id}`
                  : `/restaurants/${item.restaurantId}`
              }
              className="search-result-card"
            >
              {item.type === "restaurant" ? (
                <>
                  <h3>{item.name}</h3>
                  {item.description && <p>{item.description}</p>}
                  <small>Type: Restaurant</small>
                </>
              ) : (
                <>
                  <h4>{item.name}</h4>
                  <p>Restaurant: {item.restaurantName}</p>
                  {item.description && <small>{item.description}</small>}
                </>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}