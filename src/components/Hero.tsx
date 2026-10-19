import { Arrow, Label, Artwork } from "./Shared";
export default function Hero() {
  return (
    <section className="hero" id="top">
      <div className="hero-top">
        <Label>Independent spirit. Timeless form.</Label>
        <span className="edition">THE VÉLORÉ ARCHIVE — VOL. 01</span>
      </div>
      <div className="hero-copy">
        <h1>
          The Art of
          <br />
          the <em>Long Way.</em>
        </h1>
        <div className="hero-intro">
          <span className="red-line" />
          <p>
            For those who believe the journey
            <br className="desktop-break" /> should be as beautiful as the
            destination.
          </p>
          <a href="#collection" className="text-link">
            Discover the Auren GT <Arrow />
          </a>
        </div>
      </div>
      <div className="hero-art">
        <div className="art-label">
          <span className="mini-cross">+</span>
          <span>
            AUREN GT
            <br />
            GRAND TOURING, REIMAGINED
          </span>
        </div>
        <Artwork
          src="auren-studio"
          alt="Racing-red Auren GT, illustrated in watercolor with a long bonnet, round headlamps and wire wheels"
          eager
        />
        <span className="handnote">A study in enduring proportions.</span>
        <span className="plate-number">FIG. 01 / DESIGN STUDY</span>
      </div>
      <div className="hero-bottom">
        <a href="#collection">
          Explore the collection <span>↓</span>
        </a>
        <span>CONCEIVED WITH CHARACTER. DRAWN WITH SOUL.</span>
        <span>SCROLL TO DISCOVER ↓</span>
      </div>
    </section>
  );
}
