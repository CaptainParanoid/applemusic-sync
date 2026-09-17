import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BIRTHDAY_ISO } from "../config.js";
import { useCountdown } from "../hooks/useCountdown.js";
import Confetti from "../components/Confetti.jsx";

function Unit({ value, label }) {
  return (
    <div className="countdown-unit">
      <span className="countdown-value">{String(value).padStart(2, "0")}</span>
      <span className="countdown-label">{label}</span>
    </div>
  );
}

export default function CountdownPage() {
  const { days, hours, minutes, seconds, done } = useCountdown(BIRTHDAY_ISO);
  const navigate = useNavigate();

  useEffect(() => {
    if (done) {
      navigate("/login");
    }
  }, [done, navigate]);

  return (
    <div className="page page-countdown">
      <Confetti />
      <div className="countdown-card">
        <h1 className="headline">ÄR DET CLAUDIAS FÖDELSEDAG ÄNNU?</h1>
        <p className="answer-no">NEJ</p>
        <p className="countdown-intro">KOM TILLBAKA OM:</p>
        <div className="countdown-grid">
          <Unit value={days} label="dagar" />
          <Unit value={hours} label="timmar" />
          <Unit value={minutes} label="minuter" />
          <Unit value={seconds} label="sekunder" />
        </div>
      </div>
    </div>
  );
}
