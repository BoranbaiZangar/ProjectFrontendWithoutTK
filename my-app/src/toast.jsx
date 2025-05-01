// src/toast.js
import store from "./redux/store";    // adjust if your store lives elsewhere
import { addToast } from "./redux/toast";

function base(message, opts = {}) {
  store.dispatch(addToast({ message, ...opts }));
}

// mimic react-toastify API
export const toast = Object.assign(base, {
  success: (msg, o = {}) => base(msg, { ...o, type: "success" }),
  error:   (msg, o = {}) => base(msg, { ...o, type: "error"   }),
  warning: (msg, o = {}) => base(msg, { ...o, type: "warning" }),
  info:    (msg, o = {}) => base(msg, { ...o, type: "info"    }),
});
