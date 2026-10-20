import React, { useEffect } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource-variable/cormorant-garamond/wght.css";
import "@fontsource-variable/cormorant-garamond/wght-italic.css";
import "@fontsource/dm-sans/latin-400.css";
import "@fontsource/dm-sans/latin-500.css";
import "@fontsource/ibm-plex-mono/latin-400.css";
import "./style.css";
import "./styles/atelier.css";
import "./styles/experience.css";
import "./styles/anatomy.css";

import BrandIntro from "./components/BrandIntro";
import Navigation from "./components/Navigation";
import MagneticCursor from "./components/MagneticCursor";
import SvgDefs from "./components/SvgDefs";
import PaperTransition from "./components/PaperTransition";
import Hero from "./components/Hero";
import Philosophy from "./components/Philosophy";
import DesignBoard from "./components/DesignBoard";
import Details from "./components/Details";
import Notebook from "./components/Notebook";
import Materials from "./components/Materials";
import Specifications from "./components/Specifications";
import Roadster from "./components/Roadster";
import Registry from "./components/Registry";
import Footer from "./components/Footer";
import Anatomy from "./components/anatomy/Anatomy";
import { useArchiveRoute } from "./hooks/useArchiveRoute";
import { useInkReveals } from "./hooks/useInkReveals";

function App() {
  const { pathname, phase } = useArchiveRoute();
  const anatomy = pathname === "/anatomy";
  useInkReveals(pathname);
  useEffect(() => {
    const targets = document.querySelectorAll<HTMLElement>(".reveal");
    if (!("IntersectionObserver" in window)) {
      targets.forEach((el) => el.classList.add("in-view"));
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08 },
    );
    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [pathname]);
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <BrandIntro />
      <SvgDefs />
      <Navigation anatomy={anatomy} />
      <MagneticCursor />
      <div className="archive-view" key={pathname} inert={phase === "fold"}>
        <main id="main">
          {anatomy ? (
            <Anatomy />
          ) : (
            <>
              <Hero />
              <Philosophy />
              <DesignBoard />
              <Details />
              <Notebook />
              <Materials />
              <Specifications />
              <Roadster />
              <Registry />
            </>
          )}
        </main>
        <Footer anatomy={anatomy} />
      </div>
      <PaperTransition phase={phase} />
    </>
  );
}

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
