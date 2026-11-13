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
 'items',coalesce((select jsonb_agg(to_jsonb(c) order by completed_at desc) from (select c.id,c.profile_id,p.name as profile_name,c.product,c.completed_at,c.amount_cents,c.available_at from shopgo_rewards.campaigns c join public.affiliate_profiles p on p.id=c.profile_id where c.user_id=uid and c.completed_at is not null order by c.completed_at desc limit 100) c),'[]'::jsonb),
 'withdrawals',coalesce((select jsonb_agg(to_jsonb(w) order by created_at desc) from (select id,amount_cents,status,created_at,paid_at from shopgo_rewards.withdrawals where user_id=uid order by created_at desc limit 100) w),'[]'::jsonb)
 );
end $$;

