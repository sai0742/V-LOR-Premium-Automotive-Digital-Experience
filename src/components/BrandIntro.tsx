import { useCallback, useEffect, useRef, useState } from "react";

const STORAGE_KEY = "velore-brand-intro-seen-v1";
type IntroPhase = "showing" | "leaving" | "done";

function shouldPlayIntro() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches)
    return false;
  try {
    return window.localStorage.getItem(STORAGE_KEY) !== "seen";
  } catch {
    // A blocked storage API must never turn a brand flourish into a blocker.
    return false;
  }
}

/** A short, skippable introduction using the marque's existing emblem. */
export default function BrandIntro() {
  const [phase, setPhase] = useState<IntroPhase>(() =>
    shouldPlayIntro() ? "showing" : "done",
  );
  const [playsOnMount] = useState(() => phase === "showing");
  const timers = useRef<number[]>([]);

  const dismiss = useCallback(() => {
    timers.current.forEach(window.clearTimeout);
    timers.current = [];
    setPhase("done");
  }, []);

  useEffect(() => {
    if (!playsOnMount) return;

    try {
      window.localStorage.setItem(STORAGE_KEY, "seen");
    } catch {
      // The intro still completes normally when storage is unavailable.
    }

    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (motion.matches) {
      dismiss();
      return;
    }

    const leaveTimer = window.setTimeout(() => setPhase("leaving"), 1380);
    const finishTimer = window.setTimeout(dismiss, 1840);
    timers.current = [leaveTimer, finishTimer];

    const onMotionPreferenceChange = () => {
      if (motion.matches) dismiss();
    };
    motion.addEventListener("change", onMotionPreferenceChange);

    return () => {
      timers.current.forEach(window.clearTimeout);
      timers.current = [];
      motion.removeEventListener("change", onMotionPreferenceChange);
    };
  }, [dismiss, playsOnMount]);

  if (phase === "done") return null;

  return (
    <div
      className={`brand-intro${phase === "leaving" ? " is-leaving" : ""}`}
      data-phase={phase}
    >
      <button
        className="brand-intro-skip"
        type="button"
        onClick={dismiss}
        aria-label="Skip the Véloré introduction"
      >
        Skip <span aria-hidden="true">↗</span>
      </button>
      <div className="brand-intro-lockup">
        <img
          className="brand-intro-mark"
          src="/images/emblem-mark.webp"
          alt="Véloré winged V emblem"
          width="775"
          height="460"
          fetchPriority="high"
        />
        <p className="brand-intro-name">VÉLORÉ</p>
        <span className="brand-intro-rule" aria-hidden="true" />
        <p className="brand-intro-edition">THE VÉLORÉ ARCHIVE — VOL. 01</p>
      </div>
    </div>
  );
}
