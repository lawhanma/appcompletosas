-- Cadastro e perfis: senhas são gerenciadas exclusivamente por Supabase Auth.
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '' check (char_length(full_name) <= 200),
  phone text not null default '' check (char_length(phone) <= 40),
  pix_key text not null default '' check (char_length(pix_key) <= 200),
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
revoke all on public.profiles from anon, authenticated;
grant select on public.profiles to authenticated;
grant update (full_name, phone, pix_key) on public.profiles to authenticated;
create policy profiles_read_own on public.profiles for select to authenticated using ((select auth.uid()) = id);
create policy profiles_update_own on public.profiles for update to authenticated
  using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

create function public.create_shopgo_profile() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, full_name, phone) values (
    new.id, left(coalesce(new.raw_user_meta_data->>'full_name',''),200),
    left(coalesce(new.raw_user_meta_data->>'phone',''),40)
  );
  return new;
end;
$$;
revoke all on function public.create_shopgo_profile() from public, anon, authenticated;
create trigger shopgo_user_created after insert on auth.users
for each row execute function public.create_shopgo_profile();

-- Registros de licença são administrados no servidor; usuários não escolhem o plano.
create schema if not exists shopgo_private;
revoke all on schema shopgo_private from public, anon, authenticated;
create table shopgo_private.access_codes (
  code_hash text primary key,
  plan text not null check (plan in ('standard','vip')),
  enabled boolean not null default true,
  expires_at timestamptz
);
create table shopgo_private.activation_attempts (
  user_id uuid primary key references auth.users(id) on delete cascade,
  attempts integer not null default 0,
  window_start timestamptz not null default now()
);
create table public.memberships (
  user_id uuid primary key references auth.users(id) on delete cascade,
  plan text not null check (plan in ('standard','vip')),
  active boolean not null default true,
  activated_at timestamptz not null default now()
);
alter table public.memberships enable row level security;
revoke all on public.memberships from anon, authenticated;
grant select on public.memberships to authenticated;
create policy memberships_read_own on public.memberships for select to authenticated using ((select auth.uid()) = user_id);

create function public.redeem_access_code(access_code text) returns boolean
language plpgsql security definer set search_path = '' as $$
declare
  current_user_id uuid := auth.uid();
  selected_plan text;
  attempt_count integer;
begin
  if current_user_id is null then return false; end if;
  if length(trim(access_code)) not between 5 and 128 then return false; end if;
  insert into shopgo_private.activation_attempts (user_id, attempts) values (current_user_id, 1)
  on conflict (user_id) do update set
    attempts = case when shopgo_private.activation_attempts.window_start < now() - interval '15 minutes'
                    then 1 else shopgo_private.activation_attempts.attempts + 1 end,
    window_start = case when shopgo_private.activation_attempts.window_start < now() - interval '15 minutes'
                       then now() else shopgo_private.activation_attempts.window_start end
  returning attempts into attempt_count;
  if attempt_count > 10 then return false; end if;
  select plan into selected_plan from shopgo_private.access_codes
    where code_hash = encode(sha256(convert_to(trim(access_code), 'UTF8')), 'hex')
      and enabled and (expires_at is null or expires_at > now());
  if selected_plan is null then return false; end if;
  insert into public.memberships (user_id, plan) values (current_user_id, selected_plan)
    on conflict (user_id) do update set plan = excluded.plan, active = true;
  return true;
end;
$$;
revoke all on function public.redeem_access_code(text) from public, anon;
grant execute on function public.redeem_access_code(text) to authenticated;

-- Mantém os códigos já existentes no protótipo. Substituí-los antes do uso comercial.
insert into shopgo_private.access_codes (code_hash, plan) values
  (encode(sha256(convert_to('101190','UTF8')),'hex'),'standard'),
  (encode(sha256(convert_to('887422','UTF8')),'hex'),'standard'),
  (encode(sha256(convert_to('123456','UTF8')),'hex'),'vip'),
  (encode(sha256(convert_to('12456','UTF8')),'hex'),'vip');
