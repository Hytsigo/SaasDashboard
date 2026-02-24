create or replace function public.handle_new_user_onboarding()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  email_local text;
  workspace_slug text;
  workspace_name text;
  v_org_id uuid;
begin
  email_local := split_part(coalesce(new.email, ''), '@', 1);
  email_local := regexp_replace(lower(email_local), '[^a-z0-9]+', '-', 'g');
  email_local := trim(both '-' from email_local);

  if email_local = '' then
    email_local := 'workspace';
  end if;

  workspace_slug := email_local || '-' || left(new.id::text, 8);
  workspace_name := initcap(replace(email_local, '-', ' ')) || ' Workspace';

  insert into public.organizations (name, slug)
  values (workspace_name, workspace_slug)
  returning id into v_org_id;

  insert into public.memberships (organization_id, user_id, role)
  values (v_org_id, new.id, 'owner')
  on conflict (organization_id, user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user_onboarding();
