import PasswordGate from "../components/PasswordGate.jsx";
import { STAGE2_PASSWORD, STORAGE_KEYS } from "../config.js";

export default function LoginPage() {
  return (
    <PasswordGate
      title="Grattis, det är dags! 🎉"
      subtitle="Ange lösenordet för att komma till nästa del."
      expectedPassword={STAGE2_PASSWORD}
      storageKey={STORAGE_KEYS.stage2Unlocked}
      redirectTo="/game"
    />
  );
}
