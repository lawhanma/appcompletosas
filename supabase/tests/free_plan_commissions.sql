begin;
select set_config('qa.free',gen_random_uuid()::text,true),set_config('qa.paid',gen_random_uuid()::text,true),set_config('qa.profile',gen_random_uuid()::text,true),set_config('qa.other',gen_random_uuid()::text,true);
insert into auth.users(id,email,raw_user_meta_data) values
(current_setting('qa.free')::uuid,'qa-'||current_setting('qa.free')||'@example.invalid','{"purchase_code":"121314"}'),
(current_setting('qa.paid')::uuid,'qa-'||current_setting('qa.paid')||'@example.invalid','{"purchase_code":"55321"}');
insert into public.affiliate_profiles(id,user_id,name,platform) values
(current_setting('qa.profile')::uuid,current_setting('qa.free')::uuid,'Free plan QA','instagram'),
(current_setting('qa.other')::uuid,current_setting('qa.paid')::uuid,'Paid plan QA','facebook');
select set_config('request.jwt.claim.sub',current_setting('qa.free'),true);
do $$declare cid uuid; r jsonb; again jsonb; wid uuid:=gen_random_uuid(); total_ integer;begin
 assert (select plan='free' from public.memberships where user_id=current_setting('qa.free')::uuid),'Free signup failed';
 assert (public.get_promotion_wallet()->>'enabled')::boolean,'Free wallet disabled';
 assert (public.get_promotion_wallet()->>'minimum_withdrawal_cents')::integer=20000,'Free minimum incorrect';
 begin perform public.start_promotion_campaign(gen_random_uuid(),current_setting('qa.other')::uuid,'Foreign profile');raise exception 'Foreign owner accepted';exception when raise_exception then if sqlerrm<>'Active profile required' then raise;end if;end;
 for i in 1..8 loop
  cid:=gen_random_uuid();perform public.start_promotion_campaign(cid,current_setting('qa.profile')::uuid,'QA activity');
  if i=1 then
   begin perform public.complete_promotion_campaign(cid);raise exception 'Instant reward accepted';exception when raise_exception then if sqlerrm<>'Campaign still running' then raise;end if;end;
   begin perform public.start_promotion_campaign(gen_random_uuid(),current_setting('qa.profile')::uuid,'Parallel activity');raise exception 'Parallel activity accepted';exception when raise_exception then if sqlerrm<>'Complete the previous campaign first' then raise;end if;end;
  end if;
  update shopgo_rewards.campaigns set started_at=clock_timestamp()-interval '31 seconds' where id=cid;
  r:=public.complete_promotion_campaign(cid);again:=public.complete_promotion_campaign(cid);
  assert r=again,'Duplicate completion changed reward';
  assert (r->>'amount_cents')::integer between 3000 and 8000,'Free reward outside range';
  assert (r->>'available_at')::timestamptz=(r->>'completed_at')::timestamptz,'Reward not immediately available';
 end loop;
 total_:=(public.get_promotion_wallet()->>'available_cents')::integer;
 assert total_>=24000,'Balance incorrect';
 begin perform public.request_promotion_withdrawal(wid,19999,'qa@example.invalid');raise exception 'Below minimum accepted';exception when raise_exception then if sqlerrm<>'Invalid amount' then raise;end if;end;
 perform public.request_promotion_withdrawal(wid,20000,'qa@example.invalid');
 perform public.request_promotion_withdrawal(wid,20000,'qa@example.invalid');
 assert (public.get_promotion_wallet()->>'available_cents')::integer=total_-20000,'Duplicate withdrawal debited twice';
 begin perform public.request_promotion_withdrawal(gen_random_uuid(),total_,'qa@example.invalid');raise exception 'Overspending accepted';exception when raise_exception then if sqlerrm<>'Insufficient released balance' then raise;end if;end;
 perform set_config('request.jwt.claim.sub',current_setting('qa.paid'),true);
 assert (public.get_promotion_wallet()->>'minimum_withdrawal_cents')::integer=15000,'Paid minimum incorrect';
 assert (select plan='standard' from public.memberships where user_id=current_setting('qa.paid')::uuid),'Paid signup changed';
 assert not has_function_privilege('anon','public.complete_promotion_campaign(uuid)','execute'),'Anonymous reward permission';
 assert not has_table_privilege('authenticated','shopgo_rewards.campaigns','INSERT'),'Direct ledger writes allowed';
 assert not has_table_privilege('authenticated','public.memberships','UPDATE'),'Self upgrade allowed';
end $$;
select 'PASS: free/paid signup, range, immediate release, minima, ownership, duplicate completion/withdrawal, overspending and permissions' as result;
rollback;
