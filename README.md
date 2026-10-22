# Shineflix

Arabic-first anime discovery catalogue built with Next.js and TypeScript.

## Development

Run `npm install` and `npm run dev`.

This project is a discovery catalogue and does not scrape or redistribute unauthorized video streams.


## Admin CMS and catalog

The admin dashboard is available at `/admin`; the login form is at `/admin/login`. Configure the environment variables from `.env.example` in your deployment provider before using it. Use a unique, long `ADMIN_PASSWORD` and a random `ADMIN_SESSION_SECRET` of at least 32 characters. Do not commit real credentials.

### Database setup

1. Provision PostgreSQL (for example, Neon or Supabase).
2. Set `DATABASE_URL` in the deployment environment.
3. Run `npm install`, then `npm run db:push` in a trusted development environment to create/update the schema.
4. Deploy with `npm run build`.

### IMDb metadata

IMDb integration is designed for the official IMDb API offered through AWS Data Exchange. It will not work until the relevant product access is approved and the correct GraphQL endpoint, dataset/revision/asset IDs, region, and AWS credentials are configured. IMDb public datasets have separate non-commercial restrictions; do not use them to populate a commercial public catalog without permission. Never scrape IMDb pages or embed IMDb media assets outside the applicable license.

### Episode embeds

The CMS can store an embed URL per episode. Only use video providers and URLs for which you have the rights to display and embed the content. An embed link alone does not grant redistribution rights. The public detail page displays published episodes only.
