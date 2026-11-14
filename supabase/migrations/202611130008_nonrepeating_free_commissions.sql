-- Applies to new completions only; existing earned balances remain unchanged.
create or replace function shopgo_rewards.complete_campaign(campaign_id uuid) returns jsonb language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid(); c shopgo_rewards.campaigns; n integer; daily integer; reward integer:=0; previous_reward integer; finished timestamptz:=clock_timestamp();
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
     select amount_cents into previous_reward from shopgo_rewards.campaigns
       where user_id=uid and completed_at is not null and amount_cents>0
       order by completed_at desc,id desc limit 1;
     if previous_reward between 3000 and 4400 then
       -- Uniformly choose one of the other 1,400 cent values.
       reward:=3000+floor(random()*1400)::integer;
       if reward>=previous_reward then reward:=reward+1;end if;
     else
       reward:=3000+floor(random()*1401)::integer;
     end if;
   elsif n between 1 and 4 then reward:=greatest(0,least(1325,5300-daily));end if;
   update shopgo_rewards.campaigns set completed_at=finished,amount_cents=reward,available_at=case when reward>0 then finished else null end where id=c.id returning * into c;
 end if;
 return jsonb_build_object('id',c.id,'amount_cents',c.amount_cents,'available_at',c.available_at,'completed_at',c.completed_at);
end $$;

