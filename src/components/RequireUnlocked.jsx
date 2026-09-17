import { Navigate } from "react-router-dom";
import { isUnlocked } from "../auth/checkPassword.js";

// Guards a route behind a previously-unlocked password gate. If the visitor
// hasn't unlocked this stage yet (no localStorage flag set), send them back
// to the gate instead of the protected page.
export default function RequireUnlocked({ storageKey, fallback, children }) {
  if (!isUnlocked(storageKey)) {
    return <Navigate to={fallback} replace />;
  }
  return children;
}
