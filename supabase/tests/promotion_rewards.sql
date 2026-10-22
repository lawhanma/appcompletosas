-- Set qa.promotion_purchase_code in the test session before execution.
begin;
insert into shopgo_private.access_codes(code_hash,plan,enabled) values(encode(sha256(convert_to('qa-other-promo-code','UTF8')),'hex'),'standard',true);
select set_config('qa.a',gen_random_uuid()::text,true),set_config('qa.b',gen_random_uuid()::text,true),set_config('qa.c',gen_random_uuid()::text,true),set_config('qa.pa',gen_random_uuid()::text,true),set_config('qa.pc',gen_random_uuid()::text,true);
insert into auth.users(id,email,raw_user_meta_data) values
(current_setting('qa.a')::uuid,'qa-'||current_setting('qa.a')||'@example.invalid',jsonb_build_object('purchase_code',current_setting('qa.promotion_purchase_code'))),
(current_setting('qa.b')::uuid,'qa-'||current_setting('qa.b')||'@example.invalid','{"purchase_code":"qa-other-promo-code"}'),
(current_setting('qa.c')::uuid,'qa-'||current_setting('qa.c')||'@example.invalid',jsonb_build_object('purchase_code',current_setting('qa.promotion_purchase_code')));
insert into public.affiliate_profiles(id,user_id,name,platform) values
(current_setting('qa.pa')::uuid,current_setting('qa.a')::uuid,'Promo QA A','instagram'),
(current_setting('qa.pc')::uuid,current_setting('qa.c')::uuid,'Promo QA C','facebook');
select set_config('request.jwt.claim.sub',current_setting('qa.a'),true);
set local role authenticated;
do $$ begin
 assert (public.get_promotion_wallet()->>'enabled')::boolean,'New eligible signup not enrolled';
 assert not has_function_privilege('anon','public.complete_promotion_campaign(uuid)','execute'),'Anonymous reward RPC';
 begin perform * from shopgo_rewards.campaigns;raise exception 'Direct ledger read accepted';exception when insufficient_privilege then null;end;
 begin insert into shopgo_rewards.eligibility values(current_setting('qa.b')::uuid);raise exception 'Self enrollment allowed';exception when insufficient_privilege then null;end;
 begin perform public.start_promotion_campaign(gen_random_uuid(),current_setting('qa.pc')::uuid,'Other owner');raise exception 'Cross owner accepted';exception when raise_exception then if sqlerrm<>'Active profile required' then raise;end if;end;
end $$;
reset role;
do $$ declare cid uuid; r jsonb; again jsonb; total_ integer; t timestamptz; balance_ integer; wid uuid:=gen_random_uuid();begin
 for i in 1..20 loop
  cid:=gen_random_uuid();perform public.start_promotion_campaign(cid,current_setting('qa.pa')::uuid,'Product QA');
  if i=1 then
   begin perform public.complete_promotion_campaign(cid);raise exception 'Instant completion accepted';exception when raise_exception then if sqlerrm<>'Campaign still running' then raise;end if;end;
  end if;
  update shopgo_rewards.campaigns set started_at=clock_timestamp()-interval '31 seconds' where id=cid;
  r:=public.complete_promotion_campaign(cid);again:=public.complete_promotion_campaign(cid);
  assert r=again,'Duplicate completion changed reward';
  if i=1 then assert (r->>'amount_cents')::integer=0,'First campaign paid';
  elsif i=2 then assert (r->>'amount_cents')::integer between 500 and 1500,'Second campaign not paid';end if;
  assert (r->>'amount_cents')::integer=0 or (r->>'amount_cents')::integer between 500 and 1500,'Reward out of bounds';
 end loop;
 total_:=(public.get_promotion_wallet()->>'earned_today_cents')::integer;
 assert total_ between 2501 and 3000,'Daily cap not respected';
 assert (public.get_promotion_wallet()->>'campaign_count')::integer=20,'Duplicate counted twice';
 assert (public.get_promotion_wallet()->>'available_cents')::integer=0,'Released before 8 days';
 begin perform public.request_promotion_withdrawal(wid,100,'qa@example.invalid');raise exception 'Early withdrawal accepted';exception when raise_exception then if sqlerrm<>'Insufficient released balance' then raise;end if;end;
 -- Move yesterday's earned history while preserving the exact 192-hour wait.
 update shopgo_rewards.campaigns set completed_at=completed_at-interval '1 day',available_at=case when available_at is null then null else available_at-interval '1 day' end where user_id=current_setting('qa.a')::uuid;
 assert (public.get_promotion_wallet()->>'earned_today_cents')::integer=0,'Daily reset incorrect';
 cid:=gen_random_uuid();perform public.start_promotion_campaign(cid,current_setting('qa.pa')::uuid,'Next day QA');update shopgo_rewards.campaigns set started_at=clock_timestamp()-interval '31 seconds' where id=cid;
 r:=public.complete_promotion_campaign(cid);assert (r->>'amount_cents')::integer between 500 and 1500,'Second-day reward missing';
 t:=clock_timestamp()-interval '1 second';
 update shopgo_rewards.campaigns set completed_at=t-interval '192 hours',available_at=t where user_id=current_setting('qa.a')::uuid and amount_cents>0;
 balance_:=(public.get_promotion_wallet()->>'available_cents')::integer;
 assert balance_>0,'8-day release failed';
 assert (public.get_promotion_wallet()->>'pending_cents')::integer=0,'Mature rewards still pending';
 perform public.request_promotion_withdrawal(wid,balance_,'qa@example.invalid');perform public.request_promotion_withdrawal(wid,balance_,'qa@example.invalid');
 assert (select count(*) from shopgo_rewards.withdrawals where user_id=current_setting('qa.a')::uuid)=1,'Duplicate withdrawal';
 assert (public.get_promotion_wallet()->>'available_cents')::integer=0,'Funds not reserved';
 assert (public.get_promotion_wallet()->>'requested_cents')::integer=balance_,'Request not pending';
 begin perform public.request_promotion_withdrawal(gen_random_uuid(),1,'qa@example.invalid');raise exception 'Double spend accepted';exception when raise_exception then if sqlerrm<>'Insufficient released balance' then raise;end if;end;
 assert not exists(select 1 from public.affiliate_profile_sales where user_id=current_setting('qa.a')::uuid),'Reward fabricated a sale';
end $$;
select set_config('request.jwt.claim.sub',current_setting('qa.c'),true);
set local role authenticated;
do $$ begin
 assert (public.get_promotion_wallet()->>'pending_cents')::integer=0,'Other wallet leaked';
 assert jsonb_array_length(public.get_promotion_wallet()->'items')=0,'Other account ledger leaked';
end $$;
reset role;
select set_config('request.jwt.claim.sub',current_setting('qa.b'),true);
set local role authenticated;
do $$ begin assert not (public.get_promotion_wallet()->>'enabled')::boolean,'Other purchase code enrolled';end $$;
reset role;
rollback;
