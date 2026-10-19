import { useEffect } from "react";

/** Progressive enhancement: text is readable even before the observer runs. */
export function useInkReveals(route: string) {
  useEffect(() => {
    const elements = document.querySelectorAll<HTMLElement>(
      "h1 em, h2 em, h3 em, .handnote, [data-ink-reveal]",
    );
    const calm = matchMedia("(prefers-reduced-motion: reduce)");
    elements.forEach((el) => el.classList.add("ink-reveal"));
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("ink-visible");
            observer.unobserve(entry.target);
          }
        }),
      { threshold: 0.3 },
    );
    const reveal = () => {
      elements.forEach((el) => {
        if (calm.matches) {
          el.classList.add("ink-visible");
          observer.unobserve(el);
        } else if (!el.classList.contains("ink-visible")) {
          observer.observe(el);
        }
      });
    };
    reveal();
    calm.addEventListener("change", reveal);
    return () => {
      observer.disconnect();
      calm.removeEventListener("change", reveal);
    };
  }, [route]);
}
