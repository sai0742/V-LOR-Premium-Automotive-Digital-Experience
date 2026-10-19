import { Arrow, Label, Artwork } from "./Shared";
export default function DesignBoard() {
  return (
    <section className="section design-board" id="collection">
      <div className="section-heading reveal">
        <div>
          <Label>02 — The first expression</Label>
          <h2>
            Auren <em>GT.</em>
          </h2>
        </div>
        <p>
          A long bonnet. A poised stance. A line that knows
          <br /> exactly where it belongs.
        </p>
        <span className="outlined-label">CONCEPT NO. 001</span>
      </div>
      <div className="drawing">
        <div className="drawing-top">
          <span>VÉLORÉ / STUDIO ARCHIVE</span>
          <span>BODY STUDY — A / 01</span>
        </div>
        <div className="callout callout-one">
          A continuous, unbroken shoulder line <i />
        </div>
        <Artwork
          src="auren-studio"
          alt="Auren GT body study showing sculpted red bodywork and fastback proportions"
        />
        <div className="callout callout-two">
          Wire-spoke wheels. A timeless signature. <i />
        </div>
        <div className="drawing-bottom">
          <div className="swatches" data-magnetic>
            <i style={{ background: "#C9232B" }} />
            <i style={{ background: "#64745A" }} />
            <i style={{ background: "#D8C7A7" }} />
            <i style={{ background: "#171715" }} />
            <span>EXTERIOR COLOUR STUDIES</span>
          </div>
          <span className="handnote">Less, but with feeling.</span>
        </div>
      </div>
      <div className="board-caption">
        <span>01 / AUREN GT</span>
        <p>
          A grand touring coupé, drawn around the pleasure of the open road.
          <br />
          An imagined classic. An entirely contemporary point of view.
        </p>
        <a href="#specifications" className="text-link" data-magnetic>
          View concept specifications <Arrow />
        </a>
      </div>
    </section>
  );
}
