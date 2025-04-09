// src/redux/dishSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const API_URL = "http://localhost:5000/dishes";

// Получение всех блюд через fetch
export const fetchDishes = createAsyncThunk("dishes/fetch", async (_, thunkAPI) => {
  try {
    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error("Ошибка при загрузке блюд");
    }

    const data = await response.json();
    return data;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.message);
  }
});

const dishSlice = createSlice({
  name: "dishes",
  initialState: {
    list: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDishes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDishes.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchDishes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default dishSlice.reducer;
