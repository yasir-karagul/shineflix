const tmdbLogo = "https://www.themoviedb.org/assets/2/v4/logos/v2/blue_long_2-9665a76b1ae401a510ec1e0ca40ddcb3b0cfe45f1d51b77a308fea0845885648.svg";

export const metadata = {
  title: "Credits & Data Sources | Shineflix",
  description: "Attribution and data source information for Shineflix."
};

export default function CreditsPage() {
  return <main className="page-shell inner-page credits-page">
    <span className="eyebrow">SHINEFLIX / CREDITS</span>
    <h1>Credits &amp; data sources</h1>
    <section className="admin-tools credits-source">
      <a href="https://www.themoviedb.org/about/logos-attribution" target="_blank" rel="noreferrer" aria-label="The Movie Database logo attribution guidelines">
        <img src={tmdbLogo} alt="The Movie Database (TMDB)" />
      </a>
      <p>This website uses TMDB and the TMDB APIs but is not endorsed, certified, or otherwise approved by TMDB.</p>
      <p>Movie and TV metadata and images are provided by TMDB. Image paths are rendered using the TMDB image service.</p>
      <p><a href="https://www.themoviedb.org/" target="_blank" rel="noreferrer">Visit The Movie Database ↗</a></p>
    </section>
  </main>;
}
