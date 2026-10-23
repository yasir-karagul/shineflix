# Shineflix

English-first bilingual media catalogue built with Next.js, TypeScript, Prisma, and PostgreSQL.

## Features

- English-default bilingual catalogue for anime, movies, and TV series, with Arabic RTL support and a persistent language choice.
- Admin CMS at `/admin`, protected by a signed, HTTP-only session cookie.
- Create, edit, publish, archive, and delete content records.
- Search licensed IMDb metadata, select a result, review it, then save it to the database.
- Manage seasons and episodes; episode embeds are unpublished by default and are displayed only when published.
- SEO metadata, sitemap, and robots rules.

## Local development

1. Install Node.js 20+ and PostgreSQL.
2. Copy `.env.example` to `.env.local` and fill in the database URL and strong admin credentials.
3. Install dependencies with `npm install`.
4. Create/update the schema with `npm run db:push`.
5. Start the app with `npm run dev`; production build: `npm run build`.

Never commit real secrets. Set `ADMIN_PASSWORD` to a unique password and `ADMIN_SESSION_SECRET` to at least 32 random characters. Configure all environment variables in your hosting provider as well.

## IMDb metadata integration

The search adapter uses the AWS SDK's `SendApiAsset` operation to call the official IMDb GraphQL API through an active AWS Data Exchange subscription. You must have the appropriate licensed IMDb product access and configure:

- `IMDB_DATASET_ID`, `IMDB_REVISION_ID`, and `IMDB_ASSET_ID` from the subscribed data product.
- `IMDB_API_KEY` issued for that API access.
- `IMDB_GRAPHQL_PATH` for the provider's GraphQL route (defaults to `/graphql`).
- AWS credentials with permission to invoke the subscribed API asset, plus `AWS_REGION`.

The admin flow is: search IMDb, select a result, review or correct the metadata, then save it. Search does not import IMDb's entire catalogue in bulk. The public IMDb downloadable datasets have separate non-commercial restrictions; do not republish them in a public or commercial catalogue without permission. Never scrape IMDb pages or use metadata/images beyond the rights granted by your license.

## Seasons, episodes, and embeds

Create a title, add seasons, then add episodes to the chosen season. Use only video URLs that you own or are explicitly authorized to embed. An embed URL does not grant streaming or redistribution rights. Episodes should remain unpublished until the rights and URL have been checked. You can configure additional permitted HTTPS player hostnames with `EMBED_ALLOWED_HOSTS` (comma-separated); YouTube and Vimeo player hosts are allowed by default.

## Deployment

Set `NEXT_PUBLIC_SITE_URL` to the canonical production origin. Configure `DATABASE_URL`, admin credentials, and any optional IMDb credentials in the hosting provider. Run the Prisma schema setup before using the CMS. Google indexing requires a deployed public domain and Search Console verification; sitemap submission does not guarantee indexing.


## Advertising manager

Open `/admin/ads` after signing in to manage ads. Supported formats are text links, image banners, and HTML/JavaScript snippets rendered in a sandboxed iframe without same-origin access. Placements include the site-wide top banner, homepage inline area, before the movie player, and below title details. Ads can be enabled/disabled and scheduled with start/end times. Run `npm run db:push` after updating the Prisma schema. Only use ad-network code and destination URLs you trust; sandboxing reduces access to the Shineflix page but does not make a malicious ad provider safe.


## Languages and redirect page

English is the default language. The language switcher stores the selection in the `shineflix_locale` cookie and switches between LTR English and RTL Arabic across the public site and admin pages. The same repo includes a bilingual `/redirect` landing page for use as a branded forwarding site. Set `NEXT_PUBLIC_MAIN_SITE_URL` to the canonical main-site URL when deploying the redirect instance separately. The redirect page is marked `noindex,nofollow`; it's intended to forward visitors rather than compete with the main site in search results. A `?lang=en` or `?lang=ar` query on arrival is persisted by the middleware.
