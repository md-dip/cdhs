-- CHHATNI DEKHRA HIGH SCHOOL website — Supabase schema
--
-- Run this once in the Supabase dashboard: Project -> SQL Editor -> New query -> paste -> Run.
-- It is safe to re-run (uses IF NOT EXISTS / ON CONFLICT DO NOTHING) except for the CREATE POLICY
-- statements, which will error if you run the script twice — drop the relevant policies first if
-- you need to re-apply changes.
--
-- Why things are shaped this way:
--   * Every public-facing table has a `status` column and a Row Level Security (RLS) policy that
--     only lets anonymous visitors read rows where status = 'published'. Admins (checked via
--     is_admin(), not just "any logged in user") can read/write everything. This means SQL
--     injection has nowhere to reach: the app never sends raw SQL, only PostgREST calls, and even
--     a forged request is still bound by these policies at the database layer.
--   * Column names are double-quoted to match the frontend's existing camelCase field names
--     (e.g. "admissionRoll") exactly, so no application code needs to be renamed.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Helper: bump updated_at automatically on every UPDATE
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- profiles: one row per admin user, linked 1:1 to Supabase Auth's auth.users.
-- Passwords are never stored here — Supabase Auth handles those (hashed).
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null default '',
  email text not null,
  role text not null default 'editor' check (role in ('super-admin', 'editor', 'viewer')),
  active boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop trigger if exists set_updated_at on public.profiles;
create trigger set_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

-- security definer + empty search_path: a hardened pattern so this function can't be tricked by a
-- malicious search_path into resolving "profiles" to some other schema's table.
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and active = true
  );
$$;

create policy "profiles: read own row" on public.profiles
  for select to authenticated
  using (id = auth.uid());

create policy "profiles: admins read all" on public.profiles
  for select to authenticated
  using (public.is_admin());

-- Deliberately stricter than is_admin(): any active admin can read all profiles
-- (above), but only a super-admin can change roles/active flags — otherwise an
-- "editor" or "viewer" admin could promote themselves to super-admin.
create or replace function public.is_super_admin()
returns boolean
language sql
security definer
stable
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and active = true and role = 'super-admin'
  );
$$;

-- id <> auth.uid() blocks a super-admin from changing their OWN row through
-- this policy — otherwise they can demote or deactivate themselves and get
-- locked out with nobody left who can undo it.
create policy "profiles: super-admins update" on public.profiles
  for update to authenticated
  using (public.is_super_admin() and id <> auth.uid())
  with check (public.is_super_admin() and id <> auth.uid());

-- New Supabase Auth sign-ups get a profile row automatically. New admins start INACTIVE
-- (active = false) on purpose — see the bootstrap note at the bottom of this file.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, name, email, role, active)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', new.email),
    new.email,
    'editor',
    false
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Content collections — one table per admin-config.ts section.
-- Each gets: id/created_at/updated_at, a "public read published rows" policy,
-- and an "admins do anything" policy.
-- ---------------------------------------------------------------------------

