// src/redux/cart.jsx

// Action Types
const LOAD_CART = "cart/LOAD_CART";
const ADD_TO_CART = "cart/ADD_TO_CART";
const REMOVE_FROM_CART = "cart/REMOVE_FROM_CART";
const UPDATE_CART_ITEM = "cart/UPDATE_CART_ITEM";
const CLEAR_CART = "cart/CLEAR_CART";

// Load initial state from localStorage
const loadState = () => {
  try {
    const serialized = localStorage.getItem("cartState");
    if (serialized === null) {
      return { items: [] };
    }
    return JSON.parse(serialized);
  } catch (err) {
    console.error("Failed to load cart from localStorage:", err);
    return { items: [] };
  }
};

// Save state to localStorage
const saveState = (state) => {
  try {
    const serialized = JSON.stringify(state);
    localStorage.setItem("cartState", serialized);
  } catch (err) {
    console.error("Failed to save cart to localStorage:", err);
  }
};

// Initial State
const initialState = loadState();

// Reducer
export default function cartReducer(state = initialState, action) {
  let newState;
  switch (action.type) {
    case LOAD_CART:
      newState = { ...state, ...action.payload };
      break;

    case ADD_TO_CART: {
      const item = action.payload;
      const exists = state.items.find((i) => i.id === item.id);
      if (exists) {
        newState = {
          ...state,
          items: state.items.map((i) =>
            i.id === item.id
              ? { ...i, quantity: i.quantity + (item.quantity || 1) }
              : i
          ),
        };
      } else {
        newState = {
          ...state,
          items: [...state.items, { ...item, quantity: item.quantity || 1 }],
        };
      }
      break;
    }

    case REMOVE_FROM_CART:
      newState = {
        ...state,
        items: state.items.filter((i) => i.id !== action.payload),
      };
      break;

    case UPDATE_CART_ITEM: {
      const { itemId, quantity } = action.payload;
      newState = {
        ...state,
        items: state.items.map((i) =>
          i.id === itemId ? { ...i, quantity } : i
        ),
      };
      break;
    }

    case CLEAR_CART:
      newState = { ...state, items: [] };
      break;

    default:
      return state;
  }

  saveState(newState);
  return newState;
}

// Action Creators
export const loadCart = () => ({
  type: LOAD_CART,
  payload: loadState(),
});

export const addToCart = (item) => ({
  type: ADD_TO_CART,
  payload: item,
});

export const removeFromCart = (itemId) => ({
  type: REMOVE_FROM_CART,
  payload: itemId,
});

export const updateCartItem = (itemId, quantity) => ({
  type: UPDATE_CART_ITEM,
  payload: { itemId, quantity },
});

export const clearCart = () => ({
  type: CLEAR_CART,
});
