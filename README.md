# 🎬 CineVerse

A cinematic movie streaming platform with dual roles: **Viewers** stream movies, **Agents** upload & earn.

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
npm install @supabase/supabase-js react-router-dom
npx tailwindcss init -p
```

### 2. Run Locally
```bash
npm start
```

### 3. Build for Production
```bash
npm run build
```

---

## 📦 Deploy to Vercel

1. Push to GitHub
2. Go to [vercel.com](https://vercel.com) → New Project
3. Import your GitHub repo
4. Set **Framework**: Create React App
5. Click **Deploy** ✅

The `vercel.json` handles SPA routing automatically.

---

## 🔥 Supabase Backend

**Project URL:** `https://aenmyjyehdekqhnrchcw.supabase.co`

### Tables (already created):
- `users` — user profiles with roles
- `movies` — full-length films
- `shorts` — TikTok-style videos
- `downloads` — download tracking
- `earnings` — agent revenue
- `watchlist` — viewer saved movies
- `continue_watching` — resume progress
- `reviews` — movie ratings

### Storage Buckets (already created):
- `cinverse_movies` — movie files
- `cinverse_shorts` — short clips
- `cinverse_avatars` — profile pictures

---

## 🔐 Supabase Row Level Security (RLS)

Enable RLS and add these policies in Supabase SQL Editor:

```sql
-- Allow users to read their own data
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own" ON users FOR SELECT USING (auth.uid()::text = uid);
CREATE POLICY "Users insert own" ON users FOR INSERT WITH CHECK (auth.uid()::text = uid);

-- Movies readable by all
ALTER TABLE movies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone reads published movies" ON movies FOR SELECT USING (status = 'published');
CREATE POLICY "Agents manage own movies" ON movies FOR ALL USING (auth.uid()::text = agent_id);

-- Shorts
ALTER TABLE shorts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone reads published shorts" ON shorts FOR SELECT USING (status = 'published');
CREATE POLICY "Agents manage own shorts" ON shorts FOR ALL USING (auth.uid()::text = agent_id);

-- Watchlist
ALTER TABLE watchlist ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own watchlist" ON watchlist FOR ALL USING (auth.uid()::text = user_id);

-- Downloads
ALTER TABLE downloads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users insert downloads" ON downloads FOR INSERT WITH CHECK (auth.uid()::text = user_id);
CREATE POLICY "Agents read own downloads" ON downloads FOR SELECT USING (auth.uid()::text = agent_id);

-- Earnings
ALTER TABLE earnings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Agents read own earnings" ON earnings FOR SELECT USING (auth.uid()::text = agent_id);
CREATE POLICY "Agents update own earnings" ON earnings FOR UPDATE USING (auth.uid()::text = agent_id);
```

---

## 🎨 Features

### Viewer Dashboard
- 🏠 Home with hero banner & movie rows by genre
- 🔍 Search with genre filters
- ⚡ TikTok-style shorts feed
- 📌 Watchlist & Continue Watching

### Agent Dashboard
- 📊 Earnings overview with $5/1K download display
- ⬆️ Upload movies & shorts (URL or file)
- 🎬 Content manager (publish/unpublish/delete)
- 💰 Analytics with top performers & download history

---

## 💰 Earnings Model

```
$5 earned per 1,000 downloads
Total Earnings = floor(total_downloads / 1000) × $5
```
