import { BrowserRouter, Routes, Route } from "react-router-dom";
import CountdownPage from "./pages/CountdownPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import GamePage from "./pages/GamePage.jsx";
import GiftLoginPage from "./pages/GiftLoginPage.jsx";
import GiftPage from "./pages/GiftPage.jsx";
import RequireUnlocked from "./components/RequireUnlocked.jsx";
import { STORAGE_KEYS } from "./config.js";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<CountdownPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/game"
          element={
            <RequireUnlocked storageKey={STORAGE_KEYS.stage2Unlocked} fallback="/login">
              <GamePage />
            </RequireUnlocked>
          }
        />
        <Route path="/gift-login" element={<GiftLoginPage />} />
        <Route
          path="/gift"
          element={
            <RequireUnlocked storageKey={STORAGE_KEYS.stage4Unlocked} fallback="/gift-login">
              <GiftPage />
            </RequireUnlocked>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
