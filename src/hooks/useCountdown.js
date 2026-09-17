import { useEffect, useState } from "react";

function getTimeParts(msRemaining) {
  const clamped = Math.max(0, msRemaining);
  const totalSeconds = Math.floor(clamped / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return { days, hours, minutes, seconds, done: msRemaining <= 0 };
}

// Live countdown to a target ISO date string, updated every second.
export function useCountdown(targetIso) {
  const targetMs = new Date(targetIso).getTime();
  const [parts, setParts] = useState(() => getTimeParts(targetMs - Date.now()));

  useEffect(() => {
    const tick = () => setParts(getTimeParts(targetMs - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetMs]);

  return parts;
}
