import md5 from "md5";

const LOGIN_REQUEST = "auth/LOGIN_REQUEST";
const LOGIN_SUCCESS = "auth/LOGIN_SUCCESS";
const LOGIN_FAILURE = "auth/LOGIN_FAILURE";

const REGISTER_REQUEST = "auth/REGISTER_REQUEST";
const REGISTER_SUCCESS = "auth/REGISTER_SUCCESS";
const REGISTER_FAILURE = "auth/REGISTER_FAILURE";

const LOGOUT = "auth/LOGOUT";
const CHANGE_USER_ROLE = "auth/CHANGE_USER_ROLE";
const RESET_ERROR = "auth/RESET_ERROR"; // Новое действие для сброса ошибки

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
      return {
        ...state,
        user: updatedUser,
      };

    case RESET_ERROR: // Сбрасываем ошибку
      return { ...state, error: null };

    default:
      return state;
  }
}

export const login = (data) => async (dispatch) => {
  dispatch({ type: LOGIN_REQUEST });

  try {
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
    const userData = { ...data, password: hashedPassword };

    const res = await fetch("http://localhost:5000/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });

    if (!res.ok) throw new Error("An error occurred during registration.");

    await res.json();
    dispatch({ type: REGISTER_SUCCESS });
  } catch (err) {
    dispatch({ type: REGISTER_FAILURE, payload: err.message });
  }
};

export const updateUserRoleOnServer = (userId, newRole) => async (dispatch) => {
  try {
    const res = await fetch(`http://localhost:5000/users/${userId}`, {
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
    console.error("Рөлді серверде жаңарту қатесі:", err.message);
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

export const resetError = () => ({
  type: RESET_ERROR,
});