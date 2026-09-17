import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { checkPassword, setUnlocked } from "../auth/checkPassword.js";
import Confetti from "./Confetti.jsx";

// Reusable password gate used by both /login (stage 2) and /gift-login
// (stage 4). Structured so the actual verification lives in
// src/auth/checkPassword.js and could move server-side later with no
// changes needed here.
export default function PasswordGate({
  expectedPassword,
  storageKey,
  redirectTo,
  title,
  subtitle,
}) {
  const [value, setValue] = useState("");
  const [error, setError] = useState(false);
  const [checking, setChecking] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setChecking(true);
    setError(false);

    const ok = await checkPassword(value, expectedPassword);

    if (ok) {
      setUnlocked(storageKey);
      navigate(redirectTo);
    } else {
      setError(true);
      setChecking(false);
    }
  }

  return (
    <div className="page page-gate">
      <Confetti />
      <form className="gate-card" onSubmit={handleSubmit}>
        <h1 className="gate-title">{title}</h1>
        {subtitle && <p className="gate-subtitle">{subtitle}</p>}
        <input
          type="password"
          className={`gate-input ${error ? "gate-input-error" : ""}`}
          placeholder="Lösenord"
          autoFocus
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setError(false);
          }}
        />
        {error && <p className="gate-error">Fel lösenord, försök igen! 🙈</p>}
        <button type="submit" className="btn btn-primary" disabled={checking}>
          Lås upp 🔓
        </button>
      </form>
    </div>
  );
}
