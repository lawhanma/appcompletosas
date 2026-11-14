begin;
select set_config('qa.free',gen_random_uuid()::text,true),set_config('qa.paid',gen_random_uuid()::text,true);
insert into auth.users(id,email,raw_user_meta_data) values
(current_setting('qa.free')::uuid,'qa-'||current_setting('qa.free')||'@example.invalid','{"purchase_code":"121314"}'),
(current_setting('qa.paid')::uuid,'qa-'||current_setting('qa.paid')||'@example.invalid','{"purchase_code":"55321"}');
select set_config('request.jwt.claim.sub',current_setting('qa.free'),true);
set local role authenticated;
do $$declare pid uuid;begin
 insert into public.affiliate_profiles(user_id,name,platform) values(auth.uid(),'First profile','instagram') returning id into pid;
 begin insert into public.affiliate_profiles(user_id,name,platform) values(auth.uid(),'Second profile','facebook');raise exception 'Second free profile accepted';exception when check_violation then if sqlerrm<>'Free plan profile limit reached' then raise;end if;end;
 update public.affiliate_profiles set name='Edited profile',archived=true where id=pid;
 assert exists(select 1 from public.affiliate_profiles where id=pid and name='Edited profile'),'Edit was blocked';
 begin insert into public.affiliate_profiles(user_id,name,platform) values(auth.uid(),'Archive bypass','youtube');raise exception 'Archived profile bypass accepted';exception when check_violation then if sqlerrm<>'Free plan profile limit reached' then raise;end if;end;
 assert (select count(*) from public.affiliate_profiles where user_id=auth.uid())=1,'Free profile count incorrect';
 perform set_config('request.jwt.claim.sub',current_setting('qa.paid'),true);
 insert into public.affiliate_profiles(user_id,name,platform) values(auth.uid(),'Paid one','instagram'),(auth.uid(),'Paid two','facebook');
 assert (select count(*) from public.affiliate_profiles where user_id=auth.uid())=2,'Paid profile creation blocked';
end $$;
reset role;
do $$begin assert not has_function_privilege('authenticated','shopgo_private.enforce_free_profile_limit()','execute'),'Trigger function exposed';end $$;
select 'PASS: one free profile, second blocked, editing allowed, archive bypass blocked, paid profiles preserved' as result;
rollback;