create table if not exists public.notices (
  id uuid primary key default gen_random_uuid(),
  title text not null default '',
  slug text unique,
  category text not null default '',
  date text not null default '',
  file text not null default '',
  body text not null default '',
  status text not null default 'published' check (status in ('published', 'unpublished')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.routines (
  id uuid primary key default gen_random_uuid(),
  title text not null default '',
  published text not null default '',
  file text not null default '',
  rows text not null default '',
  status text not null default 'published' check (status in ('published', 'unpublished')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.teachers (
  id uuid primary key default gen_random_uuid(),
  name text not null default '',
  role text not null default '',
  subject text not null default '',
  phone text not null default '',
  photo text not null default '',
  status text not null default 'published' check (status in ('published', 'unpublished')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.committee (
  id uuid primary key default gen_random_uuid(),
  serial text not null default '',
  name text not null default '',
  designation text not null default '',
  phone text not null default '',
  status text not null default 'published' check (status in ('published', 'unpublished')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.students (
  id uuid primary key default gen_random_uuid(),
  name text not null default '',
  gender text not null default '' check (gender in ('', 'ছাত্র', 'ছাত্রী')),
  "admissionRoll" text not null default '',
  "classRoll" text not null default '',
  "className" text not null default '',
  session text not null default '',
  "group" text not null default '',
  guardian text not null default '',
  phone text not null default '',
  photo text not null default '',
  status text not null default 'published' check (status in ('published', 'unpublished')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.admissions (
  id uuid primary key default gen_random_uuid(),
  name text not null default '',
  "className" text not null default '',
  session text not null default '',
  guardian text not null default '',
  phone text not null default '',
  "applicationState" text not null default 'pending' check ("applicationState" in ('pending', 'approved', 'cancelled')),
  status text not null default 'unpublished' check (status in ('published', 'unpublished')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.classes (
  id uuid primary key default gen_random_uuid(),
  name text not null default '',
  number text not null default '',
  seats text not null default '',
  "group" text not null default '',
  rules text not null default '',
  "admissionOpen" text not null default 'on' check ("admissionOpen" in ('on', 'off')),
  status text not null default 'published' check (status in ('published', 'unpublished')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.books (
  id uuid primary key default gen_random_uuid(),
  name text not null default '',
  code text not null default '',
  "className" text not null default '',
  status text not null default 'published' check (status in ('published', 'unpublished')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  title text not null default '',
  category text not null default '',
  date text not null default '',
  image text not null default '',
  body text not null default '',
  status text not null default 'published' check (status in ('published', 'unpublished')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.pages (
  id uuid primary key default gen_random_uuid(),
  title text not null default '',
  slug text unique,
  image text not null default '',
  body text not null default '',
  status text not null default 'published' check (status in ('published', 'unpublished')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.gallery (
  id uuid primary key default gen_random_uuid(),
  caption text not null default '',
  src text not null default '',
  status text not null default 'published' check (status in ('published', 'unpublished')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

do $$
declare
  t text;
begin
  foreach t in array array[
    'notices', 'routines', 'teachers', 'committee', 'students',
    'admissions', 'classes', 'books', 'posts', 'pages', 'gallery'
  ]
  loop
    execute format('alter table public.%I enable row level security;', t);

    execute format('drop trigger if exists set_updated_at on public.%I;', t);
    execute format(
      'create trigger set_updated_at before update on public.%I for each row execute function public.set_updated_at();',
      t
    );

    execute format(
      'create policy "%1$s: public read published" on public.%1$I for select to anon, authenticated using (status = ''published'');',
      t
    );
    execute format(
      'create policy "%1$s: admins manage" on public.%1$I for all to authenticated using (public.is_admin()) with check (public.is_admin());',
      t
    );
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- settings: single row of school-wide info (name, address, phone, ...).
-- Publicly readable (Header/Footer show it on every page), admin-only to edit.
-- ---------------------------------------------------------------------------
create table if not exists public.settings (
  id smallint primary key default 1 check (id = 1),
  "nameBn" text not null default '',
  "nameEn" text not null default '',
  address text not null default '',
  phone text not null default '',
  email text not null default '',
  eiin text not null default '',
  "headName" text not null default '',
  "headTitle" text not null default '',
  "headPhoto" text not null default '',
  "headMessage" text not null default '',
  motto text not null default '',
  founded text not null default '',
  updated_at timestamptz not null default now()
);

insert into public.settings (id) values (1) on conflict (id) do nothing;

alter table public.settings enable row level security;

drop trigger if exists set_updated_at on public.settings;
create trigger set_updated_at before update on public.settings
  for each row execute function public.set_updated_at();

create policy "settings: public read" on public.settings
  for select to anon, authenticated
  using (true);

create policy "settings: admins update" on public.settings
  for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- media: the admin media-library index. The actual files live in Storage
-- (bucket "media", created below); this table just tracks what was uploaded.
-- Admin-only — not meant for public browsing (unlike the files themselves,
-- which are served from a public bucket so <img> tags work site-wide).
-- ---------------------------------------------------------------------------
create table if not exists public.media (
  id uuid primary key default gen_random_uuid(),
  name text not null default '',
  storage_path text,
  url text not null,
  mime_type text,
  size_bytes bigint,
  created_by uuid references public.profiles (id) default auth.uid(),
  created_at timestamptz not null default now()
);

alter table public.media enable row level security;

create policy "media: admins manage" on public.media
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- Storage bucket for uploaded media
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

create policy "media bucket: public read"
  on storage.objects for select
  to public
  using (bucket_id = 'media');

create policy "media bucket: admins upload"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'media' and public.is_admin());

create policy "media bucket: admins update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'media' and public.is_admin());

create policy "media bucket: admins delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'media' and public.is_admin());

-- ---------------------------------------------------------------------------
-- BOOTSTRAP — read this before you log in for the first time.
-- ---------------------------------------------------------------------------
-- New sign-ups get a profile with active = false (nobody should be able to grant
-- themselves admin just by registering). To create your first real admin:
--   1. Supabase dashboard -> Authentication -> Users -> Add user
--      (or sign up once through the site's own login/register flow once it's wired up).
--   2. Back here in the SQL editor, run:
--        update public.profiles
--        set role = 'super-admin', active = true
--        where email = 'you@example.com';
--   Every admin you invite after that can be managed from the app's own Users page,
--   since a super-admin can flip role/active on other profiles.
