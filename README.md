# Shineflix

English-first bilingual media catalogue built with Next.js, TypeScript, Prisma, and PostgreSQL.

## Features

- English-default bilingual catalogue for anime, movies, and TV series, with Arabic RTL support and a persistent language choice.
- Admin CMS at `/admin`, protected by a signed, HTTP-only session cookie.
- Create, edit, publish, archive, and delete content records.
- Official TMDB API integration: search for movies and TV shows, import metadata by TMDB ID, and manage authentication from `/admin/settings`.
- TMDB metadata includes ID and media type, title and original title, alternative titles, poster/backdrop/logo paths, overview, source status, TMDB rating/vote count, genres, and original language.
- Manage seasons and episodes; episode embeds are unpublished by default and are displayed only when published.
- SEO metadata, sitemap, and robots rules.

## Local development

1. Install Node.js 20+ and PostgreSQL.
2. Copy `.env.example` to `.env.local` and fill in the database URL and strong admin credentials.
3. Install dependencies with `npm install`.
4. Create/update the schema with `npm run db:push`.
5. Start the app with `npm run dev`; production build: `npm run build`.

Never commit real secrets. Set `ADMIN_PASSWORD` to a unique password and `ADMIN_SESSION_SECRET` to at least 32 random characters. The same session secret derives the encryption key used to store the TMDB credential encrypted in PostgreSQL. If you rotate `ADMIN_SESSION_SECRET`, re-enter the TMDB credential in the admin settings. Configure all environment variables in your hosting provider as well.

## TMDB integration

Shineflix calls the official TMDB API v3 from the server. The preferred authentication method is the **API Read Access Token** sent in the `Authorization: Bearer` header. Sign in to your TMDB account, open your API settings, and copy that token into **Admin → Settings → TMDB integration**. The settings page validates the credential before storing it encrypted in the database; it never returns the credential to the browser after saving.

For an environment-based fallback, configure `TMDB_API_READ_ACCESS_TOKEN` in `.env.local` and in Vercel project environment variables. A v3 `TMDB_API_KEY` is also supported, but the Read Access Token is preferred. Do not prefix either variable with `NEXT_PUBLIC_`.

The admin flow supports searching movies and TV shows, selecting a result, requesting full details by the numeric TMDB ID and its `movie` or `tv` media type, reviewing/editing the metadata, and saving it to PostgreSQL. It also supports direct lookup by TMDB ID. TMDB's `movie` and `tv` types are stored separately from Shineflix's `MOVIE`, `SERIES`, and `ANIME` categories. A TV result can be categorized as anime in the Shineflix editor. Logo and alternative-title fields are optional when TMDB has no matching data.

TMDB image URLs are constructed from API file paths using the documented `https://image.tmdb.org/t/p/{size}{file_path}` pattern. Shineflix stores the paths in PostgreSQL and builds an image URL for the selected size when rendering.

TMDB requires attribution. The site footer and Credits page display the approved TMDB logo and this notice:
> This website uses TMDB and the TMDB APIs but is not endorsed, certified, or otherwise approved by TMDB.

Review [TMDB API terms of use](https://www.themoviedb.org/api-terms-of-use) and [official API documentation](https://developer.themoviedb.org/docs/getting-started) before production use. TMDB states that a commercial project may require a separate commercial license; confirm eligibility for your use case before revenue-generating use.

## Seasons, episodes, and embeds

Create a title, add seasons, then add episodes to the chosen season. Use only video URLs that you own or are explicitly authorized to embed. An embed URL does not grant streaming or redistribution rights. Episodes should remain unpublished until the rights and URL have been checked. You can configure additional permitted HTTPS player hostnames with `EMBED_ALLOWED_HOSTS` (comma-separated); YouTube and Vimeo player hosts are allowed by default.

## Deployment

Set `NEXT_PUBLIC_SITE_URL` to the canonical production origin. Configure `DATABASE_URL`, admin credentials, and `ADMIN_SESSION_SECRET` in Vercel. The TMDB credential can either be set in Vercel as an optional server-only environment variable or added from the admin settings page. Run the Prisma schema setup before using the CMS. Google indexing requires a deployed public domain and Search Console verification; sitemap submission does not guarantee indexing.

## Advertising manager

Open `/admin/ads` after signing in to manage ads. Supported formats are text links, image banners, and HTML/JavaScript snippets rendered in a sandboxed iframe without same-origin access. Placements include the site-wide top banner, homepage inline area, before the movie player, and below title details. Ads can be enabled/disabled and scheduled with start/end times. Run `npm run db:push` after updating the Prisma schema. Only use ad-network code and destination URLs you trust; sandboxing reduces access to the Shineflix page but does not make a malicious ad provider safe.

## Languages and separate redirect site

English is the default language. The main site language switcher stores the selection in the `shineflix_locale` cookie and supports left-to-right English and right-to-left Arabic. The main Shineflix application has no redirect-only runtime mode or embedded redirect landing page.

The standalone destination site lives in `redirect-site/` and is deployed as a **separate Vercel project** connected to this repository with Root Directory set to `redirect-site`. Configure `VITE_MAIN_SITE_URL` in that project to point to the main Shineflix production origin. The redirect site is a static Vite app: it has its own deployment URL/domain and does not use the main site's database, Prisma, admin credentials, TMDB access, or ads configuration. See [redirect-site/README.md](redirect-site/README.md) for setup instructions.

## Neon PostgreSQL / Prisma 6

The Prisma datasource uses `DATABASE_URL` for application queries and `DATABASE_URL_UNPOOLED` as Prisma's direct migration connection. Copy both connection strings for the same Neon branch/database from the Neon Console; use the pooled hostname for `DATABASE_URL` when pooling is enabled, and the direct hostname (without `-pooler`) for `DATABASE_URL_UNPOOLED`. Never commit actual credentials. On Windows PowerShell, after creating a local `.env` file from `.env.example`, run:

```powershell
npm install
npm run db:generate
npm run db:push
npm run build
```

`db:push` synchronizes the Prisma schema with the selected database. Use it only after confirming `DATABASE_URL` points to the intended Neon branch/database and back up existing data before applying schema changes.
