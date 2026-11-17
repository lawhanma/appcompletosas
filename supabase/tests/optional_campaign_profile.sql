begin;
select set_config('qa.free',gen_random_uuid()::text,true),set_config('qa.other',gen_random_uuid()::text,true),set_config('qa.foreign_profile',gen_random_uuid()::text,true);
insert into auth.users(id,email,raw_user_meta_data) values
(current_setting('qa.free')::uuid,'qa-'||current_setting('qa.free')||'@example.invalid','{"purchase_code":"121314"}'),
(current_setting('qa.other')::uuid,'qa-'||current_setting('qa.other')||'@example.invalid','{"purchase_code":"121314"}');
insert into public.affiliate_profiles(id,user_id,name,platform) values(current_setting('qa.foreign_profile')::uuid,current_setting('qa.other')::uuid,'Foreign profile','instagram');
select set_config('request.jwt.claim.sub',current_setting('qa.free'),true);
do $$declare cid uuid:=gen_random_uuid(); r jsonb; wallet jsonb;begin
 begin perform public.start_promotion_campaign(gen_random_uuid(),current_setting('qa.foreign_profile')::uuid,'Foreign profile QA');raise exception 'Foreign profile accepted';exception when raise_exception then if sqlerrm<>'Active profile required' then raise;end if;end;
 perform public.start_promotion_campaign(cid,null,'No profile QA');
 update shopgo_rewards.campaigns set started_at=clock_timestamp()-interval '65 seconds' where id=cid;
 r:=public.complete_promotion_campaign(cid);
 assert (r->>'amount_cents')::integer between 3000 and 4400,'Optional profile commission missing';
 assert public.complete_promotion_campaign(cid)=r,'Duplicate completion changed reward';
 wallet:=public.get_promotion_wallet();
 assert jsonb_array_length(wallet->'items')=1,'No-profile activity missing from ledger';
 assert wallet->'items'->0->>'profile_id' is null,'Profile unexpectedly assigned';
 assert wallet->'items'->0->>'profile_name'='Sem perfil · conta ShopGO','Account label missing';
 assert (wallet->>'available_cents')::integer=(r->>'amount_cents')::integer,'Commission balance missing';
 perform set_config('request.jwt.claim.sub',current_setting('qa.other'),true);
 assert (public.get_promotion_wallet()->>'campaign_count')::integer=0,'Cross-owner ledger leaked';
end $$;
select 'PASS: campaign without profile, commission and ledger preserved, duplicate protection and profile ownership checks' as result;
rollback;
