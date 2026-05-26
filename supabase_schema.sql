-- ============================================================
-- AnimeX — Supabase Database Schema
-- Run this in Supabase SQL Editor to set up all tables & policies
-- ============================================================

-- ── 1. ANIME table ───────────────────────────────────────────
create table if not exists public.anime (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  description text,
  genre       text,                        -- comma-separated e.g. "Action, Fantasy"
  status      text default 'Ongoing',      -- Ongoing | Completed | Upcoming
  year        int,
  poster_path text,                        -- path inside anime_thumbnails bucket
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- ── 2. EPISODES table ────────────────────────────────────────
create table if not exists public.episodes (
  id             uuid primary key default gen_random_uuid(),
  anime_id       uuid not null references public.anime(id) on delete cascade,
  episode_number int not null,
  title          text not null,
  description    text,
  video_path     text,                     -- path inside video-episodes bucket
  video_url      text,                     -- external URL (YouTube, CDN, etc.)
  duration_secs  int,                      -- optional duration in seconds
  created_at     timestamptz default now(),
  unique (anime_id, episode_number)
);

-- Index for fast episode lookups per anime
create index if not exists episodes_anime_id_idx on public.episodes (anime_id, episode_number);

-- ── 3. PROFILES table ────────────────────────────────────────
-- (already existed in your DB; this is a safe create-if-not-exists)
create table if not exists public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  username   text,
  avatar_path text,                        -- path inside user-avatars bucket
  created_at timestamptz default now()
);

-- ── 4. Row-Level Security ─────────────────────────────────────
-- anime: anyone can read; authenticated can insert/update/delete
alter table public.anime enable row level security;

drop policy if exists "anime_public_read"  on public.anime;
drop policy if exists "anime_auth_write"   on public.anime;

create policy "anime_public_read"
  on public.anime for select using (true);

create policy "anime_auth_write"
  on public.anime for all
  using (true)          -- allow all for now (set to auth.role() = 'authenticated' to lock down)
  with check (true);

-- episodes: same as anime
alter table public.episodes enable row level security;

drop policy if exists "episodes_public_read" on public.episodes;
drop policy if exists "episodes_auth_write"  on public.episodes;

create policy "episodes_public_read"
  on public.episodes for select using (true);

create policy "episodes_auth_write"
  on public.episodes for all using (true) with check (true);

-- profiles: users see/edit own profile
alter table public.profiles enable row level security;

drop policy if exists "profiles_own_read"  on public.profiles;
drop policy if exists "profiles_own_write" on public.profiles;

create policy "profiles_own_read"
  on public.profiles for select using (true);

create policy "profiles_own_write"
  on public.profiles for all
  using (auth.uid() = id)
  with check (auth.uid() = id);


-- ── 5. Storage Buckets ───────────────────────────────────────
-- Create buckets if they don't exist (safe to re-run)
-- Bucket names must match what's in src/lib/supabase.js

insert into storage.buckets (id, name, public)
  values ('anime_thumbnails', 'anime_thumbnails', true)
  on conflict (id) do update set public = true;

insert into storage.buckets (id, name, public)
  values ('video-episodes', 'video-episodes', true)
  on conflict (id) do update set public = true;

insert into storage.buckets (id, name, public)
  values ('user-avatars', 'user-avatars', true)
  on conflict (id) do update set public = true;

-- Storage policies: allow public read, allow all uploads
drop policy if exists "thumbnails_public"  on storage.objects;
drop policy if exists "videos_public"      on storage.objects;
drop policy if exists "avatars_public"     on storage.objects;
drop policy if exists "storage_upload_all" on storage.objects;

create policy "thumbnails_public"
  on storage.objects for select
  using (bucket_id = 'anime_thumbnails');

create policy "videos_public"
  on storage.objects for select
  using (bucket_id = 'video-episodes');

create policy "avatars_public"
  on storage.objects for select
  using (bucket_id = 'user-avatars');

create policy "storage_upload_all"
  on storage.objects for insert
  with check (bucket_id in ('anime_thumbnails','video-episodes','user-avatars'));

create policy "storage_delete_all"
  on storage.objects for delete
  using (bucket_id in ('anime_thumbnails','video-episodes','user-avatars'));
