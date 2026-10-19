import { Label } from "./Shared";
export default function Specifications() {
  return (
    <section className="section specifications" id="specifications">
      <div>
        <Label>06 — In the details</Label>
        <h2>
          Auren GT.
          <br />
          <em>By design.</em>
        </h2>
        <p>
          Not a list of numbers.
          <br />A statement of intent.
        </p>
        <span className="concept-note">
          Illustrative concept specifications.
          <br />
          Not a production vehicle.
        </span>
      </div>
      <dl>
        {[
          ["Design language", "European grand touring"],
          ["Body style", "Two-door fastback coupé"],
          ["Seating concept", "2 + 2 touring layout"],
          ["Exterior palette", "Racing red · Sage · Ivory · Ink"],
          ["Interior palette", "Cognac leather · Walnut · Satin metal"],
          ["Concept classification", "Independent automotive design study"],
        ].map(([k, v]) => (
          <div key={k}>
            <dt>{k}</dt>
            <dd>{v}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
