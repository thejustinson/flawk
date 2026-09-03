# Local setup

## 1. Supabase project

1. Create a project at [supabase.com](https://supabase.com/dashboard) (free tier is fine).
2. **Project Settings → API**: copy the `Project URL` and the `anon` / `service_role` keys.
3. **Project Settings → Database → Connection string → Session pooler** (port `5432`):
   copy the URI and substitute your database password.
4. **Authentication → URL Configuration**: set `Site URL` to `http://localhost:3000`
   and add `http://localhost:3000/auth/callback` under **Redirect URLs**.

## 2. Environment

```bash
cp .env.example .env.local
```

Fill in:

| var | where |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Settings → API → anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Settings → API → service_role key |
| `DATABASE_URL` | Settings → Database → Session pooler URI (with your password) |
| `STUDIO_ALLOWLIST` | your email, comma-separated for more |

## 3. Database schema

```bash
npm run db:migrate      # applies drizzle/*.sql to your Supabase Postgres
```

(`npm run db:generate` regenerates the SQL after editing `lib/db/schema.ts`;
`npm run db:studio` opens Drizzle Studio.)

## 4. Run

```bash
npm run dev
```

- `/` — landing page (no auth)
- `/login` — email sign-in link
- `/studio` — requires an allowlisted email

If your email isn't in `STUDIO_ALLOWLIST`, you'll sign in fine but land on a
"no access" screen — add the address and restart `next dev`.
