begin;
insert into shopgo_private.access_codes(code_hash,plan,enabled) values(encode(sha256(convert_to('qa-connections-20261021','UTF8')),'hex'),'standard',true);
select set_config('qa.a',gen_random_uuid()::text,true),set_config('qa.b',gen_random_uuid()::text,true);
insert into auth.users(id,email,raw_user_meta_data) values
(current_setting('qa.a')::uuid,'qa-'||current_setting('qa.a')||'@example.invalid','{"purchase_code":"qa-connections-20261021"}'),
(current_setting('qa.b')::uuid,'qa-'||current_setting('qa.b')||'@example.invalid','{"purchase_code":"qa-connections-20261021"}');
select set_config('request.jwt.claim.sub',current_setting('qa.a'),true);
set local role authenticated;
insert into public.channel_connections(user_id,channel,name,email) values(current_setting('qa.a')::uuid,'shopee','QA owner','owner@example.invalid');
insert into public.channel_connections(user_id,channel,name,email) values(current_setting('qa.a')::uuid,'shopee','Updated owner','updated@example.invalid') on conflict(user_id,channel) do update set name=excluded.name,email=excluded.email;
do $$ begin
  assert (select count(*) from public.channel_connections)=1,'Duplicate channel';
  assert (select name='Updated owner' and enabled from public.channel_connections),'Upsert failed';
  assert not has_table_privilege('anon','public.channel_connections','select'),'Anonymous read';
  begin
    update public.channel_connections set user_id=current_setting('qa.b')::uuid;
    raise exception 'Reassignment accepted';
  exception when insufficient_privilege then null; end;
end $$;
select set_config('request.jwt.claim.sub',current_setting('qa.b'),true);
do $$ begin
  assert (select count(*) from public.channel_connections)=0,'Other account visible';
  begin
    insert into public.channel_connections(user_id,channel,name,email) values(current_setting('qa.a')::uuid,'tiktok','Other','other@example.invalid');
    raise exception 'Cross owner insert accepted';
  exception when insufficient_privilege then null; end;
end $$;
select set_config('request.jwt.claim.sub',current_setting('qa.a'),true);
update public.channel_connections set enabled=false where channel='shopee';
reset role;
set local role authenticated;
do $$ begin assert (select name='Updated owner' and not enabled from public.channel_connections),'Disconnect not persisted';end $$;
insert into public.channel_connections(user_id,channel,name,email,enabled) values(current_setting('qa.a')::uuid,'shopee','Reconnected','owner@example.invalid',true) on conflict(user_id,channel) do update set name=excluded.name,email=excluded.email,enabled=true;
reset role;
set local role authenticated;
do $$ begin assert (select name='Reconnected' and enabled from public.channel_connections),'Reconnect not persisted';end $$;
reset role;
rollback;
