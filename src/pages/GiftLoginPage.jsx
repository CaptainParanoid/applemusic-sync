import PasswordGate from "../components/PasswordGate.jsx";
import { STAGE4_PASSWORD, STORAGE_KEYS } from "../config.js";

export default function GiftLoginPage() {
  return (
    <PasswordGate
      title="Sista lösenordet! 🔑"
      subtitle="Ange lösenordet för att se din present."
      expectedPassword={STAGE4_PASSWORD}
      storageKey={STORAGE_KEYS.stage4Unlocked}
      redirectTo="/gift"
    />
  );
}
