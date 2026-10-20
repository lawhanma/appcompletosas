create table public.affiliate_profiles (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
 name text not null check(char_length(trim(name)) between 1 and 60),
 platform text not null check(platform in ('instagram','tiktok','facebook','whatsapp','telegram','kwai','youtube')),
 handle text not null default '' check(char_length(handle)<=100), url text not null default '' check(url='' or url ~ '^https://'),
 color text not null default 'orange' check(color in ('orange','slate','rose','blue','green','violet')),
 archived boolean not null default false, created_at timestamptz not null default now(), unique(id,user_id)
);
create index affiliate_profiles_owner_idx on public.affiliate_profiles(user_id,created_at);
create table public.affiliate_profile_sales (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
 profile_id uuid not null, product text not null check(char_length(trim(product)) between 1 and 120),
 sold_on date not null, gross numeric(12,2) not null check(gross>0),
 commission numeric(12,2) not null default 0 check(commission>=0 and commission<=gross),
 order_ref text not null default '' check(char_length(order_ref)<=100),
 source text not null default 'manual' check(source='manual'), voided boolean not null default false,
 created_at timestamptz not null default now(),
 foreign key(profile_id,user_id) references public.affiliate_profiles(id,user_id)
);
create index affiliate_profile_sales_owner_date_idx on public.affiliate_profile_sales(user_id,sold_on,id);
create index affiliate_profile_sales_profile_idx on public.affiliate_profile_sales(profile_id,user_id);
create unique index affiliate_profile_sales_order_idx on public.affiliate_profile_sales(user_id,profile_id,order_ref) where order_ref <> '' and not voided;
alter table public.affiliate_profiles enable row level security;
alter table public.affiliate_profile_sales enable row level security;
revoke all on public.affiliate_profiles, public.affiliate_profile_sales from anon, authenticated;
grant select,insert,update on public.affiliate_profiles, public.affiliate_profile_sales to authenticated;
create policy affiliate_profiles_select on public.affiliate_profiles for select to authenticated using ((select auth.uid())=user_id);
create policy affiliate_profiles_insert on public.affiliate_profiles for insert to authenticated with check ((select auth.uid())=user_id);
create policy affiliate_profiles_update on public.affiliate_profiles for update to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
create policy affiliate_sales_select on public.affiliate_profile_sales for select to authenticated using ((select auth.uid())=user_id);
create policy affiliate_sales_insert on public.affiliate_profile_sales for insert to authenticated with check ((select auth.uid())=user_id);
create policy affiliate_sales_update on public.affiliate_profile_sales for update to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
