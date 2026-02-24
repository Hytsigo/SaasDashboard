alter table public.memberships enable row level security;
alter table public.leads enable row level security;

drop policy if exists memberships_select_own_memberships on public.memberships;
drop policy if exists memberships_manage_admin_owner on public.memberships;
drop policy if exists memberships_manage_owner_only on public.memberships;
drop policy if exists memberships_select_policy on public.memberships;

drop function if exists public.is_owner_in_org(uuid);

create function public.is_owner_in_org(org_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.memberships m
    where m.organization_id = org_id
      and m.user_id = auth.uid()
      and m.role = 'owner'
  );
$$;

grant execute on function public.is_owner_in_org(uuid) to authenticated;

create policy memberships_select_policy
  on public.memberships for select
  to authenticated
  using (
    memberships.user_id = auth.uid()
    or public.is_owner_in_org(memberships.organization_id)
  );

create policy memberships_manage_owner_only
  on public.memberships for update
  to authenticated
  using (public.is_owner_in_org(memberships.organization_id))
  with check (public.is_owner_in_org(memberships.organization_id));

create or replace function public.prevent_member_soft_delete()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  actor_role text;
begin
  if old.deleted_at is null and new.deleted_at is not null then
    select m.role into actor_role
    from public.memberships m
    where m.organization_id = old.organization_id
      and m.user_id = auth.uid()
    limit 1;

    if actor_role is null then
      raise exception 'Forbidden';
    end if;

    if actor_role not in ('owner', 'admin') then
      raise exception 'Only admin or owner can soft delete leads';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_prevent_member_soft_delete on public.leads;
create trigger trg_prevent_member_soft_delete
before update on public.leads
for each row
execute function public.prevent_member_soft_delete();
