import { Label, Artwork } from "./Shared";
const details = [
  {
    title: "A familiar kind of light.",
    text: "Round lamps, framed in polished metal. A clear expression with an unmistakably human warmth.",
    cls: "lamp",
    src: "lamp",
  },
  {
    title: "Character, in every line.",
    text: "A low-set grille and a sculpted nose. Nothing added that does not belong.",
    cls: "grille",
    src: "grille",
  },
  {
    title: "Elegance in motion.",
    text: "Fine wire spokes and a flowing wheel arch. The meeting of precision and poise.",
    cls: "wheel",
    src: "wheel",
  },
  {
    title: "A place to linger.",
    text: "Warm leather, tactile switches and analogue instruments. A cockpit made for being there.",
    cls: "interior",
    src: "cockpit",
  },
];
export default function Details() {
  return (
    <section className="section details">
      <div className="section-heading reveal">
        <div>
          <Label>03 — Signature details</Label>
          <h2>
            Nothing incidental.
            <br />
            <em>Everything considered.</em>
          </h2>
        </div>
        <p>
          The closer you look,
          <br />
          the more there is to discover.
        </p>
      </div>
      <div className="detail-grid">
        {details.map((d, i) => (
          <article key={d.title} className="detail reveal">
            <div className={`detail-image ${d.cls}`}>
              <Artwork
                src={d.src}
                alt={
                  [
                    "Close study of the Auren’s circular headlamp and front wing",
                    "Auren front grille rendered in fine ink and watercolor",
                    "Detailed wire wheel beneath the red sculpted wheel arch",
                    "Illustrated cognac leather and analogue dashboard",
                  ][i]
                }
              />
              <span>0{i + 1}</span>
            </div>
            <h3>{d.title}</h3>
            <p>{d.text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
