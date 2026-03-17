# top_repo_4_today

A clean, Notion-style blog that publishes daily posts about top GitHub repositories (stars/forks), with no-repeat picks and rule-based summaries.

## Requirements

- Node.js (LTS recommended)
- A Supabase Postgres database (connection string in `DATABASE_URL`)
- A GitHub token in `GITHUB_TOKEN` (public repo access is enough; improves rate limits)
- A cron/admin secret in `CRON_SECRET` (protects crawl endpoints)

## Crawling (local dev)

The Next.js app lives in `web/`.

```bash
cd web
npm run dev
```

Then, in another shell:

```bash
curl "http://localhost:3000/api/admin/crawl?secret=$CRON_SECRET"
```

## Security

- Do not commit secrets. Use `.env` locally and set env vars in Vercel/GitHub Actions.
- Use `.env.example` as the template.

