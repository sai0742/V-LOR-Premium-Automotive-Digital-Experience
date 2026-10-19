import type React from "react";
export const Arrow = () => <span aria-hidden="true">↗</span>;
export const Label = ({ children }: { children: React.ReactNode }) => (
  <p className="eyebrow">{children}</p>
);
export function Artwork({
  src,
  alt,
  className = "",
  eager = false,
}: {
  src: string;
  alt: string;
  className?: string;
  eager?: boolean;
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
  return (
    <img
      className={className}
      src={`/images/${src}.webp`}
      alt={alt}
      loading={eager ? "eager" : "lazy"}
      fetchPriority={eager ? "high" : "auto"}
      width={width}
      height={height}
    />
  );
}
