import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchStats } from "../redux/stats";

export default function AdminStatsPage() {
  const dispatch = useDispatch();
  const statsState = useSelector((state) => state.stats || {});
  const { data, loading, error } = statsState;

  // Date range filter state
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Fetch stats on mount
  useEffect(() => {
    dispatch(fetchStats());
  }, [dispatch]);

  // Handle date input changes
  const handleDateFromChange = (e) => {
    const value = e.target.value;
    if (value && !isNaN(new Date(value))) {
      setDateFrom(value);
    } else {
      setDateFrom('');
    }
  };

  const handleDateToChange = (e) => {
    const value = e.target.value;
    if (value && !isNaN(new Date(value))) {
      setDateTo(value);
    } else {
      setDateTo('');
    }
  };

  // Filtered data based on date range
  const filteredData = useMemo(() => {
    if (!data || data.length === 0) return [];
    return data.filter((entry) => {
      const entryDate = new Date(entry.date);
      if (isNaN(entryDate)) {
        console.warn(`Invalid date in stats entry: ${entry.date}`);
        return false;
      }
      if (dateFrom && entryDate < new Date(dateFrom)) return false;
      if (dateTo && entryDate > new Date(dateTo)) return false;
      return true;
    });
  }, [data, dateFrom, dateTo]);

  // Summary metrics
  const totalOrders = useMemo(
    () => filteredData.reduce((sum, e) => sum + (e.ordersCount || 0), 0),
    [filteredData]
  );
  const totalRevenue = useMemo(
    () => filteredData.reduce((sum, e) => sum + (e.revenue || 0), 0),
    [filteredData]
  );
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  if (loading) {
    return <p>Loading statistics...</p>;
  }
  if (error) {
    return (
      <p style={{ color: 'red' }}>
        Error loading statistics: {error}. Please check the data or try again later.
      </p>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <h2>Administrative Statistics</h2>

      {/* Date range filter */}
      <div style={{ margin: '1rem 0', display: 'flex', gap: '1rem' }}>
        <label>
          From:{' '}
          <input
            type="date"
            value={dateFrom}
            onChange={handleDateFromChange}
          />
        </label>
        <label>
          To:{' '}
          <input
            type="date"
            value={dateTo}
            onChange={handleDateToChange}
          />
        </label>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem' }}>
        <div style={{ padding: '1rem', border: '1px solid #ddd', borderRadius: '8px' }}>
          <h4>Total Orders</h4>
          <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{totalOrders}</p>
        </div>
        <div style={{ padding: '1rem', border: '1px solid #ddd', borderRadius: '8px' }}>
          <h4>Total Revenue</h4>
          <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>₸{totalRevenue.toFixed(2)}</p>
        </div>
        <div style={{ padding: '1rem', border: '1px solid #ddd', borderRadius: '8px' }}>
          <h4>Average Order Value</h4>
          <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>₸{averageOrderValue.toFixed(2)}</p>
        </div>
      </div>

      {/* Stats table */}
      {filteredData.length > 0 ? (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ padding: '8px', textAlign: 'left' }}>Date</th>
              <th style={{ padding: '8px', textAlign: 'right' }}>Orders</th>
              <th style={{ padding: '8px', textAlign: 'right' }}>Revenue</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((entry) => (
              <tr key={entry.date}>
                <td style={{ padding: '8px' }}>
                  {entry.date && !isNaN(new Date(entry.date))
                    ? new Date(entry.date).toLocaleDateString()
                    : 'Invalid Date'}
                </td>
                <td style={{ padding: '8px', textAlign: 'right' }}>
                  {entry.ordersCount}
                </td>
                <td style={{ padding: '8px', textAlign: 'right' }}>
                  ₸{entry.revenue.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No statistics available for the selected date range.</p>
      )}
    </div>
  );
}