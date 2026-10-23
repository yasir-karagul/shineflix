# Shineflix Redirect Site

This is an independent, bilingual landing site for Shineflix. It follows the same high-level approach as WitAnime's separate destination site: it introduces the brand and its features, then lets visitors continue to the main catalogue with a clear button. It does not automatically forward visitors after a timer.

## Deploy as a separate Vercel project

1. Import the `yasir-karagul/shineflix` GitHub repository as a **new** Vercel project.
2. Set **Root Directory** to `redirect-site`.
3. Use the Vite framework preset, build command `npm run build`, and output directory `dist`.
4. Set `VITE_MAIN_SITE_URL` to the production origin of the main Shineflix site (for example, `https://shineflix-yorion.vercel.app`) in Production, Preview, and Development.
5. Deploy the project and assign a redirect-site domain to this project only.

Do not connect the redirect project to Neon. It has no database, admin login, IMDb credentials, or main-site environment secrets.

## Local development

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
npm run preview
```

The language selector switches between English and Arabic and preserves the choice in local storage. Main-site buttons include the selected language as a `lang` query parameter so the main site can apply its language cookie.
