import { useEffect, useLayoutEffect, useRef, useState } from "react";

export type ArchivePath = "/" | "/anatomy";
export type PaperPhase = "fold" | "unfold" | null;
type Route = {
  pathname: ArchivePath;
  hash: string;
  scroll: number;
  focus: boolean;
  revision: number;
};
const pathOf = (path: string): ArchivePath =>
  path.replace(/\/$/, "") === "/anatomy" ? "/anatomy" : "/";

const anchorFor = (hash: string) => {
  try {
    return document.getElementById(decodeURIComponent(hash.slice(1)));
  } catch {
    return document.getElementById(hash.slice(1));
  }
};

/** A small two-view History API router. Native in-page anchors stay native. */
export function useArchiveRoute() {
  const [route, setRoute] = useState<Route>(() => ({
    pathname: pathOf(window.location.pathname),
    hash: window.location.hash,
    scroll: 0,
    focus: false,
    revision: 0,
  }));
  const [phase, setPhase] = useState<PaperPhase>(null);
  const routeRef = useRef(route);
  const scrollPositions = useRef(new Map<string, number>());

  useEffect(() => {
    let busy = false;
    let coverTimer = 0;
    let revealTimer = 0;
    const oldRestoration = history.scrollRestoration;
    history.scrollRestoration = "manual";

    const navigate = (url: URL, push: boolean) => {
      clearTimeout(coverTimer);
      clearTimeout(revealTimer);
      const previous = routeRef.current;
      scrollPositions.current.set(previous.pathname + previous.hash, scrollY);
      const commit = () => {
        if (push) history.pushState(null, "", url.pathname + url.hash);
        const next: Route = {
          pathname: pathOf(url.pathname),
          hash: url.hash,
          scroll: push
            ? 0
            : (scrollPositions.current.get(pathOf(url.pathname) + url.hash) ??
              0),
          focus: true,
          revision: previous.revision + 1,
        };
        routeRef.current = next;
        setRoute(next);
      };
      if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
        commit();
        setPhase(null);
        busy = false;
        return;
      }
      busy = true;
      setPhase("fold");
      coverTimer = window.setTimeout(() => {
        commit();
        setPhase("unfold");
        revealTimer = window.setTimeout(() => {
          setPhase(null);
          busy = false;
        }, 650);
      }, 420);
    };

    const onClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      )
        return;
      const target = event.target;
      if (!(target instanceof Element)) return;
      const link = target.closest<HTMLAnchorElement>("a[href]");
      if (
        !link ||
        link.hasAttribute("download") ||
        (link.target && link.target !== "_self")
      )
        return;
      const url = new URL(link.href, location.href);
      if (
        url.origin !== location.origin ||
        !["/", "/anatomy", "/anatomy/"].includes(url.pathname)
      )
        return;
      if (pathOf(url.pathname) === routeRef.current.pathname) return;
      event.preventDefault();
      if (!busy) navigate(url, true);
    };
    const onPop = () => {
      const url = new URL(location.href);
      if (pathOf(url.pathname) !== routeRef.current.pathname || busy) {
        navigate(url, false);
      } else {
        routeRef.current = { ...routeRef.current, hash: url.hash };
        const target = url.hash ? anchorFor(url.hash) : null;
        if (target)
          target.scrollIntoView({ behavior: "instant", block: "start" });
        else
          window.scrollTo({
            top:
              scrollPositions.current.get(pathOf(url.pathname) + url.hash) ?? 0,
            behavior: "instant",
          });
      }
    };
    const onHash = () => {
      routeRef.current = { ...routeRef.current, hash: location.hash };
    };
    document.addEventListener("click", onClick);
    window.addEventListener("popstate", onPop);
    window.addEventListener("hashchange", onHash);
    return () => {
      clearTimeout(coverTimer);
      clearTimeout(revealTimer);
      document.removeEventListener("click", onClick);
      window.removeEventListener("popstate", onPop);
      window.removeEventListener("hashchange", onHash);
      history.scrollRestoration = oldRestoration;
    };
  }, []);

  useLayoutEffect(() => {
    document.title =
      route.pathname === "/anatomy"
        ? "The Anatomy Atelier — VÉLORÉ"
        : "VÉLORÉ — The Art of the Long Way";
    window.scrollTo({ top: route.scroll, behavior: "instant" });
    const frame = requestAnimationFrame(() => {
      const target = route.hash ? anchorFor(route.hash) : null;
      if (target)
        target.scrollIntoView({ behavior: "instant", block: "start" });
      if (route.focus) {
        const heading = document.querySelector<HTMLElement>("main h1");
        heading?.setAttribute("tabindex", "-1");
        heading?.focus({ preventScroll: true });
      }
    });
    return () => cancelAnimationFrame(frame);
  }, [route]);

  return { pathname: route.pathname, phase };
}
