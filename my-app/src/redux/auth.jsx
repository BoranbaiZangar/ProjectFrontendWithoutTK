import md5 from "md5";
import { v4 as uuidv4 } from "uuid"; // Импортируем uuid для генерации строковых id

const LOGIN_REQUEST = "auth/LOGIN_REQUEST";
const LOGIN_SUCCESS = "auth/LOGIN_SUCCESS";
const LOGIN_FAILURE = "auth/LOGIN_FAILURE";
const REGISTER_REQUEST = "auth/REGISTER_REQUEST";
const REGISTER_SUCCESS = "auth/REGISTER_SUCCESS";
const REGISTER_FAILURE = "auth/REGISTER_FAILURE";
const LOGOUT = "auth/LOGOUT";
const CHANGE_USER_ROLE = "auth/CHANGE_USER_ROLE";
const CLEAR_ERROR = "auth/CLEAR_ERROR";

const initialState = {
  user: JSON.parse(localStorage.getItem("user")) || null,
  token: localStorage.getItem("token") || null,
  loading: false,
  error: null,
};

export default function authReducer(state = initialState, action) {
  switch (action.type) {
    case LOGIN_REQUEST:
    case REGISTER_REQUEST:
      return { ...state, loading: true, error: null };
    case LOGIN_SUCCESS:
      return {
        ...state,
        loading: false,
        user: action.payload.user,
        token: action.payload.token,
      };
    case REGISTER_SUCCESS:
      return { ...state, loading: false };
    case LOGIN_FAILURE:
    case REGISTER_FAILURE:
      return { ...state, loading: false, error: action.payload };
    case LOGOUT:
      return { ...state, user: null, token: null };
    case CHANGE_USER_ROLE:
      const updatedUser = { ...state.user, role: action.payload };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      return { ...state, user: updatedUser };
    case CLEAR_ERROR:
      return { ...state, error: null };
    default:
      return state;
  }
}

export const login = (data) => async (dispatch) => {
  dispatch({ type: LOGIN_REQUEST });

  try {
    if (!data.email || !data.password) {
      throw new Error("Email and password are required.");
    }

    const hashedPassword = md5(data.password);
    const res = await fetch(`http://localhost:5000/users?email=${data.email}`);
    const users = await res.json();
    const user = users[0];

    if (!user) {
      throw new Error("No user found with this email address.");
    }

    if (user.password !== hashedPassword) {
      throw new Error("Password incorrect");
    }

    if (user.status !== "active") {
      throw new Error("User account is blocked.");
    }

    const token = "fake-token-" + user.id;
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));

    dispatch({ type: LOGIN_SUCCESS, payload: { user, token } });
  } catch (err) {
    dispatch({ type: LOGIN_FAILURE, payload: err.message });
  }
};

export const register = (data) => async (dispatch) => {
  dispatch({ type: REGISTER_REQUEST });

  try {
    const resCheck = await fetch(`http://localhost:5000/users?email=${data.email}`);
    const users = await resCheck.json();

    if (users.length > 0) {
      throw new Error("This email is already registered.");
    }

    const hashedPassword = md5(data.password);
    const userId = uuidv4(); // Генерируем строковый id через uuid
    const userData = {
      id: userId,
      name: data.name,
      email: data.email,
      password: hashedPassword,
      phone: data.phone || "",
      role: data.role || "user",
      created_at: new Date().toISOString(),
      status: "active",
    };

    const res = await fetch("http://localhost:5000/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });

    if (!res.ok) throw new Error("An error occurred during registration.");

    const newUser = await res.json();

    // Создаем дополнительные записи в зависимости от роли
    if (data.role === "user") {
      await fetch("http://localhost:5000/user_profiles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId, // Используем строковый id
          address: "",
          avatar_url: "",
          id: uuidv4(), // Генерируем id для записи
        }),
      });
    } else if (data.role === "courier") {
      await fetch("http://localhost:5000/couriers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId, // Используем строковый id
          vehicle_type: "bicycle",
          is_available: true,
          id: uuidv4(), // Генерируем id для записи
        }),
      });
    } else if (data.role === "owner") {
      await fetch("http://localhost:5000/restaurant_owners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId, // Используем строковый id
          restaurant_id: null,
          id: uuidv4(), // Генерируем id для записи
        }),
      });
    }

    dispatch({ type: REGISTER_SUCCESS });
  } catch (err) {
    dispatch({ type: REGISTER_FAILURE, payload: err.message });
  }
};

export const logout = () => (dispatch) => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  dispatch({ type: LOGOUT });
};

export const changeUserRole = (newRole) => ({
  type: CHANGE_USER_ROLE,
  payload: newRole,
});

export const updateUserRoleOnServer = (userId, newRole) => async (dispatch) => {
  try {
    const res = await fetch(`http://localhost:5000/users/${String(userId)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: newRole }),
    });

    if (!res.ok) {
      throw new Error("An error occurred while updating the role on the server.");
    }

    const updatedUser = await res.json();
    localStorage.setItem("user", JSON.stringify(updatedUser));
    dispatch({ type: CHANGE_USER_ROLE, payload: newRole });
  } catch (err) {
    console.error("Error updating role on server:", err.message);
  }
};

export const clearError = () => ({
  type: CLEAR_ERROR,
});