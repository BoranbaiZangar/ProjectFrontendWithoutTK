// src/redux/auth.js
import md5 from "md5"; 

// акшн тайптар
const LOGIN_REQUEST = "auth/LOGIN_REQUEST";
const LOGIN_SUCCESS = "auth/LOGIN_SUCCESS";
const LOGIN_FAILURE = "auth/LOGIN_FAILURE";

const REGISTER_REQUEST = "auth/REGISTER_REQUEST";
const REGISTER_SUCCESS = "auth/REGISTER_SUCCESS";
const REGISTER_FAILURE = "auth/REGISTER_FAILURE";

const LOGOUT = "auth/LOGOUT";

//  стейттер
const initialState = {
  user: JSON.parse(localStorage.getItem("user")) || null,
  token: localStorage.getItem("token") || null,
  loading: false,
  error: null,
};

// редюсерлер
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

    default:
      return state;
  }
}

export const login = (data) => async (dispatch) => {
  dispatch({ type: LOGIN_REQUEST });

  try { 
    //тексеріс алдында құпиясөхжі шифрлаймыз
    const hashedPassword = md5(data.password);

    // почта арқылы қолданушыны іздейміз
    const res = await fetch(`http://localhost:5000/users?email=${data.email}`);
    const users = await res.json();
    const user = users[0];

    if (!user) {
      throw new Error("User with this email not found");
    }

    // хэшталған құпиясөздерді тексереміз
    if (user.password !== hashedPassword) {
      throw new Error("Incorrect password");
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
    // Почтаны тексереміз
    const resCheck = await fetch(
      `http://localhost:5000/users?email=${data.email}`
    );
    const users = await resCheck.json();

    if (users.length > 0) {
      throw new Error("This email is already registered");
    }

    // жеткізбей тұрып құпиясөзді хэштап база данныхқа лақтырамыз
    const hashedPassword = md5(data.password);
    const userData = { ...data, password: hashedPassword };

    // база даныхқа лақтыратын код
    const res = await fetch("http://localhost:5000/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });

    if (!res.ok) throw new Error("Ошибка регистрации");

    await res.json();
    dispatch({ type: REGISTER_SUCCESS });
  } catch (err) {
    dispatch({ type: REGISTER_FAILURE, payload: err.message });
  }
};
//нау енді лагаут чисто стореджті тазартады
export const logout = () => (dispatch) => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  dispatch({ type: LOGOUT });
};