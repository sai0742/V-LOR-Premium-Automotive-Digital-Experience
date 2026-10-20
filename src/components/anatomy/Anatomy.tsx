import { memo, useState } from "react";
import { useExplodedBlueprint } from "../../hooks/useExplodedBlueprint";
import BlueprintDrawing from "./BlueprintDrawing";
import { assemblies, scrollChapters } from "./assemblies";
import type { AssemblyId } from "./assemblies";

const DraftingMarks = memo(function DraftingMarks() {
  return (
    <>
      <div className="draft-grid" aria-hidden="true" />
      <div className="draft-ruler draft-ruler-top" aria-hidden="true">
        <span>0</span>
        <span>100</span>
        <span>200</span>
        <span>300</span>
        <span>400</span>
        <span>500 mm</span>
      </div>
      <div className="draft-ruler draft-ruler-side" aria-hidden="true" />
      <svg
        className="draft-registration"
        viewBox="0 0 1400 800"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          className="grid-drawing-line"
          d="M50 350 H1350 M700 200 V690"
          pathLength="1"
        />
        <path d="M28 28 h20 m-10 -10 v20 M1352 28 h20 m-10 -10 v20 M28 772 h20 m-10 -10 v20 M1352 772 h20 m-10 -10 v20" />
      </svg>
      <svg className="draft-axes" viewBox="0 0 90 90" aria-hidden="true">
        <path d="M34 58 L73 47 M34 58 L12 38 M34 58 V15" />
        <path d="M68 45 L73 47 L70 51 M12 43 V38 H17 M31 20 L34 15 L37 20" />
        <text x="76" y="48">
          X
        </text>
        <text x="3" y="35">
          Y
        </text>
        <text x="31" y="10">
          Z
        </text>
        <circle cx="34" cy="58" r="3" />
      </svg>
      <span className="draft-folio" aria-hidden="true">
        07
      </span>
    </>
  );
});

