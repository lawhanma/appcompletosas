create table public.channel_connections (
user_id uuid not null references auth.users(id) on delete cascade,
channel text not null check(channel in ('shopee','tiktok','mercadolivre')),
name text not null check(char_length(trim(name)) between 1 and 100),
email text not null check(char_length(email) between 3 and 254),
enabled boolean not null default true,
primary key(user_id,channel)
);
alter table public.channel_connections enable row level security;
revoke all on public.channel_connections from anon,authenticated;
grant select,insert,update on public.channel_connections to authenticated;
create policy channel_connections_read on public.channel_connections for select to authenticated using((select auth.uid())=user_id);
create policy channel_connections_create on public.channel_connections for insert to authenticated with check((select auth.uid())=user_id);
create policy channel_connections_change on public.channel_connections for update to authenticated using((select auth.uid())=user_id) with check((select auth.uid())=user_id);
