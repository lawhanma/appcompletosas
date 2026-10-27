-- Owner-funded promotional rewards; never a sale, delivery or automated Pix payment.
create schema shopgo_rewards;
revoke all on schema shopgo_rewards from public,anon;
grant usage on schema shopgo_rewards to authenticated;
create table shopgo_rewards.eligibility(user_id uuid primary key references auth.users(id) on delete cascade);
create table shopgo_rewards.campaigns(
 id uuid primary key,user_id uuid not null references auth.users(id) on delete cascade,
 profile_id uuid not null,product text not null check(char_length(product) between 1 and 200),
 started_at timestamptz not null default clock_timestamp(),completed_at timestamptz,
 amount_cents integer not null default 0 check(amount_cents=0 or amount_cents between 500 and 1500),
 available_at timestamptz,
 foreign key(profile_id,user_id) references public.affiliate_profiles(id,user_id),
 check((amount_cents=0 and available_at is null) or (amount_cents>0 and completed_at is not null and available_at=completed_at+interval '192 hours'))
);
create index promotion_campaign_owner on shopgo_rewards.campaigns(user_id,completed_at);
create table shopgo_rewards.withdrawals(
 id uuid primary key,user_id uuid not null references auth.users(id) on delete cascade,
 amount_cents integer not null check(amount_cents>0),pix_key text not null check(char_length(trim(pix_key)) between 3 and 254),
 status text not null default 'requested' check(status in ('requested','paid','rejected')),
 created_at timestamptz not null default clock_timestamp(),paid_at timestamptz,
 check((status='paid' and paid_at is not null) or (status<>'paid' and paid_at is null))
);
create index promotion_withdrawal_owner on shopgo_rewards.withdrawals(user_id);
alter table shopgo_rewards.eligibility enable row level security;
alter table shopgo_rewards.campaigns enable row level security;
alter table shopgo_rewards.withdrawals enable row level security;
revoke all on all tables in schema shopgo_rewards from public,anon,authenticated;

create function shopgo_rewards.capture_purchase() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if encode(sha256(convert_to(trim(coalesce(new.raw_user_meta_data->>'purchase_code','')),'UTF8')),'hex')='c31407d4918c3f3c0720af68e33a2657f63e5ceb2bc9cea3acae40fb8acba3fc' then
   insert into shopgo_rewards.eligibility(user_id) values(new.id) on conflict do nothing;
 end if;
 return new;
end $$;
revoke all on function shopgo_rewards.capture_purchase() from public,anon,authenticated;
create trigger shopgo_capture_promotion_purchase after insert on auth.users for each row execute function shopgo_rewards.capture_purchase();

create function shopgo_rewards.wallet() returns jsonb language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid(); current_time_ timestamptz:=clock_timestamp(); earned bigint; reserved bigint;
begin
 if uid is null then raise exception 'Authentication required';end if;
 select coalesce(sum(amount_cents) filter(where available_at<=current_time_),0) into earned from shopgo_rewards.campaigns where user_id=uid;
 select coalesce(sum(amount_cents) filter(where status in ('requested','paid')),0) into reserved from shopgo_rewards.withdrawals where user_id=uid;
 return jsonb_build_object(
 'enabled',exists(select 1 from shopgo_rewards.eligibility e join public.memberships m on m.user_id=e.user_id where e.user_id=uid and m.active and m.plan='standard'),
 'server_now',current_time_,
 'campaign_count',(select count(*) from shopgo_rewards.campaigns where user_id=uid and completed_at is not null),
 'daily_campaign_count',(select count(*) from shopgo_rewards.campaigns where user_id=uid and (completed_at at time zone 'America/Sao_Paulo')::date=(current_time_ at time zone 'America/Sao_Paulo')::date),
 'earned_today_cents',(select coalesce(sum(amount_cents),0) from shopgo_rewards.campaigns where user_id=uid and (completed_at at time zone 'America/Sao_Paulo')::date=(current_time_ at time zone 'America/Sao_Paulo')::date),
 'pending_cents',(select coalesce(sum(amount_cents),0) from shopgo_rewards.campaigns where user_id=uid and available_at>current_time_),
 'available_cents',greatest(0,earned-reserved),
 'requested_cents',(select coalesce(sum(amount_cents),0) from shopgo_rewards.withdrawals where user_id=uid and status='requested'),
 'items',coalesce((select jsonb_agg(to_jsonb(c) order by completed_at desc) from (select c.id,c.profile_id,p.name as profile_name,c.product,c.completed_at,c.amount_cents,c.available_at from shopgo_rewards.campaigns c join public.affiliate_profiles p on p.id=c.profile_id where c.user_id=uid and c.completed_at is not null order by c.completed_at desc limit 100) c),'[]'::jsonb),
 'withdrawals',coalesce((select jsonb_agg(to_jsonb(w) order by created_at desc) from (select id,amount_cents,status,created_at,paid_at from shopgo_rewards.withdrawals where user_id=uid order by created_at desc limit 100) w),'[]'::jsonb)
 );
end $$;

