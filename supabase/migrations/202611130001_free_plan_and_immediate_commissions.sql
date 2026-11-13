-- Free access is assigned only by the signup trigger. Clients cannot upgrade themselves.
-- Commissions are owner-funded remuneration for completed activities, never product sales.
alter table public.memberships drop constraint memberships_plan_check;
alter table public.memberships add constraint memberships_plan_check check(plan in ('free','standard','vip'));
alter table shopgo_rewards.campaigns drop constraint campaigns_amount_cents_check;
alter table shopgo_rewards.campaigns add constraint campaigns_amount_cents_check check(amount_cents=0 or amount_cents between 500 and 8000);
alter table shopgo_rewards.campaigns drop constraint campaigns_check;
update shopgo_rewards.campaigns set available_at=completed_at where amount_cents>0;
alter table shopgo_rewards.campaigns add constraint campaigns_check check((amount_cents=0 and available_at is null) or (amount_cents>0 and completed_at is not null and available_at=completed_at));
create or replace function shopgo_private.register_purchased_account() returns trigger
language plpgsql security definer set search_path='' as $$
declare selected_plan text;
begin
  if trim(coalesce(new.raw_user_meta_data->>'purchase_code',''))='' then
    selected_plan:='free';
  else
  select plan into selected_plan from shopgo_private.access_codes
  where code_hash=encode(sha256(convert_to(trim(coalesce(new.raw_user_meta_data->>'purchase_code','')),'UTF8')),'hex')
    and enabled and (expires_at is null or expires_at>now());
  if selected_plan is null then
    raise exception 'Purchase code required or invalid' using errcode='23514';
  end if;
  end if;
  insert into public.profiles(id,full_name,phone)
  values(new.id,left(coalesce(new.raw_user_meta_data->>'full_name',''),200),
    left(coalesce(new.raw_user_meta_data->>'phone',''),40));
  insert into public.memberships(user_id,plan,active) values(new.id,selected_plan,true);
  -- Never include the purchase credential in saved metadata or future JWTs.
  update auth.users set raw_user_meta_data=raw_user_meta_data-'purchase_code' where id=new.id;
  return new;
end;
$$;

create or replace function shopgo_rewards.start_campaign(campaign_id uuid,profile_id_ uuid,product_ text) returns uuid language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid();
begin
 if uid is null then raise exception 'Authentication required';end if;
 perform pg_advisory_xact_lock(hashtextextended(uid::text,0));
 if not exists(select 1 from public.memberships m left join shopgo_rewards.eligibility e on e.user_id=m.user_id where m.user_id=uid and m.active and (m.plan='free' or (m.plan='standard' and e.user_id is not null))) then raise exception 'Account not eligible';end if;
 if exists(select 1 from shopgo_rewards.campaigns where id=campaign_id and user_id=uid) then return campaign_id;end if;
 if not exists(select 1 from public.affiliate_profiles where id=profile_id_ and user_id=uid and not archived) then raise exception 'Active profile required';end if;
 if exists(select 1 from shopgo_rewards.campaigns where user_id=uid and completed_at is null) then raise exception 'Complete the previous campaign first';end if;
 insert into shopgo_rewards.campaigns(id,user_id,profile_id,product) values(campaign_id,uid,profile_id_,trim(product_));
 return campaign_id;
end $$;


create or replace function shopgo_rewards.wallet() returns jsonb language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid(); current_time_ timestamptz:=clock_timestamp(); earned bigint; reserved bigint;
begin
 if uid is null then raise exception 'Authentication required';end if;
 select coalesce(sum(amount_cents) filter(where available_at<=current_time_),0) into earned from shopgo_rewards.campaigns where user_id=uid;
 select coalesce(sum(amount_cents) filter(where status in ('requested','paid')),0) into reserved from shopgo_rewards.withdrawals where user_id=uid;
 return jsonb_build_object(
 'enabled',exists(select 1 from public.memberships m left join shopgo_rewards.eligibility e on e.user_id=m.user_id where m.user_id=uid and m.active and (m.plan='free' or (m.plan='standard' and e.user_id is not null))),
 'plan',(select plan from public.memberships where user_id=uid),
 'minimum_withdrawal_cents',case when exists(select 1 from public.memberships where user_id=uid and plan='free') then 20000 else 15000 end,
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

create or replace function shopgo_rewards.complete_campaign(campaign_id uuid) returns jsonb language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid(); c shopgo_rewards.campaigns; n integer; daily integer; reward integer:=0; finished timestamptz:=clock_timestamp();
begin
 if uid is null then raise exception 'Authentication required';end if;
 perform pg_advisory_xact_lock(hashtextextended(uid::text,0));
 select * into c from shopgo_rewards.campaigns where id=campaign_id and user_id=uid for update;
 if not found then raise exception 'Campaign not found';end if;
 if c.completed_at is null then
   if not exists(select 1 from public.memberships m left join shopgo_rewards.eligibility e on e.user_id=m.user_id where m.user_id=uid and m.active and (m.plan='free' or (m.plan='standard' and e.user_id is not null))) then raise exception 'Account not eligible';end if;
   if finished<c.started_at+interval '30 seconds' then raise exception 'Campaign still running';end if;
   select count(*) into n from shopgo_rewards.campaigns where user_id=uid and (completed_at at time zone 'America/Sao_Paulo')::date=(finished at time zone 'America/Sao_Paulo')::date;
   select coalesce(sum(amount_cents),0) into daily from shopgo_rewards.campaigns where user_id=uid and (completed_at at time zone 'America/Sao_Paulo')::date=(finished at time zone 'America/Sao_Paulo')::date;
   -- First daily completion: zero. Daily completions 2..5: R$13.25, totaling R$53.
   if exists(select 1 from public.memberships where user_id=uid and active and plan='free') then
     reward:=3000+floor(random()*5001)::integer;
   elsif n between 1 and 4 then reward:=greatest(0,least(1325,5300-daily));end if;
   update shopgo_rewards.campaigns set completed_at=finished,amount_cents=reward,available_at=case when reward>0 then finished else null end where id=c.id returning * into c;
 end if;
 return jsonb_build_object('id',c.id,'amount_cents',c.amount_cents,'available_at',c.available_at,'completed_at',c.completed_at);
end $$;

create or replace function shopgo_rewards.request_withdrawal(request_id uuid,amount_cents_ integer,pix_key_ text) returns uuid language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid(); earned bigint; reserved bigint; minimum_ integer;
begin
 if uid is null then raise exception 'Authentication required';end if;
 perform pg_advisory_xact_lock(hashtextextended(uid::text,0));
 if exists(select 1 from shopgo_rewards.withdrawals where id=request_id and user_id=uid) then return request_id;end if;
 select case when plan='free' then 20000 else 15000 end into minimum_ from public.memberships where user_id=uid and active;
 if minimum_ is null then raise exception 'Active membership required';end if;
 if amount_cents_ is null or amount_cents_<minimum_ then raise exception 'Invalid amount';end if;
 select coalesce(sum(amount_cents),0) into earned from shopgo_rewards.campaigns where user_id=uid and available_at<=clock_timestamp();
 select coalesce(sum(amount_cents),0) into reserved from shopgo_rewards.withdrawals where user_id=uid and status in ('requested','paid');
 if amount_cents_>earned-reserved then raise exception 'Insufficient released balance';end if;
 insert into shopgo_rewards.withdrawals(id,user_id,amount_cents,pix_key) values(request_id,uid,amount_cents_,trim(pix_key_));
 return request_id;
end $$;
