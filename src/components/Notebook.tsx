import { Label, Artwork } from "./Shared";
export default function Notebook() {
  return (
    <section className="section notebook" id="journal">
      <div className="notebook-portal reveal">
        <a
          className="notebook-art"
          href="/anatomy"
          aria-label="Explore Technical Disassembly"
        >
          <div className="tape" aria-hidden="true" />
          <Artwork
            src="notebook"
            alt="Supplied pencil development sketches with side profile, mirror studies and handwritten notes"
          />
          <span className="handnote">It always begins with a line.</span>
          <span className="paper-ref">STUDIO NOTES / SHEET 07</span>
          <span className="notebook-portal-badge" data-magnetic>
            Explore Technical Disassembly <span aria-hidden="true">→</span>
          </span>
          <span className="portal-corner" aria-hidden="true">
            ↗
          </span>
        </a>
        <span className="notebook-portal-caption">
          <i aria-hidden="true">+</i> AN OPEN INVITATION TO LOOK BENEATH THE
          SURFACE.
        </span>
      </div>
      <div className="notebook-copy reveal">
        <Label>04 — The designer’s notebook</Label>
        <h2>
          Before the form,
          <br />
          <em>the feeling.</em>
        </h2>
        <p>
          A pencil. A blank page. The suggestion of a curve. Our design story
          begins not with a specification, but with a feeling worth chasing.
        </p>
        <p>
          From the first restless sketch to the final considered surface, every
          line is a conversation between instinct and intention.
        </p>
        <div className="signature">The Véloré Design Studio</div>
        <span className="eyebrow">AN IMAGINED MARQUE. AN OPEN SKETCHBOOK.</span>
      </div>
    </section>
  );
}
