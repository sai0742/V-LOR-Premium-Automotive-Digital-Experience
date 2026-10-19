import { Arrow, Label } from "./Shared";
export default function Philosophy() {
  return (
    <section className="section marque" id="marque">
      <div>
        <Label>01 — The marque</Label>
        <img
          className="archive-logo"
          src="/images/emblem.webp"
          alt="Original Véloré Auren GT emblem: red winged V and black grille"
          loading="lazy"
          width="1254"
          height="1254"
        />
      </div>
      <div className="reveal">
        <h2>
          Built for the moments
          <br />
          <em>between destinations.</em>
        </h2>
        <div className="two-copy">
          <p>
            Some journeys are measured in miles. The best are measured in
            moments. A quiet road. The first light. The feeling of a machine
            that asks you to be present.
          </p>
          <p>
            VÉLORÉ is an imagined marque with a very real affection for the art
            of motoring. Beautiful proportions, honest materials, and mechanical
            character — brought together in a new collection of timeless
            concepts.
          </p>
        </div>
        <a className="text-link" href="#journal" data-magnetic>
          Inside our design philosophy <Arrow />
        </a>
      </div>
    </section>
  );
}
