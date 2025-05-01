// src/redux/toast.js
export const ADD_TOAST    = "ADD_TOAST";
export const REMOVE_TOAST = "REMOVE_TOAST";

let nextId = 0;

// action creators
export const addToast = ({ message, type = "default", autoClose = 5000, position = "TOP_RIGHT" }) => ({
  type: ADD_TOAST,
  payload: { id: nextId++, message, type, autoClose, position },
});

export const removeToast = (id) => ({ type: REMOVE_TOAST, id });

// reducer (array of toast objects)
const initialState = [];
export default function toastReducer(state = initialState, action) {
  switch (action.type) {
    case ADD_TOAST:
      return [...state, action.payload];
    case REMOVE_TOAST:
      return state.filter((t) => t.id !== action.id);
    default:
      return state;
  }
}
