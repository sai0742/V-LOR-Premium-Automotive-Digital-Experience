import { useCallback, useEffect, useRef, useState } from "react";
import {
  assemblies,
  separationWindows,
} from "../components/anatomy/assemblies";

const clamp = (v: number) => Math.max(0, Math.min(1, v));
const smoothstep = (v: number) => v * v * (3 - 2 * v);

/**
 * Native scroll, not scroll-jacking. One rAF per scroll/resize batch drives the
 * five SVG planes, camera, paper grid and leaders. Leaders are projected from
 * the actual transformed SVG anchors, so they stay attached in 3D perspective.
 */
export function useExplodedBlueprint() {
  const container = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const seekRef = useRef<(value: number, immediate?: boolean) => void>(
    () => {},
  );
  const [settings, setSettings] = useState(() => ({
    reducedMotion: matchMedia("(prefers-reduced-motion: reduce)").matches,
    compact: matchMedia("(max-height: 520px)").matches,
  }));
  const { reducedMotion, compact } = settings;
  const staticView = reducedMotion || compact;
  const [progress, setProgress] = useState(staticView ? 100 : 0);

  useEffect(() => {
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    const short = matchMedia("(max-height: 520px)");
    const change = () =>
      setSettings({ reducedMotion: motion.matches, compact: short.matches });
    motion.addEventListener("change", change);
    short.addEventListener("change", change);
    return () => {
      motion.removeEventListener("change", change);
      short.removeEventListener("change", change);
    };
  }, []);

  useEffect(() => {
    const root = container.current;
    const table = stage.current;
    if (!root || !table) return;
    const scene = table.querySelector<HTMLElement>(".anatomy-scene")!;
    const leaders = table.querySelector<SVGSVGElement>(".blueprint-leaders")!;
    const gridLine = table.querySelector<SVGPathElement>(".grid-drawing-line");
    const grid = table.querySelector<HTMLElement>(".draft-grid")!;
    const shadow = table.querySelector<HTMLElement>(".blueprint-shadow")!;
    const layers = assemblies.map((item) => ({
      assembly: item,
      layer: table.querySelector<HTMLElement>(`[data-part="${item.id}"]`)!,
      anchor: table.querySelector<SVGCircleElement>(
        `[data-anchor="${item.id}"]`,
      )!,
      label: table.querySelector<HTMLElement>(`[data-callout="${item.id}"]`)!,
      leader: table.querySelector<SVGPathElement>(
        `[data-leader="${item.id}"]`,
      )!,
      dot: table.querySelector<SVGCircleElement>(
        `[data-leader-dot="${item.id}"]`,
      )!,
    }));
    let raf = 0;
    let manual = staticView ? 1 : 0;
    let previous = -1;
    let alive = true;

    const metrics = () => ({
      start: root.getBoundingClientRect().top + scrollY - 72,
      travel: Math.max(1, root.offsetHeight - table.offsetHeight),
    });
    const render = () => {
      raf = 0;
      const { start, travel } = metrics();
      const p = staticView ? manual : clamp((scrollY - start) / travel);
      const e = smoothstep(p);
      const width = table.clientWidth;
      const spread = Math.max(
        0.45,
        Math.min(
          0.78,
          Math.max(0.62, width / 1500),
          (table.clientHeight - 300) / 600,
        ),
      );
      // Translate a cached grid texture; do not repaint a full-screen gradient
      // or cascade changing custom properties through thousands of SVG nodes.
      grid.style.transform = `translate3d(${(e * 18).toFixed(2)}px, ${(e * -24).toFixed(2)}px, 0)`;
      shadow.style.opacity = (1 - p * 0.85).toFixed(3);
      table.dataset.progress = p.toFixed(4);
      scene.style.transform = staticView
        ? "translate(-50%, -50%)"
        : `translate(-50%, -50%) rotateX(${(7 - e * 10).toFixed(2)}deg) rotateY(${(-13 + e * 23).toFixed(2)}deg) rotateZ(${(-4 + e * 5).toFixed(2)}deg)`;
      layers.forEach(({ assembly, layer, label }) => {
        const [separationStart, separationEnd] =
          separationWindows[assembly.id];
        const t = smoothstep(
          clamp(
            (p - separationStart) / (separationEnd - separationStart),
          ),
        );
        const labelStart = Math.max(0, separationStart - 0.025);
        const labelReveal = staticView
          ? 1
          : clamp((p - labelStart) / (separationEnd - labelStart));
        label.style.opacity = (0.68 + labelReveal * 0.32).toFixed(3);
        const [baseX, baseY, z] = assembly.offset;
        // Wider sheets need extra clearance under the full-size coachwork.
        // On phones the smaller drawing already leaves those layers exposed.
        const wide = clamp((width - 600) / 500);
        const x = baseX + (assembly.id === "cockpit" ? 30 * wide : 0);
        const y =
          baseY +
          (assembly.id === "coachwork"
            ? -75 * wide
            : assembly.id === "cockpit"
              ? 80 * wide
              : 0);
        layer.style.transform = `translate3d(${(x * t * spread).toFixed(2)}px, ${(y * t * spread).toFixed(2)}px, ${staticView ? 0 : (z * t * spread).toFixed(2)}px)`;
      });
      // Batch ALL geometry reads before writing any leader paths. Interleaving
      // these reads/writes would force five SVG layouts on every scroll frame.
      const bounds = table.getBoundingClientRect();
      const projection = layers.map(
        ({ assembly, anchor, label, leader, dot }) => {
          const a = anchor.getBoundingClientRect();
          const b = label.getBoundingClientRect();
          return {
            assembly,
            leader,
            dot,
            x: a.left + a.width / 2 - bounds.left,
            y: a.top + a.height / 2 - bounds.top,
            fromX: (assembly.side === "left" ? b.right : b.left) - bounds.left,
            fromY: b.top + b.height / 2 - bounds.top,
          };
        },
      );
      const viewBox = `0 0 ${bounds.width} ${bounds.height}`;
      if (leaders.getAttribute("viewBox") !== viewBox)
        leaders.setAttribute("viewBox", viewBox);
      projection.forEach(({ assembly, leader, dot, x, y, fromX, fromY }) => {
        const elbowX = fromX + (assembly.side === "left" ? 24 : -24);
        leader.setAttribute(
          "d",
          `M${fromX.toFixed(1)} ${fromY.toFixed(1)} H${elbowX.toFixed(1)} L${x.toFixed(1)} ${y.toFixed(1)}`,
        );
        const [separationStart, separationEnd] =
          separationWindows[assembly.id];
        const leaderStart = Math.max(0, separationStart - 0.025);
        const draw = staticView
          ? 1
          : clamp((p - leaderStart) / (separationEnd - leaderStart));
        leader.style.strokeDashoffset = (1 - draw).toFixed(4);
        dot.setAttribute("cx", x.toFixed(1));
        dot.setAttribute("cy", y.toFixed(1));
        dot.style.opacity = draw.toFixed(3);
      });
      if (gridLine) gridLine.style.strokeDashoffset = (1 - p).toFixed(4);
      const rounded = Math.round(p * 100);
      if (rounded !== previous) {
        previous = rounded;
        setProgress(rounded);
      }
    };
    const schedule = () => {
      if (alive && !raf) raf = requestAnimationFrame(render);
    };
    seekRef.current = (value, immediate = false) => {
      const target = clamp(value / 100);
      // A controlled range must not spring back to its old value while the
      // browser is delivering the resulting scroll/paint event.
      if (staticView || immediate) setProgress(Math.round(target * 100));
      if (staticView) {
        manual = target;
        schedule();
      } else {
        const { start, travel } = metrics();
        window.scrollTo({
          top: start + target * travel,
          behavior: immediate ? "instant" : "smooth",
        });
      }
    };
    const observer = new ResizeObserver(schedule);
    observer.observe(root);
    observer.observe(table);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    document.fonts.ready.then(schedule);
    render();
    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      observer.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      seekRef.current = () => {};
    };
  }, [staticView]);

  const seek = useCallback(
    (value: number, immediate = false) => seekRef.current(value, immediate),
    [],
  );
  return {
    container,
    stage,
    progress,
    reducedMotion,
    compact,
    staticView,
    seek,
  };
}
