import type React from "react";
import { useCallback, useRef } from "react";
export const Arrow = () => <span aria-hidden="true">↗</span>;
export const Label = ({ children }: { children: React.ReactNode }) => (
  <p className="eyebrow">{children}</p>
);

/**
 * Gallery artwork frame: full-color illustration under a warm sepia/halftone
 * print grain, with a pencil wireframe pass (SVG edge-extraction filter) that
 * cross-dissolves in on hover while the frame pans in subtle 3D parallax.
 * Parallax is pointer-fine only and disabled under reduced motion.
 */
export function Artwork({
  src,
  alt,
  className = "",
  eager = false,
  pointerParallax = true,
}: {
  src: string;
  alt: string;
  className?: string;
  eager?: boolean;
  pointerParallax?: boolean;
}) {
  const dimensions: Record<string, [number, number]> = {
    "auren-studio": [1584, 672],
    "sirene-studio": [1376, 768],
    cockpit: [1376, 768],
    notebook: [707, 502],
    lamp: [240, 260],
    grille: [280, 220],
    wheel: [295, 310],
  };
  const [width, height] = dimensions[src] ?? [1584, 672];
  const frame = useRef<HTMLDivElement>(null);

  const onMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const el = frame.current;
    if (!el || e.pointerType !== "mouse") return;
    if (
      !window.matchMedia("(pointer: fine)").matches ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;
    const r = el.getBoundingClientRect();
    const ax = ((e.clientX - r.left) / r.width - 0.5) * 2;
    const ay = ((e.clientY - r.top) / r.height - 0.5) * 2;
    el.style.setProperty("--ax", ax.toFixed(3));
    el.style.setProperty("--ay", ay.toFixed(3));
  }, []);

  const onLeave = useCallback(() => {
    const el = frame.current;
    if (!el) return;
    el.style.setProperty("--ax", "0");
    el.style.setProperty("--ay", "0");
  }, []);

  return (
    <div
      className={`art-frame ${className}`.trim()}
      ref={frame}
      data-loupe
      onPointerMove={pointerParallax ? onMove : undefined}
      onPointerLeave={pointerParallax ? onLeave : undefined}
    >
      <img
        className="art-base"
        src={`/images/${src}.webp`}
        alt={alt}
        loading={eager ? "eager" : "lazy"}
        fetchPriority={eager ? "high" : "auto"}
        width={width}
        height={height}
      />
      <img
        className="art-sketch"
        src={`/images/${src}.webp`}
        alt=""
        aria-hidden="true"
        loading={eager ? "eager" : "lazy"}
        width={width}
        height={height}
      />
    </div>
  );
}
