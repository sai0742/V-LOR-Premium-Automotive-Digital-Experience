import { useEffect, useRef } from "react";

const PULL = 10;
type Magnet = { tx: number; ty: number; cx: number; cy: number };

/**
 * An architect's crosshair and trailing drafting compass. Gallery artwork and
 * individual assemblies turn it into a loupe. Coordinates are live CSS-pixel
 * drafting coordinates. Event-delegated magnets survive SPA route changes.
 * The rAF sleeps at rest; coarse pointers, keyboard use and reduced motion
 * retain the native cursor. No pointer-follow state is rendered through React.
 */
export default function MagneticCursor() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = root.current;
    if (!node) return;
    const crosshair = node.querySelector<HTMLElement>(".cursor-dot")!;
    const compass = node.querySelector<HTMLElement>(".cursor-ring")!;
    const coordinates = node.querySelector<HTMLElement>(".cursor-coordinates")!;
    const fine = matchMedia("(pointer: fine)");
    const calm = matchMedia("(prefers-reduced-motion: reduce)");
    let enabled = false;
    let visible = false;
    let raf = 0;
    let px = innerWidth / 2;
    let py = innerHeight / 2;
    let dx = px;
    let dy = py;
    let rx = px;
    let ry = py;
    let hovered: HTMLElement | null = null;
    const magnets = new Map<HTMLElement, Magnet>();

    const tick = () => {
      raf = 0;
      dx += (px - dx) * 0.62;
      dy += (py - dy) * 0.62;
      rx += (px - rx) * 0.21;
      ry += (py - ry) * 0.21;
      crosshair.style.transform = `translate3d(${dx.toFixed(2)}px, ${dy.toFixed(2)}px, 0)`;
      compass.style.transform = `translate3d(${rx.toFixed(2)}px, ${ry.toFixed(2)}px, 0)`;
      coordinates.style.transform = `translate3d(${dx.toFixed(2)}px, ${dy.toFixed(2)}px, 0)`;
      let moving = Math.abs(px - rx) + Math.abs(py - ry) > 0.15;
      magnets.forEach((m, el) => {
        if (!el.isConnected) {
          magnets.delete(el);
          return;
        }
        m.cx += (m.tx - m.cx) * 0.18;
        m.cy += (m.ty - m.cy) * 0.18;
        if (!m.tx && !m.ty && Math.abs(m.cx) + Math.abs(m.cy) < 0.05) {
          m.cx = m.cy = 0;
          el.style.transform = "";
        } else {
          el.style.transform = `translate3d(${m.cx.toFixed(2)}px, ${m.cy.toFixed(2)}px, 0)`;
          moving ||= Math.abs(m.tx - m.cx) + Math.abs(m.ty - m.cy) > 0.05;
        }
      });
      if (moving && enabled) raf = requestAnimationFrame(tick);
    };
    const schedule = () => {
      if (!raf && enabled) raf = requestAnimationFrame(tick);
    };
    const show = (on: boolean) => {
      visible = on && enabled;
      node.classList.toggle("is-live", visible);
      document.body.classList.toggle("has-cursor", visible);
    };
    const release = () => {
      hovered = null;
      magnets.forEach((m) => {
        m.tx = m.ty = 0;
      });
      node.classList.remove("is-active", "is-loupe");
      schedule();
    };
    const refresh = () => {
      enabled = fine.matches && !calm.matches;
      if (!enabled) {
        cancelAnimationFrame(raf);
        raf = 0;
        release();
        show(false);
        magnets.forEach((m, el) => {
          m.tx = m.ty = m.cx = m.cy = 0;
          el.style.transform = "";
        });
      }
    };
    const targetAt = (target: Element | null) => {
      const el = target?.closest<HTMLElement>("[data-magnetic]") ?? null;
      if (el !== hovered) {
        release();
        hovered = el;
        node.classList.toggle("is-active", !!el);
      }
      node.classList.toggle("is-loupe", !!target?.closest("[data-loupe], img"));
      if (el) {
        let m = magnets.get(el);
        if (!m) {
          m = { tx: 0, ty: 0, cx: 0, cy: 0 };
          magnets.set(el, m);
        }
        const box = el.getBoundingClientRect();
        const clamp = (v: number) => Math.max(-PULL, Math.min(PULL, v));
        m.tx = clamp((px - (box.left + box.width / 2 - m.cx)) * 0.28);
        m.ty = clamp((py - (box.top + box.height / 2 - m.cy)) * 0.34);
      }
      schedule();
    };
    const onMove = (e: PointerEvent) => {
      if (!enabled || e.pointerType !== "mouse") return;
      px = e.clientX;
      py = e.clientY;
      if (!visible) {
        dx = rx = px;
        dy = ry = py;
      }
      show(true);
      coordinates.style.left = px > innerWidth - 95 ? "-95px" : "0px";
      coordinates.style.top = py > innerHeight - 55 ? "-55px" : "0px";
      coordinates.textContent = `X ${String(Math.round(px)).padStart(4, "0")}\nY ${String(Math.round(py)).padStart(4, "0")}`;
      targetAt(e.target instanceof Element ? e.target : null);
    };
    const onScroll = () => {
      if (enabled && visible) targetAt(document.elementFromPoint(px, py));
    };
    const onOut = (event: PointerEvent) => {
      if (!event.relatedTarget) {
        release();
        show(false);
      }
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Tab") {
        release();
        show(false);
      }
    };
    const onBlur = () => {
      release();
      show(false);
    };

    refresh();
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerout", onOut);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("keydown", onKey);
    window.addEventListener("blur", onBlur);
    fine.addEventListener("change", refresh);
    calm.addEventListener("change", refresh);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerout", onOut);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("blur", onBlur);
      fine.removeEventListener("change", refresh);
      calm.removeEventListener("change", refresh);
      document.body.classList.remove("has-cursor");
      magnets.forEach((_, el) => {
        el.style.transform = "";
      });
    };
  }, []);

  return (
    <div className="cursor cursor-drafting" ref={root} aria-hidden="true">
      <span className="cursor-ring">
        <svg className="cursor-compass" viewBox="0 0 64 64">
          <circle cx="32" cy="32" r="23" className="compass-orbit" />
          <path
            d="M18 49 L32 14 L46 49 M26 30 H38 M32 9 V18"
            className="compass-legs"
          />
          <path d="M18 49 l-2 5 M46 49 l2 5 M13 32 H18 M46 32 H51" />
          <path d="M10 25 A23 23 0 0 1 39 10" className="compass-accent" />
          <circle cx="32" cy="14" r="2.5" className="compass-pivot" />
        </svg>
        <svg className="cursor-loupe" viewBox="0 0 64 64">
          <circle cx="29" cy="28" r="18" />
          <circle cx="29" cy="28" r="14" className="loupe-glass" />
          <path d="M42 42 L55 55 M45 41 L57 53" className="loupe-handle" />
          <path d="M20 28 H38 M29 19 V37" className="compass-accent" />
          <path d="M17 24 A13 13 0 0 1 28 15" opacity=".4" />
        </svg>
      </span>
      <span className="cursor-dot">
        <svg viewBox="0 0 28 28">
          <path d="M2 14 H10 M18 14 H26 M14 2 V10 M14 18 V26" />
          <circle cx="14" cy="14" r="1.5" />
        </svg>
      </span>
      <span className="cursor-coordinates">{"X 0000\nY 0000"}</span>
    </div>
  );
}
