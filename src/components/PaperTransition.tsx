import type { PaperPhase } from "../hooks/useArchiveRoute";

export default function PaperTransition({ phase }: { phase: PaperPhase }) {
  if (!phase) return null;
  return (
    <div
      className={`paper-transition is-${phase}`}
      aria-hidden="true"
      data-phase={phase}
    >
      <div className="paper-fold paper-fold-left" />
      <div className="paper-fold paper-fold-centre">
        <span className="paper-transition-cross">+</span>
        <span className="paper-transition-mark">V</span>
        <span>VÉLORÉ / STUDIO ARCHIVE</span>
        <i>A closer look.</i>
        <span className="paper-transition-folio">
          SHEET 07 — THE ANATOMY ATELIER
        </span>
      </div>
      <div className="paper-fold paper-fold-right" />
    </div>
  );
}
