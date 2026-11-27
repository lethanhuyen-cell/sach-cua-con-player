-- ============================================================================
-- LITIBOOK — SUPABASE POSTGRESQL SCHEMA (v1.2 — Aligned with GEMINI.md & PRD v1.3)
-- 6 Clean Tables: voice_profiles, books, parts, episodes, audio_tracks, illustrations
-- ============================================================================

create extension if not exists "pgcrypto";

-- 1. Global Reusable Voice Profiles
create table if not exists public.voice_profiles (
  id uuid primary key default gen_random_uuid(),
  voice_key text not null unique,
  display_name text not null,
  narrator_name text default '',
  notes text default '',
  created_at timestamptz not null default now()
);

-- 2. Books / Series
create table if not exists public.books (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  subtitle text default '',
  description text default '',
  author text default '',
  illustrator text default '',
  age_range text default '3–9 tuổi',
  genre_tag text default 'Thiên nhiên',
  rights_confirmed boolean not null default false,
  cover_url text default '',
  cover_focal_point text not null default 'center' check (cover_focal_point in ('top', 'center', 'bottom')),
  theme_preset text not null default 'moss' check (theme_preset in ('moss', 'ochre', 'rosewood', 'lavender')),
  toc_mode text not null default 'thematic' check (toc_mode in ('thematic', 'sequential')),
  default_auto_next boolean not null default false,
  show_episode_numbers boolean not null default true,
  sort_order integer not null default 0,
  status text not null default 'draft' check (status in ('draft', 'published')),
  knowledge_meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz default null
);

-- 3. Optional Parts / Seasons inside a Book
create table if not exists public.parts (
  id uuid primary key default gen_random_uuid(),
  book_id uuid not null references public.books(id) on delete cascade,
  title text not null,
  description text default '',
  cover_url text default '',
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- 4. Episodes (No end_note / relic fields per GEMINI.md Constitution)
create table if not exists public.episodes (
  id uuid primary key default gen_random_uuid(),
  book_id uuid not null references public.books(id) on delete cascade,
  part_id uuid references public.parts(id) on delete set null,
  episode_code text not null default '01',
  title text not null,
  summary text default '',
  category_tag text default '',
  cover_url text default '',
  content_markdown text not null default '',
  word_count integer not null default 0,
  is_text_only boolean not null default false,
  sort_order integer not null default 0,
  status text not null default 'draft' check (status in ('draft', 'published')),
  knowledge_meta jsonb not null default '{}'::jsonb,
  published_at timestamptz default null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz default null
);

-- 5. Multi-Voice Audio Tracks (<= 5 tracks/episode, <= 60MB each)
create table if not exists public.audio_tracks (
  id uuid primary key default gen_random_uuid(),
  episode_id uuid not null references public.episodes(id) on delete cascade,
  voice_profile_id uuid not null references public.voice_profiles(id) on delete restrict,
  audio_url text not null,
  duration_seconds integer not null default 0,
  file_size_bytes bigint not null default 0,
  mime_type text not null default 'audio/mpeg',
  is_default boolean not null default false,
  sort_order integer not null default 0,
  updated_at timestamptz not null default now()
);

-- 6. Portrait 3:4 Episode Illustrations (<= 20 illustrations/episode, <= 5MB each, NO caption)
create table if not exists public.illustrations (
  id uuid primary key default gen_random_uuid(),
  episode_id uuid not null references public.episodes(id) on delete cascade,
  image_url text not null,
  alt_text text default '',
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- Safe non-destructive migration for existing deployments (Knowledge Architecture v2.0)
alter table public.books add column if not exists knowledge_meta jsonb not null default '{}'::jsonb;
alter table public.episodes add column if not exists knowledge_meta jsonb not null default '{}'::jsonb;

-- Indexes for fast mobile queries (< 2.5s on 4G) & faceted knowledge discovery
create index if not exists idx_books_status on public.books(status, deleted_at, sort_order);
create index if not exists idx_books_knowledge_meta on public.books using gin (knowledge_meta);
create index if not exists idx_episodes_book on public.episodes(book_id, status, deleted_at, sort_order);
create index if not exists idx_episodes_knowledge_meta on public.episodes using gin (knowledge_meta);
create index if not exists idx_audio_episode on public.audio_tracks(episode_id, sort_order);
create index if not exists idx_illustrations_episode on public.illustrations(episode_id, sort_order);

-- Row Level Security: Public read for published non-deleted content; Service Role / Authenticated Admin for writes
alter table public.voice_profiles enable row level security;
alter table public.books enable row level security;
alter table public.parts enable row level security;
alter table public.episodes enable row level security;
alter table public.audio_tracks enable row level security;
alter table public.illustrations enable row level security;

create policy "Public read voice_profiles" on public.voice_profiles for select using (true);
create policy "Public read published books" on public.books for select using (status = 'published' and deleted_at is null);
create policy "Public read parts" on public.parts for select using (true);
create policy "Public read published episodes" on public.episodes for select using (status = 'published' and deleted_at is null);
create policy "Public read audio_tracks" on public.audio_tracks for select using (true);
create policy "Public read illustrations" on public.illustrations for select using (true);
