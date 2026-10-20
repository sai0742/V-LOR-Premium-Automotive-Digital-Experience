import { useCallback, useEffect, useRef, useState } from "react";
import type React from "react";
import { Artwork } from "./Shared";

type Motion = {
  currentX: number;
  currentY: number;
  targetX: number;
  targetY: number;
};

type DragStart = {
  pointerId: number;
  pointerX: number;
  originX: number;
};

const clamp = (value: number) => Math.max(-1, Math.min(1, value));

/**
 * Pointer-directed, limited-view inspection of the existing Auren illustration.
 * This moves the complete image plane as one object; it is not a 3D model or a
 * simulated 360-degree view. No image is stretched, skewed, or angle-swapped.
 */
export default function VehicleStudy() {
  const stage = useRef<HTMLDivElement>(null);
  const imagePlane = useRef<HTMLDivElement>(null);
  const motion = useRef<Motion>({
    currentX: 0,
    currentY: 0,
    targetX: 0,
    targetY: 0,
  });
  const dragStart = useRef<DragStart | null>(null);
  const frame = useRef(0);
  const motionPreference = useRef<MediaQueryList | null>(null);
  const [motionReduced, setMotionReduced] = useState(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const isMotionReduced = useCallback(
    () => motionPreference.current?.matches ?? false,
    [],
  );

  const animate = useCallback(() => {
    frame.current = 0;
    const plane = imagePlane.current;
    if (!plane) return;

    const value = motion.current;
    value.currentX += (value.targetX - value.currentX) * 0.16;
    value.currentY += (value.targetY - value.currentY) * 0.16;
    if (Math.abs(value.targetX - value.currentX) < 0.01)
      value.currentX = value.targetX;
    if (Math.abs(value.targetY - value.currentY) < 0.01)
      value.currentY = value.targetY;

    // A restrained whole-plate drift gives the cursor a tactile response while
    // keeping the single supplied vehicle view geometrically honest.
    const width = stage.current?.clientWidth ?? 0;
    const horizontalRange = Math.min(14, width * 0.014);
    const verticalRange = Math.min(5, width * 0.005);
    plane.style.setProperty(
      "--pose-x",
      `${(value.currentX * horizontalRange).toFixed(2)}px`,
    );
    plane.style.setProperty(
      "--pose-y",
      `${(value.currentY * verticalRange).toFixed(2)}px`,
    );

    if (
      Math.abs(value.targetX - value.currentX) >= 0.01 ||
      Math.abs(value.targetY - value.currentY) >= 0.01
    ) {
      frame.current = requestAnimationFrame(animate);
    }
  }, []);

  const schedule = useCallback(() => {
    if (!frame.current) frame.current = requestAnimationFrame(animate);
  }, [animate]);

  const setTarget = useCallback(
    (x: number, y: number) => {
      if (isMotionReduced()) return;
      motion.current.targetX = clamp(x);
      motion.current.targetY = clamp(y);
      schedule();
    },
    [isMotionReduced, schedule],
  );

  const onPointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const bounds = event.currentTarget.getBoundingClientRect();
      if (!bounds.width || !bounds.height) return;

      if (event.pointerType === "touch") {
        const start = dragStart.current;
        if (!start || start.pointerId !== event.pointerId) return;
        const delta = (event.clientX - start.pointerX) / (bounds.width * 0.48);
        setTarget(start.originX + delta, 0);
        return;
      }

      const x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 2;
      const y = ((event.clientY - bounds.top) / bounds.height - 0.5) * 2;
      setTarget(x, y * 0.55);
    },
    [setTarget],
  );

  const onPointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (event.pointerType !== "touch" || isMotionReduced()) return;
      dragStart.current = {
        pointerId: event.pointerId,
        pointerX: event.clientX,
        originX: motion.current.targetX,
      };
      try {
        event.currentTarget.setPointerCapture(event.pointerId);
      } catch {
        // Synthetic pointer events used by assistive/browser tests have no active pointer to capture.
      }
    },
    [isMotionReduced],
  );

  const onPointerUp = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (event.pointerType === "touch") dragStart.current = null;
    },
    [],
  );

  const onPointerLeave = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (event.pointerType !== "touch" && !dragStart.current) setTarget(0, 0);
    },
    [setTarget],
  );

  const onKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (isMotionReduced()) return;
      const { targetX, targetY } = motion.current;
      switch (event.key) {
        case "ArrowLeft":
          setTarget(targetX - 0.2, targetY);
          break;
        case "ArrowRight":
          setTarget(targetX + 0.2, targetY);
          break;
        case "ArrowUp":
          setTarget(targetX, targetY - 0.2);
          break;
        case "ArrowDown":
          setTarget(targetX, targetY + 0.2);
          break;
        case "Home":
        case "Escape":
          setTarget(0, 0);
          break;
        default:
          return;
      }
      event.preventDefault();
    },
    [isMotionReduced, setTarget],
  );

  const recenter = useCallback(() => setTarget(0, 0), [setTarget]);

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    motionPreference.current = preference;
    const syncMotionPreference = () => {
      setMotionReduced(preference.matches);
      if (!preference.matches) return;
      dragStart.current = null;
      motion.current = { currentX: 0, currentY: 0, targetX: 0, targetY: 0 };
      if (frame.current) cancelAnimationFrame(frame.current);
      frame.current = 0;
      imagePlane.current?.style.setProperty("--pose-x", "0px");
      imagePlane.current?.style.setProperty("--pose-y", "0px");
    };
    preference.addEventListener("change", syncMotionPreference);
    return () => {
      preference.removeEventListener("change", syncMotionPreference);
      motionPreference.current = null;
    };
  }, []);

  useEffect(
    () => () => {
      if (frame.current) cancelAnimationFrame(frame.current);
    },
    [],
  );

  return (
    <>
      <div
        ref={stage}
        className="vehicle-view"
        role="group"
        tabIndex={motionReduced ? undefined : 0}
        aria-label={
          motionReduced
            ? "Auren GT still illustration. Movement is paused for the reduced-motion preference; this is not a 360-degree model."
            : "Auren GT illustrated inspection. Pointer movement or horizontal touch-drag gently shifts the complete image; arrow keys adjust it. This is a single-view illustration, not a 360-degree model."
        }
        aria-describedby="vehicle-study-instructions"
        onPointerMove={onPointerMove}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onPointerLeave={onPointerLeave}
        onKeyDown={onKeyDown}
      >
        <div className="vehicle-image-plane" ref={imagePlane}>
          <Artwork
            src="auren-studio"
            alt="Auren GT body study showing sculpted red bodywork and fastback proportions"
            eager
            pointerParallax={false}
          />
        </div>
      </div>
      <div
        className="vehicle-study-instructions"
        id="vehicle-study-instructions"
      >
        <span className="vehicle-study-gesture">
          {motionReduced
            ? "STATIC STUDY · MOVEMENT PAUSED"
            : "MOVE POINTER · DRAG · ARROW KEYS TO INSPECT"}
        </span>
        <span className="vehicle-study-limit">
          SINGLE-VIEW ILLUSTRATION · NOT A 360° MODEL
        </span>
        {!motionReduced && (
          <button type="button" onClick={recenter}>
            Return to centre <span aria-hidden="true">↺</span>
          </button>
        )}
      </div>
    </>
  );
}