export default function Anatomy() {
  const [selected, setSelected] = useState<AssemblyId | null>(null);
  const [hovered, setHovered] = useState<AssemblyId | null>(null);
  const {
    container,
    stage,
    sceneLayer,
    canvas,
    progress,
    reducedMotion,
    compact,
    staticView,
    seek,
    webgl,
  } = useExplodedBlueprint({ selected, hovered });
  const chapter = Math.min(4, Math.floor(progress / 22));
  const focus = assemblies.find((item) => item.id === selected);
  const inspect = (id: AssemblyId) =>
    setSelected((previous) => (previous === id ? null : id));

  return (
    <>
      <section
        className={`anatomy-scroll${staticView ? " is-static" : ""}`}
        ref={container}
        aria-label="Interactive exploded blueprint"
      >
        <div
          className={`anatomy-stage${selected ? " has-selection" : ""}`}
          ref={stage}
        >
          <DraftingMarks />
          <div className="atelier-breadcrumb">
            <a href="/#journal" data-magnetic>
              <span aria-hidden="true">↙</span> Back to the notebook
            </a>
            <span>
              STUDIO ARCHIVE <i>/</i> PLATE 07
            </span>
            <span className="atelier-status">
              <i />{" "}
              {reducedMotion
                ? "STATIC STUDY / MOTION PAUSED"
                : compact
                  ? "STATIC STUDY / COMPACT SHEET"
                  : "INTERACTIVE DESIGN STUDY"}
            </span>
          </div>
          <header className="atelier-heading">
            <div>
              <p className="eyebrow">THE EXPLODED BLUEPRINT ATELIER</p>
              <h1 tabIndex={-1}>
                Anatomy of a <em>feeling.</em>
              </h1>
            </div>
            <p className="atelier-intro">
              Beauty is never only skin deep.
              <br />
              An Auren GT, gently taken apart.
              <br />
              <span>Scroll to reveal what lies within.</span>
            </p>
          </header>

          <div
            className={`anatomy-webgl${webgl === "ready" ? " is-ready" : ""}${webgl === "unavailable" ? " is-unavailable" : ""}`}
            aria-hidden="true"
          >
            <canvas ref={canvas} className="anatomy-canvas" />
          </div>
          {webgl !== "ready" && (
            <div className="anatomy-fallback" aria-hidden="true">
              <BlueprintDrawing part="coachwork" />
            </div>
          )}
          <div className="anatomy-camera">
            <div
              className="anatomy-scene"
              ref={sceneLayer}
              role="group"
              aria-label="Five Auren GT assemblies in an exploded three-dimensional study"
            >
              {assemblies.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  data-part={item.id}
                  data-anchor={item.id}
                  data-loupe
                  className={`blueprint-layer${selected === item.id ? " is-selected" : ""}${hovered === item.id ? " is-hovered" : ""}`}
                  aria-label={`Inspect ${item.title}`}
                  aria-pressed={selected === item.id}
                  aria-controls="assembly-insight"
                  onClick={() => inspect(item.id)}
                  onPointerEnter={() => setHovered(item.id)}
                  onPointerLeave={() => setHovered(null)}
                >
                  <span className="anchor-mark" aria-hidden="true">
                    <span className="anchor-ring" />
                    <span className="anchor-number">{item.number}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>
          <svg className="blueprint-leaders" aria-hidden="true">
            {assemblies.map((item) => (
              <g
                key={item.id}
                className={
                  selected === item.id || hovered === item.id
                    ? "is-selected"
                    : ""
                }
              >
                <path data-leader={item.id} pathLength="1" />
                <circle data-leader-dot={item.id} r="3" />
              </g>
            ))}
          </svg>
          <div
            className="assembly-callouts"
            aria-label="Inspect a technical assembly"
          >
            {assemblies.map((item) => (
              <button
                type="button"
                key={item.id}
                className={`assembly-callout callout-${item.id}${selected === item.id ? " is-selected" : ""}`}
                data-callout={item.id}
                aria-pressed={selected === item.id}
                aria-controls="assembly-insight"
                onClick={() => inspect(item.id)}
                onPointerEnter={() => setHovered(item.id)}
                onPointerLeave={() => setHovered(null)}
              >
                <span className="callout-number">{item.number}</span>
                <span className="callout-content">
                  <strong>{item.title}</strong>
                  <span>{item.spec}</span>
                  <small>
                    {item.code} <i aria-hidden="true">↗</i>
                  </small>
                </span>
              </button>
            ))}
          </div>
          <div
            className={`assembly-insight${focus ? " is-open" : ""}`}
            id="assembly-insight"
            aria-live="polite"
            aria-atomic="true"
          >
            {focus ? (
              <>
                <div>
                  <span>
                    {focus.number} / {focus.material}
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelected(null)}
                    aria-label="Show all assemblies"
                  >
                    ×
                  </button>
                </div>
                <h2>
                  {focus.short},{" "}
                  <em className="ink-reveal ink-visible">considered.</em>
                </h2>
                <p>{focus.note}</p>
              </>
            ) : (
              <span className="handnote">
                Five assemblies.
                <br />
                One beating heart.
              </span>
            )}
          </div>
          <div className="atelier-footer">
            <div className="scroll-chapter">
              <p>{scrollChapters[chapter].title}</p>
              <span>{scrollChapters[chapter].caption}</span>
              <span className="scroll-cue">
                {staticView
                  ? compact
                    ? "USE THE CONTROLS"
                    : "USE THE DRAWING CONTROLS"
                  : progress > 95
                    ? "CONTINUE TO THE FIELD NOTES ↓"
                    : "SCROLL TO DISASSEMBLE ↓"}
              </span>
            </div>
            <div className="draft-controls">
              <span className="draft-scale">
                <i />
                <span>
                  ILLUSTRATIVE AXONOMETRIC
                  <br />
                  AUREN GT / NOT TO SCALE
                </span>
              </span>
              <div className="disassembly-control">
                <button
                  type="button"
                  className={progress < 2 ? "is-current" : ""}
                  onClick={() => seek(0)}
                  data-magnetic
                >
                  Assembled
                </button>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={progress}
                  aria-label="Disassembly progress"
                  aria-valuetext={`${progress}% disassembled`}
                  onChange={(event) => seek(Number(event.target.value), true)}
                />
                <button
                  type="button"
                  className={progress > 98 ? "is-current" : ""}
                  onClick={() => seek(100)}
                  data-magnetic
                >
                  Exploded
                </button>
              </div>
              <span className="draft-progress">
                <strong>{String(progress).padStart(3, "0")}</strong> / 100
                <span>DISASSEMBLY</span>
              </span>
            </div>
            <div className="atelier-progress-track" aria-hidden="true">
              <i style={{ transform: `scaleX(${progress / 100})` }} />
            </div>
          </div>
          <p className="diagram-disclaimer">
            AN IMAGINED MACHINE. AN ORIGINAL VECTOR STUDY.
          </p>
        </div>
      </section>

      <section className="anatomy-notes section" id="field-notes">
        <div className="section-heading reveal">
          <div>
            <p className="eyebrow">FROM THE ATELIER / FIELD NOTES</p>
            <h2>
              Nothing incidental.
              <br />
              <em>Not even what you cannot see.</em>
            </h2>
          </div>
          <p>
            The beauty of a machine is the sum of its decisions.
            <br />
            These are five of ours.
          </p>
        </div>
        <div className="anatomy-note-grid">
          {assemblies.map((item) => (
            <article className="anatomy-note reveal" key={item.id}>
              <div className="note-folio">
                <span>
                  {item.number} / {item.code}
                </span>
                <span>VÉLORÉ</span>
              </div>
              <div className="note-drawing" data-loupe>
                <BlueprintDrawing part={item.id} />
              </div>
              <h3>{item.title}</h3>
              <p>{item.note}</p>
              <span className="note-material">{item.detail}</span>
            </article>
          ))}
          <article className="anatomy-note note-return">
            <span className="eyebrow">THE STUDY CONTINUES</span>
            <span className="note-return-mark" aria-hidden="true">
              V
            </span>
            <h3>
              Back to
              <br />
              <em>the feeling.</em>
            </h3>
            <p>
              A drawing is a beginning.
              <br />
              The long way is everything after.
            </p>
            <a href="/#journal" className="text-link" data-magnetic>
              Return to the notebook <span aria-hidden="true">↗</span>
            </a>
          </article>
        </div>
        <p className="anatomy-concept-note">
          ARCHIVE NOTE — Dimensions, materials and mechanical specifications are
          imaginative design annotations, not engineering or production claims.
          All five assemblies are original SVG studies.
        </p>
      </section>
    </>
  );
}
