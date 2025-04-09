// src/redux/orderSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const API_URL = "http://localhost:5000/orders";

// Получение заказов (по userId или все)
export const fetchOrders = createAsyncThunk(
  "orders/fetch",
  async (userId, thunkAPI) => {
    try {
      const url =
        userId === "ALL"
          ? `${API_URL}`
          : `${API_URL}?userId=${userId}`;

      const response = await fetch(url);
      if (!response.ok) throw new Error("Ошибка при загрузке заказов");

      const data = await response.json();
      return data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message || "Ошибка при загрузке заказов");
    }
  }
);

const orderSlice = createSlice({
  name: "orders",
  initialState: {
    list: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default orderSlice.reducer;
