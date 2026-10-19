import { useEffect, useRef } from "react";

const MAGNET_SELECTOR = "[data-magnetic]";
const PULL = 10; // px, maximum magnetic travel in each axis

type Magnet = { tx: number; ty: number; cx: number; cy: number };

/**
 * Dual-ring magnetic cursor.
 *
 * A fast inner dot and a lazier outer ring trail the pointer; elements marked
 * `data-magnetic` (navigation, swatches, CTAs) are gently pulled toward the
 * pointer while hovered and ease back to rest on leave.
 *
 * Fallbacks: the layer is only mounted for fine pointers (mouse/trackpad) and
 * is fully disabled under `prefers-reduced-motion`, leaving the native cursor
 * and untouched transforms on touch devices and motion-sensitive visitors.
 */
export default function MagneticCursor() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = root.current;
    if (!node) return;
    const dot = node.querySelector<HTMLElement>(".cursor-dot");
    const ring = node.querySelector<HTMLElement>(".cursor-ring");
    if (!dot || !ring) return;

    const fine = window.matchMedia("(pointer: fine)");
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)");

    let enabled = false;
    let raf = 0;
    let seen = false;
    let px = window.innerWidth / 2;
    let py = window.innerHeight / 2;
    let dx = px;
    let dy = py;
    let rx = px;
    let ry = py;
    let hovered: HTMLElement | null = null;
    const magnets = new Map<HTMLElement, Magnet>();

    const tick = () => {
      dx += (px - dx) * 0.38;
      dy += (py - dy) * 0.38;
      rx += (px - rx) * 0.16;
      ry += (py - ry) * 0.16;
      dot.style.transform = `translate3d(${dx.toFixed(2)}px, ${dy.toFixed(2)}px, 0)`;
      ring.style.transform = `translate3d(${rx.toFixed(2)}px, ${ry.toFixed(2)}px, 0)`;
      magnets.forEach((m, el) => {
        m.cx += (m.tx - m.cx) * 0.18;
        m.cy += (m.ty - m.cy) * 0.18;
        if (m.tx === 0 && m.ty === 0 && Math.abs(m.cx) < 0.05 && Math.abs(m.cy) < 0.05) {
          m.cx = 0;
          m.cy = 0;
          if (el.style.transform) el.style.transform = "";
        } else {
          el.style.transform = `translate3d(${m.cx.toFixed(2)}px, ${m.cy.toFixed(2)}px, 0)`;
        }
      });
      raf = requestAnimationFrame(tick);
    };

    const refresh = () => {
      const on = fine.matches && !calm.matches;
      if (on === enabled) return;
      enabled = on;
      document.body.classList.toggle("has-cursor", on);
      node.classList.toggle("is-live", on);
      if (on) {
        raf = requestAnimationFrame(tick);
      } else {
        cancelAnimationFrame(raf);
        node.classList.remove("is-active");
        hovered = null;
        magnets.forEach((m, el) => {
          m.tx = 0;
          m.ty = 0;
          m.cx = 0;
          m.cy = 0;
          el.style.transform = "";
        });
      }
    };

    const onMove = (e: PointerEvent) => {
      if (!enabled || e.pointerType !== "mouse") return;
      px = e.clientX;
      py = e.clientY;
      if (!seen) {
        seen = true;
        dx = rx = px;
        dy = ry = py;
      }
      const target = e.target as Element | null;
      const el = target?.closest
        ? (target.closest(MAGNET_SELECTOR) as HTMLElement | null)
        : null;
      if (el !== hovered) {
        hovered = el;
        node.classList.toggle("is-active", !!el);
      }
      magnets.forEach((m) => {
        m.tx = 0;
        m.ty = 0;
      });
      if (hovered) {
        const box = hovered.getBoundingClientRect();
        const clamp = (v: number) => Math.max(-PULL, Math.min(PULL, v));
        const m = magnets.get(hovered);
        if (m) {
          m.tx = clamp((px - (box.left + box.width / 2)) * 0.28);
          m.ty = clamp((py - (box.top + box.height / 2)) * 0.34);
        }
      }
    };

    const register = () => {
      magnets.clear();
      document.querySelectorAll<HTMLElement>(MAGNET_SELECTOR).forEach((el) => {
        magnets.set(el, { tx: 0, ty: 0, cx: 0, cy: 0 });
      });
    };

    register();
    refresh();
    window.addEventListener("pointermove", onMove, { passive: true });
    fine.addEventListener("change", refresh);
    calm.addEventListener("change", refresh);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      fine.removeEventListener("change", refresh);
      calm.removeEventListener("change", refresh);
      document.body.classList.remove("has-cursor");
      magnets.forEach((_, el) => {
        el.style.transform = "";
      });
    };
  }, []);

  return (
    <div className="cursor" ref={root} aria-hidden="true">
      <span className="cursor-ring" />
      <span className="cursor-dot" />
    </div>
  );
}
