import { useState } from "react";
import { Label, Artwork } from "./Shared";
const materials = [
  {
    name: "Connolly-inspired leather",
    short: "Leather",
    color: "#9b5837",
    desc: "Supple cognac upholstery, imagined with a natural grain and hand-finished seams. A little richer with every journey.",
    cls: "leather",
    src: "cockpit",
  },
  {
    name: "Satin-finished aluminium",
    short: "Metal",
    color: "#aaa99f",
    desc: "Cool to the touch, softly reflective. Brushed metal gives the instrument panel a quiet, purposeful clarity.",
    cls: "metal",
    src: "cockpit",
  },
  {
    name: "Rouge Véloré",
    short: "Paint",
    color: "#C9232B",
    desc: "A deep racing red, chosen to bring every curve into the light. The signature finish of the Auren GT study.",
    cls: "paint",
    src: "auren-studio",
  },
  {
    name: "Open-grain walnut",
    short: "Walnut",
    color: "#61432f",
    desc: "Warm, finely figured wood balances the precision of metal. A natural material with a character all its own.",
    cls: "wood",
    src: "cockpit",
  },
];
export default function Materials() {
  const [active, setActive] = useState(0);
  const m = materials[active];
  return (
    <section className="section materials" id="craftsmanship">
      <div className="material-copy">
        <Label>05 — Materials & craftsmanship</Label>
        <h2>
          Made to be felt.
          <br />
          <em>Not just admired.</em>
        </h2>
        <p>
          The warmth of leather. The coolness of metal. The quiet depth of a
          considered finish. Materials are not decoration. They are the
          experience.
        </p>
        <div className="material-buttons" aria-label="Explore materials">
          {materials.map((item, i) => (
            <button
              key={item.short}
              aria-pressed={i === active}
              onClick={() => setActive(i)}
            >
              <span style={{ background: item.color }} />
              {item.short}
            </button>
          ))}
        </div>
        <div className="material-description" aria-live="polite">
          <Label>0{active + 1} / Material study</Label>
          <h3>{m.name}</h3>
          <p>{m.desc}</p>
        </div>
      </div>
      <div className={`material-art ${m.cls}`}>
        <Artwork
          src={m.src}
          alt={`Illustrated study of ${m.short.toLowerCase()} within the Auren GT concept`}
        />
        <span>THE TACTILE COLLECTION / 0{active + 1}</span>
      </div>
    </section>
  );
}
