begin;
select set_config('qa.customer',gen_random_uuid()::text,true),set_config('qa.profile',gen_random_uuid()::text,true);
insert into auth.users(id,email,raw_user_meta_data) values(current_setting('qa.customer')::uuid,'qa-'||current_setting('qa.customer')||'@example.invalid','{"purchase_code":"121314"}');
insert into public.affiliate_profiles(id,user_id,name,platform) values(current_setting('qa.profile')::uuid,current_setting('qa.customer')::uuid,'Revenue QA','instagram');
select set_config('request.jwt.claim.sub',current_setting('qa.customer'),true);
insert into shopgo_rewards.campaigns(id,user_id,profile_id,product,started_at,completed_at,amount_cents,available_at)
select gen_random_uuid(),current_setting('qa.customer')::uuid,current_setting('qa.profile')::uuid,'Period QA',t-interval '1 minute',t,cents,t from
(values(0,3000),(1,4000),(6,5000),(7,6000)) v(days,cents)
cross join lateral(select ((clock_timestamp() at time zone 'America/Sao_Paulo')::date-v.days+time '01:00') at time zone 'America/Sao_Paulo' as t) d;
do $$declare earnings jsonb;begin
 earnings:=public.get_promotion_wallet()->'earnings_by_period';
 assert (earnings->>'hoje')::integer=3000,'Today revenue incorrect';
 assert (earnings->>'ontem')::integer=4000,'Yesterday revenue incorrect';
 assert (earnings->>'7dias')::integer=12000,'Seven-day boundary incorrect';
 assert (earnings->>'mes')::integer=(3000+case when extract(day from clock_timestamp() at time zone 'America/Sao_Paulo')>1 then 4000 else 0 end+case when extract(day from clock_timestamp() at time zone 'America/Sao_Paulo')>6 then 5000 else 0 end+case when extract(day from clock_timestamp() at time zone 'America/Sao_Paulo')>7 then 6000 else 0 end),'Current month revenue incorrect';
 assert (public.get_customer_orders()->>'total')::integer=0,'Activity income created orders';
end $$;
select 'PASS: commission revenue by Brazil-time period without creating product orders' as result;
rollback;
