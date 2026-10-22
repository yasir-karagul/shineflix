# Shineflix

Arabic-first media catalogue built with Next.js, TypeScript, Prisma, and PostgreSQL.

## Features

- Arabic RTL responsive catalogue for anime, movies, and TV series.
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
