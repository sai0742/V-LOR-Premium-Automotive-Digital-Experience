export default function Footer({ anatomy = false }: { anatomy?: boolean }) {
  const home = anatomy ? "/" : "";
  return (
    <footer className="section footer">
      <div className="footer-top">
        <a className="footer-brand" href={`${home}#top`}>
          VÉLORÉ
        </a>
        <p>
          Timeless form.
          <br />
          Independent spirit.
        </p>
        <nav aria-label="Footer navigation">
          <a href={`${home}#collection`}>The collection</a>
          <a href={`${home}#marque`}>The marque</a>
          <a href={`${home}#journal`}>The journal</a>
          <a href="/anatomy">The anatomy atelier</a>
          <a href={`${home}#registry`}>The registry</a>
        </nav>
        <a href={`${home}#top`} className="back-top" aria-label="Back to top">
          ↑
        </a>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} VÉLORÉ DESIGN CONCEPT</span>
        <p>
          VÉLORÉ, Auren GT and Sirène Roadster are fictional automotive design
          concepts.
          <br />
          Original reference artwork and AI-assisted concept illustrations. No
          vehicles are offered for sale.
        </p>
        <span>THE LONG WAY IS THE RIGHT WAY.</span>
      </div>
    </footer>
  );
}
