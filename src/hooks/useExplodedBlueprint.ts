import { useCallback, useEffect, useRef, useState } from "react";
import {
  assemblies,
  separationWindows,
} from "../components/anatomy/assemblies";
import type { AssemblyId } from "../components/anatomy/assemblies";
import type { AnatomyScene } from "../three/anatomyScene";

const clamp = (value: number) => Math.max(0, Math.min(1, value));

const FALLBACK_ANCHORS: Record<AssemblyId, readonly [number, number]> = {
  coachwork: [0.42, 0.37],
  chassis: [0.58, 0.63],
  powertrain: [0.45, 0.54],
  cockpit: [0.58, 0.45],
  suspension: [0.34, 0.69],
};

/**
 * One scroll value drives the whole plate: a damped target feeds the WebGL
 * camera and the separating assemblies, while the type, leaders and anchors
 * respond to the exact scroll position so the annotation never lags behind the
 * mechanical thought. The WebGL chunk is loaded only when the atelier is on
 * screen; the vector plates carry the page until it arrives.
 */
export function useExplodedBlueprint({
  selected,
  hovered,
}: {
  selected: AssemblyId | null;
  hovered: AssemblyId | null;
}) {
  const container = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const propsLayer = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<AnatomyScene | null>(null);
  const scheduleRef = useRef<() => void>(() => {});
  const seekRef = useRef<(value: number, immediate?: boolean) => void>(
    () => {},
  );
  const selectedRef = useRef<AssemblyId | null>(selected);
  const hoveredRef = useRef<AssemblyId | null>(hovered);
  const [webgl, setWebgl] = useState<"loading" | "ready" | "unavailable">(
    "loading",
  );
  const [settings, setSettings] = useState(() => ({
    reducedMotion: matchMedia("(prefers-reduced-motion: reduce)").matches,
    compact: matchMedia("(max-height: 520px)").matches,
  }));
  const { reducedMotion, compact } = settings;
  const staticView = reducedMotion || compact;
  const [progress, setProgress] = useState(staticView ? 100 : 0);

  useEffect(() => {
    selectedRef.current = selected;
    hoveredRef.current = hovered;
    scheduleRef.current();
  }, [selected, hovered]);

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
    const layerHost = propsLayer.current;
    const canvasElement = canvas.current;
    if (!root || !table || !layerHost || !canvasElement) return;

    const leaders = table.querySelector<SVGSVGElement>(".blueprint-leaders");
    const grid = table.querySelector<HTMLElement>(".draft-grid");
    const layers = assemblies.map((assembly) => ({
      assembly,
      layer: table.querySelector<HTMLElement>(`[data-part="${assembly.id}"]`),
      callout: table.querySelector<HTMLElement>(
        `[data-callout="${assembly.id}"]`,
      ),
      leader: table.querySelector<SVGPathElement>(
        `[data-leader="${assembly.id}"]`,
      ),
      dot: table.querySelector<SVGCircleElement>(
        `[data-leader-dot="${assembly.id}"]`,
      ),
    }));

    let raf = 0;
    let alive = true;
    let visible = true;
    let manual = staticView ? 1 : 0;
    let current = staticView ? 1 : 0;
    let lastTime = 0;
    let lastRounded = -1;
    let scene: AnatomyScene | null = null;
    const pointer = { x: 0, y: 0 };
    const pointerTarget = { x: 0, y: 0 };

    const metrics = () => ({
      start: root.getBoundingClientRect().top + scrollY - 72,
      travel: Math.max(1, root.offsetHeight - table.offsetHeight),
    });

    const render = (now: number) => {
      raf = 0;
      if (!alive) return;
      const { start, travel } = metrics();
      const raw = staticView ? manual : clamp((scrollY - start) / travel);
      if (!lastTime) lastTime = now;
      const dt = Math.min(0.05, Math.max(0.001, (now - lastTime) / 1000));
      lastTime = now;
      const chase = staticView ? 1 : 1 - Math.exp(-dt * 4.6);
      current += (raw - current) * chase;
      if (Math.abs(raw - current) < 0.0006) current = raw;
      const pointerChase = 1 - Math.exp(-dt * 3.4);
      pointer.x += (pointerTarget.x - pointer.x) * pointerChase;
      pointer.y += (pointerTarget.y - pointer.y) * pointerChase;

      if (scene)
        scene.render({
          progress: current,
          calm: staticView,
          pointer,
          selected: selectedRef.current,
          hovered: hoveredRef.current,
        });

      const bounds = table.getBoundingClientRect();
      const width = bounds.width;
      const height = bounds.height;
      const scale = 1.006 + Math.min(1, Math.max(0, raw)) * 0.014;
      const centreX = width / 2;
      const centreY = height / 2;
      layerHost.style.transform = `scale(${scale.toFixed(5)})`;
      layerHost.style.transformOrigin = "50% 50%";

      const projected = scene?.anchors();
      const points = {} as Record<AssemblyId, { x: number; y: number }>;
      Object.entries(FALLBACK_ANCHORS).forEach(([id, [fx, fy]]) => {
        points[id as AssemblyId] = { x: fx * width, y: fy * height };
      });
      if (projected)
        (Object.keys(projected) as AssemblyId[]).forEach((id) => {
          points[id] = projected[id];
        });

      layers.forEach(({ assembly, layer, callout }) => {
        const reveal = staticView
          ? 1
          : clamp(
              (raw - separationWindows[assembly.id][0] + 0.06) /
                (separationWindows[assembly.id][1] -
                  separationWindows[assembly.id][0] +
                  0.06),
            );
        const point = points[assembly.id];
        const x = centreX + (point.x - centreX) / scale;
        const y = centreY + (point.y - centreY) / scale;
        if (layer) {
          layer.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0)`;
          layer.style.setProperty("--reveal", reveal.toFixed(3));
          // The projected (screen-space) anchor, before the sheet's own scale.
          layer.dataset.anchorX = point.x.toFixed(2);
          layer.dataset.anchorY = point.y.toFixed(2);
        }
        if (callout) callout.style.opacity = (0.68 + reveal * 0.32).toFixed(3);
      });

      // Leaders are drawn from the live controls to the live anchors.
      if (leaders) {
        const viewBox = `0 0 ${width} ${height}`;
        if (leaders.getAttribute("viewBox") !== viewBox)
          leaders.setAttribute("viewBox", viewBox);
        layers.forEach(({ assembly, callout, leader, dot }) => {
          if (!leader || !dot || !callout) return;
          // Use the same numbers that positioned the anchor this frame; a layout
          // read here could report a stale box while scrolling.
          const { x, y } = points[assembly.id];
          const calloutBox = callout.getBoundingClientRect();
          const fromX =
            (assembly.side === "left" ? calloutBox.right : calloutBox.left) -
            bounds.left;
          const fromY = calloutBox.top + calloutBox.height / 2 - bounds.top;
          const elbow = fromX + (assembly.side === "left" ? 26 : -26);
          leader.setAttribute(
            "d",
            `M${fromX.toFixed(1)} ${fromY.toFixed(1)} H${elbow.toFixed(1)} L${x.toFixed(1)} ${y.toFixed(1)}`,
          );
          const [startWindow, endWindow] = separationWindows[assembly.id];
          const leaderStart = Math.max(0, startWindow - 0.02);
          const draw = staticView
            ? 1
            : clamp((raw - leaderStart) / (endWindow - leaderStart));
          leader.style.strokeDashoffset = (1 - draw).toFixed(4);
          dot.setAttribute("cx", x.toFixed(1));
          dot.setAttribute("cy", y.toFixed(1));
          dot.style.opacity = draw.toFixed(3);
        });
      }

      if (grid)
        grid.style.transform = `translate3d(${(raw * 18).toFixed(2)}px, ${(raw * -24).toFixed(2)}px, 0)`;
      table.dataset.progress = raw.toFixed(4);

      const rounded = Math.round(raw * 100);
      if (rounded !== lastRounded) {
        lastRounded = rounded;
        setProgress(rounded);
      }

      const pointerBusy =
        Math.abs(pointerTarget.x - pointer.x) +
          Math.abs(pointerTarget.y - pointer.y) >
        0.001;
      const unsettled =
        Math.abs(raw - current) > 0.0005 || pointerBusy || !lastTime;
      if (visible && unsettled) raf = requestAnimationFrame(render);
    };

    const schedule = () => {
      if (!alive || !visible) return;
      if (visible) lastTime = 0;
      if (!raf) raf = requestAnimationFrame(render);
    };
    scheduleRef.current = schedule;

    seekRef.current = (value, immediate = false) => {
      const target = clamp(value / 100);
      if (staticView || immediate) setProgress(Math.round(target * 100));
      if (staticView) {
        manual = target;
        current = target;
        pointerTarget.x = 0;
        pointerTarget.y = 0;
        schedule();
      } else {
        const { start, travel } = metrics();
        window.scrollTo({
          top: start + target * travel,
          behavior: immediate ? "instant" : "smooth",
        });
      }
    };

    const onPointer = (event: PointerEvent) => {
      if (staticView || event.pointerType !== "mouse") return;
      const bounds = table.getBoundingClientRect();
      pointerTarget.x = clamp(
        ((event.clientX - bounds.left) / Math.max(1, bounds.width)) * 2 - 1,
      );
      pointerTarget.y = clamp(
        ((event.clientY - bounds.top) / Math.max(1, bounds.height)) * 2 - 1,
      );
      schedule();
    };
    const onLeave = () => {
      pointerTarget.x = 0;
      pointerTarget.y = 0;
      schedule();
    };

    const observer = new ResizeObserver(() => {
      scene?.resize();
      schedule();
    });
    observer.observe(root);
    observer.observe(table);

    const visibility =
      "IntersectionObserver" in window
        ? new IntersectionObserver(
            (entries) => {
              visible = entries.some((entry) => entry.isIntersecting);
              if (visible) schedule();
            },
            { rootMargin: "10% 0px" },
          )
        : null;
    visibility?.observe(table);

    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    window.addEventListener("pointermove", onPointer, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    document.fonts.ready.then(schedule);

    import("../three/anatomyScene")
      .then(({ createAnatomyScene }) => {
        if (!alive) return;
        try {
          scene = createAnatomyScene(canvasElement);
          sceneRef.current = scene;
          scene.resize();
          table.dataset.webgl = "on";
          setWebgl("ready");
        } catch {
          table.dataset.webgl = "off";
          setWebgl("unavailable");
        }
        schedule();
      })
      .catch(() => {
        if (!alive) return;
        table.dataset.webgl = "off";
        setWebgl("unavailable");
        schedule();
      });

    schedule();

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      observer.disconnect();
      visibility?.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      window.removeEventListener("pointermove", onPointer);
      document.removeEventListener("pointerleave", onLeave);
      scene?.dispose();
      scene = null;
      sceneRef.current = null;
      scheduleRef.current = () => {};
      seekRef.current = () => {};
    };
    // staticView changes how the timeline is driven, not which DOM is observed.
  }, [staticView]);

  const seek = useCallback(
    (value: number, immediate = false) => seekRef.current(value, immediate),
    [],
  );

  return {
    container,
    stage,
    sceneLayer: propsLayer,
    canvas,
    progress,
    reducedMotion,
    compact,
    staticView,
    seek,
    webgl,
  };
}
