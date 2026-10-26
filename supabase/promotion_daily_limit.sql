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
   select count(*) into n from shopgo_rewards.campaigns where user_id=uid and completed_at is not null;
   select coalesce(sum(amount_cents),0) into daily from shopgo_rewards.campaigns where user_id=uid and (completed_at at time zone 'America/Sao_Paulo')::date=(finished at time zone 'America/Sao_Paulo')::date;
   -- The first completed campaign ever has no reward. Never issue < R$5 to fill the cap.
   if n>=1 and 5000-daily>=500 then reward:=500+floor(random()*(least(1500,5000-daily)-500+1))::integer;end if;
   update shopgo_rewards.campaigns set completed_at=finished,amount_cents=reward,available_at=case when reward>0 then finished+interval '192 hours' else null end where id=c.id returning * into c;
 end if;
 return jsonb_build_object('id',c.id,'amount_cents',c.amount_cents,'available_at',c.available_at,'completed_at',c.completed_at);
end $$;
