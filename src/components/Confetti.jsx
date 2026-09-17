const COLORS = ["#ff6b6b", "#ffd166", "#06d6a0", "#4cc9f0", "#f77fbe", "#ffffff"];

// Lightweight decorative confetti background — purely CSS-driven, no deps.
export default function Confetti({ count = 24 }) {
  const pieces = Array.from({ length: count }, (_, i) => {
    const left = Math.random() * 100;
    const delay = Math.random() * 8;
    const duration = 8 + Math.random() * 6;
    const size = 6 + Math.random() * 8;
    const color = COLORS[i % COLORS.length];
    const rotate = Math.random() * 360;
    return { left, delay, duration, size, color, rotate, key: i };
  });

  return (
    <div className="confetti" aria-hidden="true">
      {pieces.map((p) => (
        <span
          key={p.key}
          className="confetti-piece"
          style={{
            left: `${p.left}%`,
            width: `${p.size}px`,
            height: `${p.size * 0.4}px`,
            backgroundColor: p.color,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            transform: `rotate(${p.rotate}deg)`,
          }}
        />
      ))}
    </div>
  );
}
