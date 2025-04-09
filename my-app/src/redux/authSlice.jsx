// src/redux/authSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const API_URL = "http://localhost:5000/users";

// 🔐 Фейковый логин через fetch
export const loginUser = createAsyncThunk("auth/loginUser", async (data, thunkAPI) => {
  try {
    const response = await fetch(`${API_URL}?email=${data.email}`);
    const users = await response.json();
    const user = users[0];

    if (!user || user.password !== data.password) {
      return thunkAPI.rejectWithValue("Неверный email или пароль");
    }

    const token = "fake-token-" + user.id;
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));

    return { user, token };
  } catch (err) {
    return thunkAPI.rejectWithValue("Ошибка входа");
  }
});

// 📝 Фейковая регистрация через fetch (POST)
export const registerUser = createAsyncThunk("auth/registerUser", async (data, thunkAPI) => {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) throw new Error("Ошибка регистрации");

    const newUser = await response.json();
    return newUser;
  } catch (err) {
    return thunkAPI.rejectWithValue("Ошибка регистрации");
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: JSON.parse(localStorage.getItem("user")) || null,
    token: localStorage.getItem("token") || null,
    loading: false,
    error: null,
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    },
    setUserFromToken: (state, action) => {
      state.user = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { logout, setUserFromToken } = authSlice.actions;
export default authSlice.reducer;
