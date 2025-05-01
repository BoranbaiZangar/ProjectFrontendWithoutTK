// src/redux/stats.jsx

// Action Types
const FETCH_STATS_REQUEST = "stats/FETCH_STATS_REQUEST";
const FETCH_STATS_SUCCESS = "stats/FETCH_STATS_SUCCESS";
const FETCH_STATS_FAILURE = "stats/FETCH_STATS_FAILURE";

// Initial State
const initialState = {
  data: [],       // Array of statistics entries
  loading: false,
  error: null,
};

// Reducer
export default function statsReducer(state = initialState, action) {
  switch (action.type) {
    case FETCH_STATS_REQUEST:
      return { ...state, loading: true, error: null };

    case FETCH_STATS_SUCCESS:
      return { ...state, loading: false, data: action.payload };

    case FETCH_STATS_FAILURE:
      return { ...state, loading: false, error: action.payload };

    default:
      return state;
  }
}

// API base URL
const API_URL = "http://localhost:5000";

// Thunk to fetch statistics by aggregating orders per day
export const fetchStats = () => async (dispatch) => {
  dispatch({ type: FETCH_STATS_REQUEST });
  try {
    const response = await fetch(`${API_URL}/orders`);
    if (!response.ok) {
      throw new Error(`Failed to fetch orders: ${response.status}`);
    }
    const orders = await response.json();

    // Aggregate by date
    const statsMap = {};
    orders.forEach((order) => {
      // Determine and validate timestamp
      const rawTs = order.created_at || order.createdAt;
      const dt = new Date(rawTs);
      if (!rawTs || isNaN(dt)) {
        console.warn(`Skipping order ${order.id} due to invalid date: ${rawTs}`);
        return; // skip invalid timestamps
      }
      const dateKey = dt.toISOString().split('T')[0];

      if (!statsMap[dateKey]) {
        statsMap[dateKey] = { date: dateKey, ordersCount: 0, revenue: 0 };
      }
      statsMap[dateKey].ordersCount += 1;
      if (Array.isArray(order.items)) {
        order.items.forEach((item) => {
          const qty = item.quantity || 1;
          statsMap[dateKey].revenue += (item.price || 0) * qty;
        });
      }
    });

    const statsArray = Object.values(statsMap).sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );
    dispatch({ type: FETCH_STATS_SUCCESS, payload: statsArray });
  } catch (err) {
    dispatch({ type: FETCH_STATS_FAILURE, payload: err.message });
  }
};
