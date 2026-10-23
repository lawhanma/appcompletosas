create table public.ai_credit_entitlements (
 user_id uuid primary key references auth.users(id) on delete cascade,
 unlimited boolean not null default false,
 granted_at timestamptz not null default now()
);
alter table public.ai_credit_entitlements enable row level security;
revoke all on public.ai_credit_entitlements from public,anon,authenticated;
grant select on public.ai_credit_entitlements to authenticated;
create policy own_ai_credit_entitlement on public.ai_credit_entitlements for select to authenticated using ((select auth.uid())=user_id);
