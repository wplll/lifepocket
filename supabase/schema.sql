create extension if not exists "pgcrypto";

do $$
begin
  if not exists (select 1 from pg_type where typname = 'life_card_type') then
    create type life_card_type as enum (
      'expense',
      'bill',
      'appointment',
      'shopping',
      'travel',
      'warranty',
      'todo',
      'other'
    );
  end if;
end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  created_at timestamptz not null default now()
);

create table if not exists public.life_cards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type life_card_type not null default 'other',
  title text not null,
  summary text,
  amount numeric(12, 2),
  currency text not null default 'CNY',
  occurred_at timestamptz,
  reminder_at timestamptz,
  place text,
  merchant text,
  category text,
  source_kind text not null check (source_kind in ('text', 'image')),
  source_text text,
  source_file_path text,
  extracted jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.reminders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  card_id uuid references public.life_cards(id) on delete cascade,
  title text not null,
  remind_at timestamptz not null,
  status text not null default 'pending' check (status in ('pending', 'done', 'dismissed')),
  created_at timestamptz not null default now()
);

create table if not exists public.checklists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  kind text not null check (kind in ('shopping', 'travel', 'outing', 'custom')),
  context text,
  items jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.life_cards enable row level security;
alter table public.reminders enable row level security;
alter table public.checklists enable row level security;

create policy "profiles are owned by user"
  on public.profiles for all
  using (id = auth.uid())
  with check (id = auth.uid());

create policy "life cards are owned by user"
  on public.life_cards for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "reminders are owned by user"
  on public.reminders for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "checklists are owned by user"
  on public.checklists for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

insert into storage.buckets (id, name, public)
values ('life-uploads', 'life-uploads', false)
on conflict (id) do nothing;

create policy "users can read own upload objects"
  on storage.objects for select
  using (
    bucket_id = 'life-uploads'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "users can upload own objects"
  on storage.objects for insert
  with check (
    bucket_id = 'life-uploads'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "users can update own objects"
  on storage.objects for update
  using (
    bucket_id = 'life-uploads'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'life-uploads'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
