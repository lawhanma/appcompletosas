-- Profile assignment is optional; ownership is still verified when provided.
alter table shopgo_rewards.campaigns alter column profile_id drop not null;
create or replace function shopgo_rewards.start_campaign(campaign_id uuid,profile_id_ uuid,product_ text) returns uuid language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid();
begin
 if uid is null then raise exception 'Authentication required';end if;
 perform pg_advisory_xact_lock(hashtextextended(uid::text,0));
 if not exists(select 1 from public.memberships m left join shopgo_rewards.eligibility e on e.user_id=m.user_id where m.user_id=uid and m.active and (m.plan='free' or (m.plan='standard' and e.user_id is not null))) then raise exception 'Account not eligible';end if;
 if exists(select 1 from shopgo_rewards.campaigns where id=campaign_id and user_id=uid) then return campaign_id;end if;
 if profile_id_ is not null and not exists(select 1 from public.affiliate_profiles where id=profile_id_ and user_id=uid and not archived) then raise exception 'Active profile required';end if;
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
 'earnings_by_period',(select jsonb_build_object(
  'hoje',coalesce(sum(amount_cents) filter(where (completed_at at time zone 'America/Sao_Paulo')::date=(current_time_ at time zone 'America/Sao_Paulo')::date),0),
  'ontem',coalesce(sum(amount_cents) filter(where (completed_at at time zone 'America/Sao_Paulo')::date=(current_time_ at time zone 'America/Sao_Paulo')::date-1),0),
  '7dias',coalesce(sum(amount_cents) filter(where (completed_at at time zone 'America/Sao_Paulo')::date between (current_time_ at time zone 'America/Sao_Paulo')::date-6 and (current_time_ at time zone 'America/Sao_Paulo')::date),0),
  'mes',coalesce(sum(amount_cents) filter(where date_trunc('month',completed_at at time zone 'America/Sao_Paulo')=date_trunc('month',current_time_ at time zone 'America/Sao_Paulo')),0)
 ) from shopgo_rewards.campaigns where user_id=uid),
 'campaign_count',(select count(*) from shopgo_rewards.campaigns where user_id=uid and completed_at is not null),
 'daily_campaign_count',(select count(*) from shopgo_rewards.campaigns where user_id=uid and (completed_at at time zone 'America/Sao_Paulo')::date=(current_time_ at time zone 'America/Sao_Paulo')::date),
 'earned_today_cents',(select coalesce(sum(amount_cents),0) from shopgo_rewards.campaigns where user_id=uid and (completed_at at time zone 'America/Sao_Paulo')::date=(current_time_ at time zone 'America/Sao_Paulo')::date),
 'pending_cents',(select coalesce(sum(amount_cents),0) from shopgo_rewards.campaigns where user_id=uid and available_at>current_time_),
 'available_cents',greatest(0,earned-reserved),
 'requested_cents',(select coalesce(sum(amount_cents),0) from shopgo_rewards.withdrawals where user_id=uid and status='requested'),
 'items',coalesce((select jsonb_agg(to_jsonb(c) order by completed_at desc) from (select c.id,c.profile_id,coalesce(p.name,'Sem perfil · conta ShopGO') as profile_name,c.product,c.completed_at,c.amount_cents,c.available_at from shopgo_rewards.campaigns c left join public.affiliate_profiles p on p.id=c.profile_id where c.user_id=uid and c.completed_at is not null order by c.completed_at desc limit 100) c),'[]'::jsonb),
 'withdrawals',coalesce((select jsonb_agg(to_jsonb(w) order by created_at desc) from (select id,amount_cents,status,created_at,paid_at from shopgo_rewards.withdrawals where user_id=uid order by created_at desc limit 100) w),'[]'::jsonb)
 );
end $$;

