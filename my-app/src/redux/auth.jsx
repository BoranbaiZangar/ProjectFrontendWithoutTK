// src/redux/auth.js
import md5 from "md5"; // Құпиясөзді шифрлауға арналған md5 кітапханасы

// 🏷 Акшн түрлері (Action Types):
// Бұл жерде әрекеттердің типтерін анықтаймыз
const LOGIN_REQUEST = "auth/LOGIN_REQUEST"; 
const LOGIN_SUCCESS = "auth/LOGIN_SUCCESS";
const LOGIN_FAILURE = "auth/LOGIN_FAILURE";

const REGISTER_REQUEST = "auth/REGISTER_REQUEST"; 
const REGISTER_SUCCESS = "auth/REGISTER_SUCCESS"; 
const REGISTER_FAILURE = "auth/REGISTER_FAILURE"; 

// жүйеден шығу әрекеті
const LOGOUT = "auth/LOGOUT";
// жаңа әрекет: қолданушы рөлін өзгерту 
const CHANGE_USER_ROLE = "auth/CHANGE_USER_ROLE"; 

// Бастапқы күй (Initial State): 
// Бұл жерде бастапқы мәліметтерді анықтаймыз
const initialState = {
  user: JSON.parse(localStorage.getItem("user")) || null, 
  token: localStorage.getItem("token") || null, 
  loading: false, 
  error: null, 
};

// 🔁 Редюсер: Бұл функция күйді (state) 
// басқарады және әрекеттерге (actions) байланысты күйді өзгертеді
export default function authReducer(state = initialState, action) {
  switch (action.type) {
    case LOGIN_REQUEST:
    case REGISTER_REQUEST:
      return { ...state, loading: true, error: null }; // Кіру немесе тіркелу басталғанда жүктелу күйін қосамыз, қатені тазартамыз

    case LOGIN_SUCCESS:
      return {
        ...state,
        loading: false, 
        user: action.payload.user, 
        token: action.payload.token,
      };

    case REGISTER_SUCCESS:
      return { ...state, loading: false }; // Тіркелу сәтті болса, жүктелуді өшіреміз

    case LOGIN_FAILURE:
    case REGISTER_FAILURE:
      return { ...state, loading: false, error: action.payload }; // Қате болса, жүктелуді өшіріп, қатені сақтаймыз

    case LOGOUT:
      return { ...state, user: null, token: null }; // Жүйеден шыққанда қолданушы мен токенді тазартамыз

    case CHANGE_USER_ROLE: // Жаңа кейс: қолданушы рөлін өзгерту
      const updatedUser = { ...state.user, role: action.payload };
      localStorage.setItem("user", JSON.stringify(updatedUser)); // localStorage-ты жаңартамыз
      return {
        ...state,
        user: updatedUser, // Қолданушы рөлін жаңа рөлге ауыстырамыз
      };

    default:
      return state; // Егер әрекет белгісіз болса, күйді өзгертпейміз
  }
}

// 📦 Thunk: Кіру әрекеті (Login)
export const login = (data) => async (dispatch) => {
  dispatch({ type: LOGIN_REQUEST }); // Кіру әрекетін бастаймыз, жүктелу күйін қосамыз

  try {
    // Құпиясөзді шифрлаймыз (md5 арқылы)
    const hashedPassword = md5(data.password);

    // Почта арқылы қолданушыны іздейміз (серверден сұрау жібереміз)
    const res = await fetch(`http://localhost:5000/users?email=${data.email}`);
    const users = await res.json();
    const user = users[0]; // Бірінші қолданушыны аламыз (почта бірегей болғандықтан бір ғана болады)

    // Егер қолданушы табылмаса, қате шығарамыз
    if (!user) {
      throw new Error("No user found with this email address.");
    }

    // Шифрланған құпиясөздерді салыстырамыз
    if (user.password !== hashedPassword) {
      throw new Error("Password incorrect");
    }

    // Токен жасаймыз (жалған токен, мысал ретінде)
    const token = "fake-token-" + user.id;
    localStorage.setItem("token", token); // Токенді localStorage-қа сақтаймыз
    localStorage.setItem("user", JSON.stringify(user)); // Қолданушыны localStorage-қа сақтаймыз

    // Кіру әрекеті сәтті болды, күйді жаңартамыз
    dispatch({ type: LOGIN_SUCCESS, payload: { user, token } });
  } catch (err) {
    // Қате болса, қатені сақтаймыз
    dispatch({ type: LOGIN_FAILURE, payload: err.message });
  }
};

// 📦 Thunk: Тіркелу әрекеті (Register)
export const register = (data) => async (dispatch) => {
  dispatch({ type: REGISTER_REQUEST }); // Тіркелу әрекетін бастаймыз, жүктелу күйін қосамыз

  try {
    // Алдымен почтаның бар-жоғын тексереміз
    const resCheck = await fetch(
      `http://localhost:5000/users?email=${data.email}`
    );
    const users = await resCheck.json();

    // Егер осы почта бұрыннан тіркелген болса, қате шығарамыз
    if (users.length > 0) {
      throw new Error("This email is already registered.");
    }

    // Құпиясөзді шифрлаймыз және қолданушы мәліметтерін дайындаймыз
    const hashedPassword = md5(data.password);
    const userData = { ...data, password: hashedPassword };

    // Серверге жаңа қолданушыны қосу үшін сұрау жібереміз
    const res = await fetch("http://localhost:5000/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });

    // Егер сұрау сәтсіз болса, қате шығарамыз
    if (!res.ok) throw new Error("An error occurred during registration.");

    await res.json();
    dispatch({ type: REGISTER_SUCCESS }); // Тіркелу сәтті болды
  } catch (err) {
    // Қате болса, қатені сақтаймыз
    dispatch({ type: REGISTER_FAILURE, payload: err.message });
  }
};

// 📦 Thunk: Рөлді серверде жаңарту
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
    localStorage.setItem("user", JSON.stringify(updatedUser)); // localStorage-ты жаңартамыз
    dispatch({ type: CHANGE_USER_ROLE, payload: newRole }); // Redux күйін жаңартамыз
  } catch (err) {
    console.error("Рөлді серверде жаңарту қатесі:", err.message);
  }
};

// 📦 Логаут: Жүйеден шығу әрекеті
export const logout = () => (dispatch) => {
  localStorage.removeItem("token"); // localStorage-тан токенді өшіреміз
  localStorage.removeItem("user"); // localStorage-тан қолданушыны өшіреміз
  dispatch({ type: LOGOUT }); // Күйді тазартамыз
};

// 📦 Жаңа әрекет: Қолданушы рөлін өзгерту
export const changeUserRole = (newRole) => ({
  type: CHANGE_USER_ROLE,
  payload: newRole,
});