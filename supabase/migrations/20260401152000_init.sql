create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  created_at timestamptz not null default now()
);

create table if not exists public.estimates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  project_name text not null,
  currency text not null default 'NOK',
  original_file_path text not null,
  source_xml jsonb not null default '{}'::jsonb,
  total_amount numeric(14,2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.estimate_items (
  id uuid primary key default gen_random_uuid(),
  estimate_id uuid not null references public.estimates(id) on delete cascade,
  line_index integer not null,
  postnr text not null default '',
  code text not null default '',
  title text not null default '',
  description text not null default '',
  unit text not null default '',
  quantity numeric(14,4) not null default 0,
  unit_price numeric(14,2),
  comment text,
  line_total numeric(14,2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_estimates_user_id on public.estimates(user_id);
create index if not exists idx_estimate_items_estimate_id on public.estimate_items(estimate_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id) values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

create or replace trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace trigger set_estimates_updated_at
before update on public.estimates
for each row execute procedure public.set_updated_at();

create or replace trigger set_estimate_items_updated_at
before update on public.estimate_items
for each row execute procedure public.set_updated_at();

create or replace function public.recalculate_estimate_total(estimate_uuid uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.estimates e
  set total_amount = coalesce((
    select sum(line_total) from public.estimate_items where estimate_id = estimate_uuid
  ), 0)
  where e.id = estimate_uuid;
end;
$$;

alter table public.profiles enable row level security;
alter table public.estimates enable row level security;
alter table public.estimate_items enable row level security;

create policy "Users can read own profile"
on public.profiles
for select
using (auth.uid() = id);

create policy "Users can update own profile"
on public.profiles
for update
using (auth.uid() = id);

create policy "Users can insert own profile"
on public.profiles
for insert
with check (auth.uid() = id);

create policy "Users can manage own estimates"
on public.estimates
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can manage own estimate items"
on public.estimate_items
for all
using (
  exists (
    select 1
    from public.estimates e
    where e.id = estimate_id
      and e.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.estimates e
    where e.id = estimate_id
      and e.user_id = auth.uid()
  )
);

insert into storage.buckets (id, name, public)
values ('xml-source-files', 'xml-source-files', false)
on conflict (id) do nothing;

create policy "Users can upload own xml"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'xml-source-files' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can read own xml"
on storage.objects
for select
to authenticated
using (bucket_id = 'xml-source-files' and auth.uid()::text = (storage.foldername(name))[1]);
