import { useCallback, useEffect, useRef, useState } from "react";
import { WIN_SCORE } from "../config.js";
import { GAME_IMAGES, PLACEHOLDER_EMOJI } from "../assets/images/index.js";
import { sendWinEmail } from "../api/sendWinEmail.js";
import Confetti from "../components/Confetti.jsx";

const GAME_WIDTH = 340; // logical px, scaled by CSS to fit the viewport
const GAME_HEIGHT = 480;
const BASKET_WIDTH = 78;
const BASKET_HEIGHT = 78;
const BASKET_Y = GAME_HEIGHT - BASKET_HEIGHT - 8;
const BASKET_SPEED = 260; // px / second, keyboard movement
const DOODLE_SIZE = 40;
const LIVES_START = 3;
const SPAWN_INTERVAL_MS = 900;
const FALL_SPEED_MIN = 90;
const FALL_SPEED_MAX = 170;

let nextDoodleId = 0;

export default function GamePage() {
  const [basketX, setBasketX] = useState(GAME_WIDTH / 2 - BASKET_WIDTH / 2);
  const [doodles, setDoodles] = useState([]);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(LIVES_START);
  const [status, setStatus] = useState("playing"); // playing | won | lost
  const [emailStatus, setEmailStatus] = useState("idle"); // idle | sending | sent

  const basketXRef = useRef(basketX);
  const keysRef = useRef({ left: false, right: false });
  const dragXRef = useRef(null);
  const lastSpawnRef = useRef(0);
  const rafRef = useRef(null);
  const statusRef = useRef(status);
  const boardRef = useRef(null);

  statusRef.current = status;

  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === "ArrowLeft") keysRef.current.left = true;
      if (e.key === "ArrowRight") keysRef.current.right = true;
    }
    function onKeyUp(e) {
      if (e.key === "ArrowLeft") keysRef.current.left = false;
      if (e.key === "ArrowRight") keysRef.current.right = false;
    }
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  const handlePointerMove = useCallback((clientX) => {
    const board = boardRef.current;
    if (!board) return;
    const rect = board.getBoundingClientRect();
    const scale = rect.width / GAME_WIDTH;
    const localX = (clientX - rect.left) / scale;
    dragXRef.current = Math.max(
      0,
      Math.min(GAME_WIDTH - BASKET_WIDTH, localX - BASKET_WIDTH / 2)
    );
  }, []);

  useEffect(() => {
    let lastTime = performance.now();

    function loop(now) {
      const dt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;

      if (statusRef.current === "playing") {
        // Move basket from keyboard or drag input.
        let x = basketXRef.current;
        if (dragXRef.current !== null) {
          x = dragXRef.current;
        } else {
          if (keysRef.current.left) x -= BASKET_SPEED * dt;
          if (keysRef.current.right) x += BASKET_SPEED * dt;
        }
        x = Math.max(0, Math.min(GAME_WIDTH - BASKET_WIDTH, x));
        basketXRef.current = x;
        setBasketX(x);

        // Spawn new doodles.
        if (now - lastSpawnRef.current > SPAWN_INTERVAL_MS) {
          lastSpawnRef.current = now;
          setDoodles((prev) => [
            ...prev,
            {
              id: nextDoodleId++,
              x: Math.random() * (GAME_WIDTH - DOODLE_SIZE),
              y: -DOODLE_SIZE,
              speed:
                FALL_SPEED_MIN + Math.random() * (FALL_SPEED_MAX - FALL_SPEED_MIN),
            },
          ]);
        }

        // Advance doodles, detect catches / misses.
        setDoodles((prev) => {
          const basketLeft = basketXRef.current;
          const basketRight = basketLeft + BASKET_WIDTH;
          const basketTop = BASKET_Y;

          const next = [];
          let caught = 0;
          let missed = 0;

          for (const d of prev) {
            const y = d.y + d.speed * dt;
            const doodleBottom = y + DOODLE_SIZE;
            const doodleCenterX = d.x + DOODLE_SIZE / 2;

            const isCaught =
              doodleBottom >= basketTop &&
              doodleBottom <= basketTop + BASKET_HEIGHT &&
              doodleCenterX >= basketLeft &&
              doodleCenterX <= basketRight;

            if (isCaught) {
              caught += 1;
              continue; // remove from play
            }

            if (y > GAME_HEIGHT) {
              missed += 1;
              continue; // remove from play
            }

            next.push({ ...d, y });
          }

          if (caught > 0) {
            setScore((s) => Math.min(WIN_SCORE, s + caught));
          }
          if (missed > 0) {
            setLives((l) => Math.max(0, l - missed));
          }

          return next;
        });
      }

      rafRef.current = requestAnimationFrame(loop);
    }

    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  useEffect(() => {
    if (score >= WIN_SCORE && status === "playing") {
      setStatus("won");
    } else if (lives <= 0 && status === "playing") {
      setStatus("lost");
    }
  }, [score, lives, status]);

  useEffect(() => {
    if (status === "won" && emailStatus === "idle") {
      setEmailStatus("sending");
      sendWinEmail({ score }).finally(() => setEmailStatus("sent"));
    }
  }, [status, emailStatus, score]);

  function restart() {
    setDoodles([]);
    setScore(0);
    setLives(LIVES_START);
    setStatus("playing");
    setEmailStatus("idle");
    lastSpawnRef.current = performance.now();
  }

  const catImg = GAME_IMAGES.cat;
  const doodleImg = GAME_IMAGES.doodle;

  return (
    <div className="page page-game">
      <Confetti />
      <div className="game-wrap">
        <h1 className="game-title">Fånga ostbågarna! 🧀</h1>
        <p className="game-hint">
          Flytta katten med ← → pilarna, eller dra med fingret på mobilen.
        </p>

        <div className="game-hud">
          <span>Poäng: {score} / {WIN_SCORE}</span>
          <span>Liv: {"❤️".repeat(Math.max(0, lives))}</span>
        </div>

        <div
          ref={boardRef}
          className="game-board"
          style={{ aspectRatio: `${GAME_WIDTH} / ${GAME_HEIGHT}` }}
          onTouchMove={(e) => {
            e.preventDefault();
            handlePointerMove(e.touches[0].clientX);
          }}
          onTouchStart={(e) => handlePointerMove(e.touches[0].clientX)}
          onTouchEnd={() => {
            dragXRef.current = null;
          }}
          onMouseDown={(e) => handlePointerMove(e.clientX)}
          onMouseMove={(e) => {
            if (e.buttons === 1) handlePointerMove(e.clientX);
          }}
          onMouseUp={() => {
            dragXRef.current = null;
          }}
        >
          <div
            className="game-inner"
            style={{ width: GAME_WIDTH, height: GAME_HEIGHT }}
          >
            {doodles.map((d) => (
              <div
                key={d.id}
                className="game-doodle"
                style={{
                  left: d.x,
                  top: d.y,
                  width: DOODLE_SIZE,
                  height: DOODLE_SIZE,
                }}
              >
                {doodleImg ? (
                  <img src={doodleImg} alt="" className="game-sprite-img" />
                ) : (
                  <span className="game-sprite-emoji">{PLACEHOLDER_EMOJI.doodle}</span>
                )}
              </div>
            ))}

            <div
              className="game-basket"
              style={{
                left: basketX,
                top: BASKET_Y,
                width: BASKET_WIDTH,
                height: BASKET_HEIGHT,
              }}
            >
              {catImg ? (
                <img src={catImg} alt="Claudias katt" className="game-sprite-img" />
              ) : (
                <span className="game-sprite-emoji game-sprite-emoji-large">
                  {PLACEHOLDER_EMOJI.cat}
                </span>
              )}
            </div>

            {status !== "playing" && (
              <div className="game-overlay">
                {status === "won" ? (
                  <>
                    <h2>Du klarade det! 🎉</h2>
                    <p>Claudia fångade {score} ostbågar!</p>
                    <p className="game-overlay-sub">
                      {emailStatus === "sending"
                        ? "Skickar meddelande..."
                        : "Nästa steg väntar på dig! ✨"}
                    </p>
                    <a className="btn btn-primary" href="/gift-login">
                      Gå vidare →
                    </a>
                  </>
                ) : (
                  <>
                    <h2>Oj då! 😿</h2>
                    <p>Du tappade alla liv. Försök igen!</p>
                    <button className="btn btn-primary" onClick={restart}>
                      Försök igen
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
