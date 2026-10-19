import React, { useEffect } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource/cormorant-garamond/latin-400.css";
import "@fontsource/cormorant-garamond/latin-400-italic.css";
import "@fontsource/cormorant-garamond/latin-500.css";
import "@fontsource/dm-sans/latin-400.css";
import "@fontsource/dm-sans/latin-500.css";
import "@fontsource/ibm-plex-mono/latin-400.css";
import "./style.css";

import Navigation from "./components/Navigation";
import MagneticCursor from "./components/MagneticCursor";
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
function App() {
  useEffect(() => {
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
    document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Navigation />
      <MagneticCursor />
      <main id="main">
        <Hero />
        <Philosophy />
        <DesignBoard />
        <Details />
        <Notebook />
        <Materials />
        <Specifications />
        <Roadster />
        <Registry />
      </main>
      <Footer />
    </>
  );
}

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
