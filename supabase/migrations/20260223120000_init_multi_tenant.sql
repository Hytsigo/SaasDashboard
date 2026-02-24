create extension if not exists pgcrypto;

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.memberships (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('owner', 'admin', 'member')),
  created_at timestamptz not null default timezone('utc', now()),
  unique (organization_id, user_id)
);

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  email text not null,
  status text not null check (status in ('new', 'contacted', 'won', 'lost')),
  phone text,
  company text,
  source text,
  notes text,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  deleted_at timestamptz,
  unique (organization_id, email)
);

create table if not exists public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  actor_id uuid references auth.users(id),
  entity_type text not null,
  entity_id uuid,
  action text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_memberships_user on public.memberships(user_id);
create index if not exists idx_memberships_org on public.memberships(organization_id);

create index if not exists idx_leads_org_created_at
  on public.leads(organization_id, created_at desc)
  where deleted_at is null;

create index if not exists idx_leads_org_status
  on public.leads(organization_id, status)
  where deleted_at is null;

create index if not exists idx_leads_org_email
  on public.leads(organization_id, email);

create index if not exists idx_activity_logs_org_created_at
  on public.activity_logs(organization_id, created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists trg_leads_set_updated_at on public.leads;
create trigger trg_leads_set_updated_at
before update on public.leads
for each row
execute function public.set_updated_at();

alter table public.organizations enable row level security;
alter table public.memberships enable row level security;
alter table public.leads enable row level security;
alter table public.activity_logs enable row level security;

drop policy if exists "organizations_select_member" on public.organizations;
create policy "organizations_select_member"
  on public.organizations for select
  using (
    exists (
      select 1
      from public.memberships
      where memberships.organization_id = organizations.id
        and memberships.user_id = auth.uid()
    )
  );

drop policy if exists "memberships_select_own_memberships" on public.memberships;
create policy "memberships_select_own_memberships"
  on public.memberships for select
  using (
    memberships.user_id = auth.uid()
    or exists (
      select 1
      from public.memberships as m
      where m.organization_id = memberships.organization_id
        and m.user_id = auth.uid()
        and m.role in ('owner', 'admin')
    )
  );

drop policy if exists "memberships_manage_admin_owner" on public.memberships;
create policy "memberships_manage_admin_owner"
  on public.memberships for all
  using (
    exists (
      select 1
      from public.memberships as m
      where m.organization_id = memberships.organization_id
        and m.user_id = auth.uid()
        and m.role in ('owner', 'admin')
    )
  )
  with check (
    exists (
      select 1
      from public.memberships as m
      where m.organization_id = memberships.organization_id
        and m.user_id = auth.uid()
        and m.role in ('owner', 'admin')
    )
  );

drop policy if exists "leads_select_org_members" on public.leads;
create policy "leads_select_org_members"
  on public.leads for select
  using (
    exists (
      select 1
      from public.memberships
      where memberships.organization_id = leads.organization_id
        and memberships.user_id = auth.uid()
    )
  );

drop policy if exists "leads_insert_org_members" on public.leads;
create policy "leads_insert_org_members"
  on public.leads for insert
  with check (
    exists (
      select 1
      from public.memberships
      where memberships.organization_id = leads.organization_id
        and memberships.user_id = auth.uid()
    )
  );

drop policy if exists "leads_update_org_members" on public.leads;
create policy "leads_update_org_members"
  on public.leads for update
  using (
    exists (
      select 1
      from public.memberships
      where memberships.organization_id = leads.organization_id
        and memberships.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.memberships
      where memberships.organization_id = leads.organization_id
        and memberships.user_id = auth.uid()
    )
  );

drop policy if exists "activity_logs_select_org_members" on public.activity_logs;
create policy "activity_logs_select_org_members"
  on public.activity_logs for select
  using (
    exists (
      select 1
      from public.memberships
      where memberships.organization_id = activity_logs.organization_id
        and memberships.user_id = auth.uid()
    )
  );

drop policy if exists "activity_logs_insert_org_members" on public.activity_logs;
create policy "activity_logs_insert_org_members"
  on public.activity_logs for insert
  with check (
    exists (
      select 1
      from public.memberships
      where memberships.organization_id = activity_logs.organization_id
        and memberships.user_id = auth.uid()
    )
  );
