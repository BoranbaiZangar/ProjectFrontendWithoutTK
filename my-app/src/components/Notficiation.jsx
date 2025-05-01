// src/components/Notification.jsx
// Add once in global CSS:
/*
@keyframes shrink { from { width: 100%; } to { width: 0%; } }
*/
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { removeToast } from "../redux/toast";

const COLORS = {
  success:  "#27ae60",
  error:    "#c0392b",
  warning:  "#e67e22",
  info:     "#3498db",
  default:  "#34495e",
};
const POS = {
  TOP_RIGHT:  { top: 20,  right: 20 },
  TOP_LEFT:   { top: 20,  left: 20 },
  BOTTOM_RIGHT:{ bottom: 20, right: 20 },
  BOTTOM_LEFT:{ bottom: 20, left: 20 },
};

export default function Notification() {
  const toasts = useSelector((s) => s.toasts);

  return (
    <>
      {Object.entries(POS).map(([pos, style]) => (
        <div key={pos} style={{ position: "fixed", zIndex: 10_000, pointerEvents: "none", ...style }}>
          {toasts
            .filter((t) => (t.position || "TOP_RIGHT") === pos)
            .map((t) => (
              <ToastItem key={t.id} toast={t} />
            ))
          }
        </div>
      ))}
    </>
  );
}

/* individual toast */
function ToastItem({ toast }) {
  const dispatch = useDispatch();

  useEffect(() => {
    if (toast.autoClose !== false) {
      const timer = setTimeout(() => dispatch(removeToast(toast.id)), toast.autoClose);
      return () => clearTimeout(timer);
    }
  }, [toast, dispatch]);

  return (
    <div style={{ ...boxStyle, background: COLORS[toast.type] }}>
      {toast.message}
      {toast.autoClose !== false && (
        <span
          style={{ ...progressStyle, animationDuration: `${toast.autoClose}ms` }}
        />
      )}
    </div>
  );
}

/* styles */
const boxStyle = {
  position: "relative",
  minWidth: 200,
  marginBottom: 8,
  padding: "12px 16px",
  borderRadius: 6,
  color: "#fff",
  fontSize: 14,
  overflow: "hidden",
  boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
};
const progressStyle = {
  position: "absolute",
  bottom: 0,
  left: 0,
  height: 3,
  width: "100%",
  background: "rgba(255,255,255,0.7)",
  animationName: "shrink",
};
