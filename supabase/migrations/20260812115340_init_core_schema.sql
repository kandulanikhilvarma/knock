-- Core schema per services-app-master-plan.md §8. RLS on every table.
-- Applied to project bbzbiffpyuznlivbqmih (Mumbai/ap-south-1). Source of truth for the schema.

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name_en text not null,
  name_te text not null,
  name_hi text not null,
  tier text not null check (tier in ('A','B')),
  is_live boolean not null default false,
  icon text,
  sort int not null default 0,
  created_at timestamptz not null default now()
);

-- App profile, 1:1 with auth.users.
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'customer' check (role in ('customer','provider')),
  lang text not null default 'en' check (lang in ('en','te','hi')),
  full_name text,
  phone text,
  created_at timestamptz not null default now()
);

-- Provider directory card. upi_id deliberately NOT here (locked table at P5).
create table public.provider_profiles (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  services text[] not null default '{}',
  bio text,
  years_exp int,
  photo_url text,
  voice_intro_url text,
  city text,
  area_geohash text,
  visiting_charge int,
  verify_tier text not null default 'basic' check (verify_tier in ('basic','verified')),
  availability_status text not null default 'available' check (availability_status in ('available','busy','paused')),
  created_at timestamptz not null default now()
);

-- Recomputed by trigger later; feeds dispatch score. Public read, no client write.
create table public.provider_stats (
  provider_id uuid primary key references public.provider_profiles(user_id) on delete cascade,
  rating_avg numeric(3,2) not null default 0,
  acceptance_rate numeric(4,3) not null default 0.5,
  completion_rate numeric(4,3) not null default 0.5,
  jobs_done int not null default 0,
  updated_at timestamptz not null default now()
);

create table public.waitlist_signups (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.categories(id) on delete set null,
  phone text not null,
  city text,
  created_at timestamptz not null default now()
);

-- RLS
alter table public.categories enable row level security;
alter table public.profiles enable row level security;
alter table public.provider_profiles enable row level security;
alter table public.provider_stats enable row level security;
alter table public.waitlist_signups enable row level security;

create policy categories_read on public.categories for select using (true);

-- profiles: owner-only. Anon sees nothing; authed sees only their own row (phone never leaks).
create policy profiles_select_own on public.profiles for select using (auth.uid() = id);
create policy profiles_insert_own on public.profiles for insert with check (auth.uid() = id);
create policy profiles_update_own on public.profiles for update using (auth.uid() = id);

-- provider directory: public read, owner write.
create policy pp_read on public.provider_profiles for select using (true);
create policy pp_insert_own on public.provider_profiles for insert with check (auth.uid() = user_id);
create policy pp_update_own on public.provider_profiles for update using (auth.uid() = user_id);

create policy ps_read on public.provider_stats for select using (true);

create policy waitlist_insert on public.waitlist_signups for insert with check (true);
