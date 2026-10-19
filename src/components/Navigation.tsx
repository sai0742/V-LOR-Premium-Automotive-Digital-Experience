import { useEffect, useRef, useState } from "react";
import { Arrow } from "./Shared";
export default function Navigation() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLElement>(null);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);
  useEffect(() => {
    if (!open) return;
    const first = menu.current?.querySelector("a");
    first?.focus();
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        toggle.current?.focus();
      }
      if (e.key === "Tab") {
        const els = [...menu.current!.querySelectorAll("a"), toggle.current!];
        const i = els.indexOf(document.activeElement as HTMLAnchorElement);
        if (e.shiftKey && i === 0) {
          e.preventDefault();
          toggle.current?.focus();
        } else if (!e.shiftKey && i === els.length - 1) {
          e.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener("keydown", key);
    return () => document.removeEventListener("keydown", key);
  }, [open]);
  return (
    <header className={scrolled ? "nav scrolled" : "nav"}>
      <a href="#top" className="brand" aria-label="Véloré home">
        <img src="/images/emblem-mark.webp" alt="" />
        <span>VÉLORÉ</span>
      </a>
      <nav
        ref={menu}
        id="main-navigation"
        className={open ? "navlinks open" : "navlinks"}
        aria-label="Main navigation"
      >
        {[
          ["Collection", "collection"],
          ["The marque", "marque"],
          ["Craftsmanship", "craftsmanship"],
          ["Journal", "journal"],
        ].map(([name, id]) => (
          <a key={id} href={`#${id}`} data-magnetic onClick={() => setOpen(false)}>
            {name}
          </a>
        ))}
      </nav>
      <a className="nav-cta" href="#registry" data-magnetic>
        The registry <Arrow />
      </a>
      <button
        ref={toggle}
        className="menu-toggle"
        aria-expanded={open}
        aria-controls="main-navigation"
        onClick={() => setOpen(!open)}
      >
        {open ? "Close −" : "Menu +"}
      </button>
    </header>
  );
}
