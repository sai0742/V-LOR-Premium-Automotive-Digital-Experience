import { Arrow, Label, Artwork } from "./Shared";
export default function Roadster() {
  return (
    <section className="section roadster" id="sirene">
      <div className="section-heading">
        <div>
          <Label>07 — The second expression</Label>
          <h2>
            Sirène <em>Roadster.</em>
          </h2>
        </div>
        <p>
          Less between you
          <br />
          and the world.
        </p>
        <span className="outlined-label">CONCEPT NO. 002</span>
      </div>
      <Artwork
        src="sirene-studio"
        alt="Sage-green open-top Sirène Roadster illustrated from the rear, with cognac seats and delicate chrome details"
      />
      <div className="roadster-bottom">
        <span className="handnote">Take the sky with you.</span>
        <p>
          An open roof. A lighter spirit. The Sirène takes the VÉLORÉ philosophy
          somewhere a little more spontaneous.
        </p>
        <a className="text-link" href="#registry">
          Follow the Sirène story <Arrow />
        </a>
      </div>
    </section>
  );
}
