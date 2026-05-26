# AnimeX 🎌

A dark, Netflix-style anime streaming website built with React + Vite + Supabase.

## Features
- 🎬 Browse anime in a responsive poster grid
- 🔍 Search by title, filter by genre
- ▶️ Built-in HTML5 video player with controls
- ⬇️ Per-episode download button
- ➕ Floating upload button to add anime + episodes
- 📦 Supabase storage for posters & videos (or paste video URLs)
- 📱 Fully mobile responsive

---

## Supabase Setup

### 1. Run the SQL schema

Copy `supabase_schema.sql` and run it in your Supabase **SQL Editor**.

It will create:
- **Tables**: `anime`, `episodes`, `profiles`
- **Storage buckets**: `anime_thumbnails`, `video-episodes`, `user-avatars`
- **RLS policies** for public read and open write

### 2. Verify buckets exist

In Supabase → Storage, confirm these three buckets are present and set to **Public**:

| Bucket name        | Used for              |
|--------------------|-----------------------|
| `anime_thumbnails` | Anime poster images   |
| `video-episodes`   | Uploaded episode videos |
| `user-avatars`     | User profile pictures |

### 3. Cross-check table columns

| Table     | Key columns                                              |
|-----------|----------------------------------------------------------|
| `anime`   | id, title, description, genre, status, year, poster_path |
| `episodes`| id, anime_id, episode_number, title, description, video_path, video_url |
| `profiles`| id, username, avatar_path                                |

---

## Local Development

```bash
npm install
npm run dev
```

Open http://localhost:5173

## Build for Production

```bash
npm run build
```

Deploy the `dist/` folder to Vercel, Netlify, or any static host.

---

## Project Structure

```
animex/
├── index.html
├── vite.config.js
├── package.json
├── supabase_schema.sql        ← Run this in Supabase SQL Editor
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── index.css
    ├── lib/
    │   └── supabase.js        ← Supabase client + bucket helpers
    ├── components/
    │   ├── Navbar.jsx / .css
    │   ├── AnimeCard.jsx / .css
    │   ├── VideoPlayer.jsx / .css
    │   └── UploadFAB.jsx / .css
    └── pages/
        ├── HomePage.jsx / .css
        └── AnimePage.jsx / .css
```

## Credentials (already set in `src/lib/supabase.js`)

```
URL:  https://uqpqcaicarwmpucdpcfc.supabase.co
KEY:  sb_publishable_1d5e6_Ucz34__qfSYwEH-g_9j9NBWtj
```

> ⚠️ This is a publishable/anon key — safe for frontend use. Do not use a service role key here.