create function shopgo_rewards.start_campaign(campaign_id uuid,profile_id_ uuid,product_ text) returns uuid language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid();
begin
 if uid is null then raise exception 'Authentication required';end if;
 perform pg_advisory_xact_lock(hashtextextended(uid::text,0));
 if not exists(select 1 from shopgo_rewards.eligibility e join public.memberships m on m.user_id=e.user_id where e.user_id=uid and m.active and m.plan='standard') then raise exception 'Account not eligible';end if;
 if exists(select 1 from shopgo_rewards.campaigns where id=campaign_id and user_id=uid) then return campaign_id;end if;
 if not exists(select 1 from public.affiliate_profiles where id=profile_id_ and user_id=uid and not archived) then raise exception 'Active profile required';end if;
 insert into shopgo_rewards.campaigns(id,user_id,profile_id,product) values(campaign_id,uid,profile_id_,trim(product_));
 return campaign_id;
end $$;

create function shopgo_rewards.complete_campaign(campaign_id uuid) returns jsonb language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid(); c shopgo_rewards.campaigns; n integer; daily integer; reward integer:=0; finished timestamptz:=clock_timestamp();
begin
 if uid is null then raise exception 'Authentication required';end if;
 perform pg_advisory_xact_lock(hashtextextended(uid::text,0));
 select * into c from shopgo_rewards.campaigns where id=campaign_id and user_id=uid for update;
 if not found then raise exception 'Campaign not found';end if;
 if c.completed_at is null then
   if not exists(select 1 from shopgo_rewards.eligibility e join public.memberships m on m.user_id=e.user_id where e.user_id=uid and m.active and m.plan='standard') then raise exception 'Account not eligible';end if;
   if finished<c.started_at+interval '30 seconds' then raise exception 'Campaign still running';end if;
   select count(*) into n from shopgo_rewards.campaigns where user_id=uid and (completed_at at time zone 'America/Sao_Paulo')::date=(finished at time zone 'America/Sao_Paulo')::date;
   select coalesce(sum(amount_cents),0) into daily from shopgo_rewards.campaigns where user_id=uid and (completed_at at time zone 'America/Sao_Paulo')::date=(finished at time zone 'America/Sao_Paulo')::date;
   -- First daily completion: zero. Daily completions 2..5: R$13.25, totaling R$53.
   if n between 1 and 4 then reward:=greatest(0,least(1325,5300-daily));end if;
   update shopgo_rewards.campaigns set completed_at=finished,amount_cents=reward,available_at=case when reward>0 then finished+interval '192 hours' else null end where id=c.id returning * into c;
 end if;
 return jsonb_build_object('id',c.id,'amount_cents',c.amount_cents,'available_at',c.available_at,'completed_at',c.completed_at);
end $$;

create function shopgo_rewards.request_withdrawal(request_id uuid,amount_cents_ integer,pix_key_ text) returns uuid language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid(); earned bigint; reserved bigint;
begin
 if uid is null then raise exception 'Authentication required';end if;
 perform pg_advisory_xact_lock(hashtextextended(uid::text,0));
 if exists(select 1 from shopgo_rewards.withdrawals where id=request_id and user_id=uid) then return request_id;end if;
 if amount_cents_ is null or amount_cents_<=0 then raise exception 'Invalid amount';end if;
 select coalesce(sum(amount_cents),0) into earned from shopgo_rewards.campaigns where user_id=uid and available_at<=clock_timestamp();
 select coalesce(sum(amount_cents),0) into reserved from shopgo_rewards.withdrawals where user_id=uid and status in ('requested','paid');
 if amount_cents_>earned-reserved then raise exception 'Insufficient released balance';end if;
 insert into shopgo_rewards.withdrawals(id,user_id,amount_cents,pix_key) values(request_id,uid,amount_cents_,trim(pix_key_));
 return request_id;
end $$;
revoke all on all functions in schema shopgo_rewards from public,anon,authenticated;
grant execute on function shopgo_rewards.wallet(),shopgo_rewards.start_campaign(uuid,uuid,text),shopgo_rewards.complete_campaign(uuid),shopgo_rewards.request_withdrawal(uuid,integer,text) to authenticated;
create function public.get_promotion_wallet() returns jsonb language sql security invoker set search_path='' as $$select shopgo_rewards.wallet()$$;
create function public.start_promotion_campaign(campaign_id uuid,profile_id_ uuid,product_ text) returns uuid language sql security invoker set search_path='' as $$select shopgo_rewards.start_campaign(campaign_id,profile_id_,product_)$$;
create function public.complete_promotion_campaign(campaign_id uuid) returns jsonb language sql security invoker set search_path='' as $$select shopgo_rewards.complete_campaign(campaign_id)$$;
create function public.request_promotion_withdrawal(request_id uuid,amount_cents_ integer,pix_key_ text) returns uuid language sql security invoker set search_path='' as $$select shopgo_rewards.request_withdrawal(request_id,amount_cents_,pix_key_)$$;
revoke all on function public.get_promotion_wallet(),public.start_promotion_campaign(uuid,uuid,text),public.complete_promotion_campaign(uuid),public.request_promotion_withdrawal(uuid,integer,text) from public,anon,authenticated;
grant execute on function public.get_promotion_wallet(),public.start_promotion_campaign(uuid,uuid,text),public.complete_promotion_campaign(uuid),public.request_promotion_withdrawal(uuid,integer,text) to authenticated;

create policy promotion_campaign_no_direct_access on shopgo_rewards.campaigns for all to authenticated using(false) with check(false);
create policy promotion_eligibility_no_direct_access on shopgo_rewards.eligibility for all to authenticated using(false) with check(false);
create policy promotion_withdrawal_no_direct_access on shopgo_rewards.withdrawals for all to authenticated using(false) with check(false);
