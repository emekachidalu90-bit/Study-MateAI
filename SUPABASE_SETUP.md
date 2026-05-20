# 🗄️ Supabase Setup Guide (Free — Permanent Storage)

Supabase is a free PostgreSQL database that keeps your accounts alive across Render restarts.
Takes about 5 minutes.

---

## Step 1 — Create free Supabase project

1. Go to **https://supabase.com** and sign up (free)
2. Click **New project**
3. Name it `studymate`, set a database password (save it), choose a region
4. Wait ~2 minutes for the project to be ready

---

## Step 2 — Create the tables

1. In your Supabase project, go to the **SQL Editor** (left sidebar)
2. Click **New query**
3. Paste this entire SQL block and click **Run**:

```sql
-- Users table
create table if not exists users (
  id           text primary key,
  name         text not null,
  email        text unique,
  password     text,
  avatar       text default '?',
  avatar_url   text,
  oauth        jsonb default '{}',
  streak       integer default 0,
  xp           integer default 0,
  level        integer default 1,
  last_login   text,
  created_at   text
);

-- Notes table
create table if not exists notes (
  id            text primary key,
  user_id       text not null references users(id) on delete cascade,
  title         text not null,
  content       text default '',
  file_path     text,
  original_name text,
  mimetype      text,
  size          integer default 0,
  type          text default 'text',
  tags          jsonb default '[]',
  summary       text default '',
  flashcards    jsonb default '[]',
  created_at    text,
  updated_at    text
);

-- Index for fast note lookups by user
create index if not exists notes_user_id_idx on notes(user_id);

-- Disable Row Level Security (the app uses its own JWT auth)
alter table users disable row level security;
alter table notes disable row level security;
```

4. You should see "Success. No rows returned"

---

## Step 3 — Get your credentials

1. Go to **Project Settings** (gear icon, bottom left)
2. Click **API**
3. Copy two values:
   - **Project URL** — looks like `https://xxxxxxxxxxxx.supabase.co`
   - **service_role key** (under "Project API keys") — the long `eyJ…` string  
     ⚠️ Use the **service_role** key, NOT the anon key

---

## Step 4 — Add to Render

1. Go to your Render service → **Environment**
2. Add these variables:

| Key | Value |
|---|---|
| `SUPABASE_URL` | `https://xxxxxxxxxxxx.supabase.co` |
| `SUPABASE_SERVICE_KEY` | `eyJ...` (the service_role key) |
| `BASE_URL` | `https://your-app.onrender.com` |
| `CLIENT_URL` | `https://your-app.onrender.com` |

3. Click **Save Changes** — Render redeploys automatically

---

## Step 5 — Verify

In Render's logs you should see:
```
[db] ✅ Supabase connected
[store] loaded 0 users, 0 notes from Supabase
    Database: ✅ Supabase (permanent)
```

Now register an account — it's stored permanently in Supabase and survives all Render restarts.

---

## Troubleshooting

| Problem | Fix |
|---|---|
| `relation "users" does not exist` | Run the SQL from Step 2 in the SQL Editor |
| `Invalid API key` | Make sure you used the **service_role** key, not the anon key |
| `connection refused` | Check SUPABASE_URL has no trailing slash |
| Still losing data | Verify both env vars are set in Render and the server restarted |

---

## Viewing your data

Go to your Supabase project → **Table Editor** to see all registered users and notes directly.
