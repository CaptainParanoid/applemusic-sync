import Confetti from "../components/Confetti.jsx";

// TODO(Tina): example placeholder date ranges — replace with the real
// options you're considering before sending this to Claudia.
const EXAMPLE_DATE_RANGES = [
  "16–23 maj 2027",
  "4–11 juli 2027",
  "12–19 september 2027",
];

export default function GiftPage() {
  return (
    <div className="page page-gift">
      <Confetti />
      <div className="gift-card">
        {/* TODO(Tina): replace this placeholder block with the group's
            real photo, e.g. <img src={groupPhoto} alt="..." /> */}
        <div className="gift-hero-placeholder" role="img" aria-label="Gruppfoto (platshållare)">
          <span>📸</span>
          <span className="gift-hero-caption">TODO: gruppfoto här</span>
        </div>

        <h1 className="gift-title">Ni ska åka till Portugal! 🇵🇹</h1>
        <p className="gift-text">Grattis på födelsedagen, Claudia! 🎂🎉</p>

        <div className="gift-dates">
          <p className="gift-dates-title">Förslag på resedatum:</p>
          <ul className="gift-dates-list">
            {EXAMPLE_DATE_RANGES.map((range) => (
              <li key={range}>{range}</li>
            ))}
          </ul>
          <p className="gift-dates-note">
            Skicka oss ett meddelande om vilket datum som passar!
          </p>
        </div>
      </div>
    </div>
  );
}
