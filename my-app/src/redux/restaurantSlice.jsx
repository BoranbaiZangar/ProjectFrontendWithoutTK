// src/redux/restaurantSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const API_URL = "http://localhost:5000/restaurants";

// Получение всех ресторанов
export const fetchRestaurants = createAsyncThunk(
  "restaurants/fetchAll",
  async (_, thunkAPI) => {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error("Не удалось загрузить рестораны");

      const data = await response.json();
      return data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message || "Ошибка загрузки ресторанов");
    }
  }
);

// Получение одного ресторана
export const fetchRestaurantById = createAsyncThunk(
  "restaurants/fetchById",
  async (id, thunkAPI) => {
    try {
      const response = await fetch(`${API_URL}/${id}`);
      if (!response.ok) throw new Error("Не удалось загрузить ресторан");

      const data = await response.json();
      return data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message || "Ошибка загрузки ресторана");
    }
  }
);

const restaurantSlice = createSlice({
  name: "restaurants",
  initialState: {
    list: [],
    selected: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearSelected: (state) => {
      state.selected = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRestaurants.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRestaurants.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchRestaurants.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchRestaurantById.fulfilled, (state, action) => {
        state.selected = action.payload;
      });
  },
});

export const { clearSelected } = restaurantSlice.actions;
export default restaurantSlice.reducer;
