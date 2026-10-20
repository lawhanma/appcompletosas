begin;
insert into shopgo_private.access_codes(code_hash,plan,enabled) values(encode(sha256(convert_to('qa-profiles-20261020','UTF8')),'hex'),'standard',true);
select set_config('qa.a',gen_random_uuid()::text,true),set_config('qa.b',gen_random_uuid()::text,true),set_config('qa.pa',gen_random_uuid()::text,true),set_config('qa.pb',gen_random_uuid()::text,true);
insert into auth.users(id,email,raw_user_meta_data) values
(current_setting('qa.a')::uuid,'qa-a-'||current_setting('qa.a')||'@example.invalid','{"purchase_code":"qa-profiles-20261020"}'),
(current_setting('qa.b')::uuid,'qa-b-'||current_setting('qa.b')||'@example.invalid','{"purchase_code":"qa-profiles-20261020"}');
insert into public.affiliate_profiles(id,user_id,name,platform) values
(current_setting('qa.pa')::uuid,current_setting('qa.a')::uuid,'QA A','instagram'),
(current_setting('qa.pb')::uuid,current_setting('qa.b')::uuid,'QA B','tiktok');
select set_config('request.jwt.claim.sub',current_setting('qa.a'),true);
set local role authenticated;
do $$ begin
 assert (select count(*) from public.affiliate_profiles)=1,'Profile RLS failed';
 assert not has_table_privilege('anon','public.affiliate_profiles','select'),'Anonymous profile read allowed';
 begin
 insert into public.affiliate_profile_sales(user_id,profile_id,product,sold_on,gross) values(current_setting('qa.a')::uuid,current_setting('qa.pb')::uuid,'Cross owner',current_date,100);
 raise exception 'Cross owner sale accepted';
 exception when foreign_key_violation then null; end;
 begin
 update public.affiliate_profiles set user_id=current_setting('qa.b')::uuid where id=current_setting('qa.pa')::uuid;
 raise exception 'Owner reassignment accepted';
 exception when insufficient_privilege then null; end;
end $$;
insert into public.affiliate_profile_sales(user_id,profile_id,product,sold_on,gross,commission,order_ref) values(current_setting('qa.a')::uuid,current_setting('qa.pa')::uuid,'QA Sale',current_date,123.45,12.34,'QA-1');
do $$ begin
 assert (select sum(gross) from public.affiliate_profile_sales)=123.45,'Wrong totals';
 begin
 insert into public.affiliate_profile_sales(user_id,profile_id,product,sold_on,gross,order_ref) values(current_setting('qa.a')::uuid,current_setting('qa.pa')::uuid,'Duplicate',current_date,123.45,'QA-1');
 raise exception 'Duplicate accepted'; exception when unique_violation then null;end;
end $$;
reset role;
do $$ begin assert exists(select 1 from storage.buckets where id='affiliate-profile-media' and public=false and file_size_limit=5242880),'Bucket configuration failed'; end $$;
set local role authenticated;
do $$ begin
update public.affiliate_profiles set avatar_path=current_setting('qa.a')||'/avatar-qa.png',banner_path=current_setting('qa.a')||'/banner-qa.png' where id=current_setting('qa.pa')::uuid;
begin update public.affiliate_profiles set avatar_path=current_setting('qa.b')||'/other.png' where id=current_setting('qa.pa')::uuid;
raise exception 'Cross owner image accepted'; exception when check_violation then null; end;
end $$;
select set_config('request.jwt.claim.sub',current_setting('qa.b'),true);
do $$ begin assert (select count(*) from public.affiliate_profile_sales)=0,'Other owner sales exposed';end $$;
reset role;
rollback;
