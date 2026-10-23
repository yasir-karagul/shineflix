# Shineflix

English-first bilingual media catalogue built with Next.js, TypeScript, Prisma, and PostgreSQL.

## Features

- English-default bilingual catalogue for anime, movies, and TV series, with Arabic RTL support and a persistent language choice.
- Admin CMS at `/admin`, protected by a signed, HTTP-only session cookie.
- Create, edit, publish, archive, and delete content records.
- Import title metadata by TMDB ID through the official TMDB API; review it, then save it to the database.
- Manage seasons and episodes; episode embeds are unpublished by default and are displayed only when published.
- SEO metadata, sitemap, and robots rules.

## Local development

1. Install Node.js 20+ and PostgreSQL.
2. Copy `.env.example` to `.env.local` and fill in the database URL and strong admin credentials.
3. Install dependencies with `npm install`.
4. Create/update the schema with `npm run db:push`.
5. Start the app with `npm run dev`; production build: `npm run build`.

Never commit real secrets. Set `ADMIN_PASSWORD` to a unique password and `ADMIN_SESSION_SECRET` to at least 32 random characters. Configure all environment variables in your hosting provider as well.

## TMDB metadata integration

Shineflix uses the official TMDB v3 API for title metadata. In the admin CMS, enter a numeric TMDB ID and select the TMDB media type (`movie` or `tv`). The server requests the matching details endpoint and appends `alternative_titles` and `images`, including poster, backdrop, and logo paths where available. It imports the title/original title, alternate titles, overview, TMDB work status, rating and vote count, genres, original language, and release/end years. The Shineflix editorial publication status remains separate from the status returned by TMDB.

Configure one of these server-side environment variables in your hosting provider:

- `TMDB_ACCESS_TOKEN`: preferred; the API Read Access Token from the TMDB account API settings, sent in the `Authorization: Bearer` header.
- `TMDB_API_KEY`: optional fallback if you use a TMDB v3 API key.

Do not expose either credential through a `NEXT_PUBLIC_*` variable or commit it to source control. Image file paths are stored as returned by TMDB; Shineflix constructs image CDN URLs for posters and backdrops.

TMDB requires attribution in the application, including an approved TMDB logo and the notice: **“This product uses the TMDB API but is not endorsed or certified by TMDB.”** If the site's primary purpose is revenue generation, check with TMDB about commercial licensing. See the [official API authentication guide](https://developer.themoviedb.org/docs/authentication-application) and [TMDB API FAQ](https://developer.themoviedb.org/docs/faq).

## Seasons, episodes, and streaming servers

Create a title, add seasons, then add episodes to the chosen season. Every title and episode can have multiple named streaming servers, each with an HTTPS embed URL, display order, and active/inactive state. Visitors can switch between active servers in the player. Older single `embedUrl` entries remain a compatibility fallback until saved into the server manager. Use only video URLs that you own or are explicitly authorized to embed; an embed URL does not grant streaming or redistribution rights. Episodes should remain unpublished until rights and URLs have been checked. Configure additional permitted HTTPS player hostnames with `EMBED_ALLOWED_HOSTS` (comma-separated); YouTube and Vimeo are allowed by default. After a schema change, run `npm run db:push` against the intended Neon database before deploying the application code.

## Deployment

Set `NEXT_PUBLIC_SITE_URL` to the canonical production origin. Configure `DATABASE_URL`, admin credentials, and `TMDB_ACCESS_TOKEN` (or `TMDB_API_KEY`) in the hosting provider. Run the Prisma schema setup before using the CMS. Google indexing requires a deployed public domain and Search Console verification; sitemap submission does not guarantee indexing.


## Advertising manager

Open `/admin/ads` after signing in to manage ads. Supported formats are text links, image banners, and HTML/JavaScript snippets rendered in a sandboxed iframe without same-origin access. Placements include the site-wide top banner, homepage inline area, before the movie player, and below title details. Ads can be enabled/disabled and scheduled with start/end times. Run `npm run db:push` after updating the Prisma schema. Only use ad-network code and destination URLs you trust; sandboxing reduces access to the Shineflix page but does not make a malicious ad provider safe.


## Languages and separate redirect site

English is the default language. The main site language switcher stores the selection in the `shineflix_locale` cookie and supports left-to-right English and right-to-left Arabic. The main Shineflix application has no redirect-only runtime mode or embedded redirect landing page.

The standalone destination site lives in `redirect-site/` and is deployed as a **separate Vercel project** connected to this repository with Root Directory set to `redirect-site`. Configure `VITE_MAIN_SITE_URL` in that project to point to the main Shineflix production origin. The redirect site is a static Vite app: it has its own deployment URL/domain and does not use the main site's database, Prisma, admin credentials, TMDB credentials, or ads configuration. See [redirect-site/README.md](redirect-site/README.md) for setup instructions.

## Neon PostgreSQL / Prisma 6

The Prisma datasource uses `DATABASE_URL` for application queries and `DATABASE_URL_UNPOOLED` as Prisma's direct migration connection. Copy both connection strings for the same Neon branch/database from the Neon Console; use the pooled hostname for `DATABASE_URL` when pooling is enabled, and the direct hostname (without `-pooler`) for `DATABASE_URL_UNPOOLED`. Never commit actual credentials. On Windows PowerShell, after creating a local `.env` file from `.env.example`, run:

```powershell
npm install
npm run db:generate
npm run db:push
npm run build
```

`db:push` synchronizes the Prisma schema with the selected database. Use it only after confirming `DATABASE_URL` points to the intended Neon branch/database.
