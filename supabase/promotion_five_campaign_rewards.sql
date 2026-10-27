create or replace function shopgo_rewards.wallet() returns jsonb language plpgsql security definer set search_path='' as $$
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

create or replace function shopgo_rewards.complete_campaign(campaign_id uuid) returns jsonb language plpgsql security definer set search_path='' as $$
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
