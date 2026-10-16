begin;
-- A rollback-only fixture, never the owner's real purchase credential.
insert into shopgo_private.access_codes(code_hash,plan,enabled)
values (encode(sha256(convert_to('qa-registration-only','UTF8')),'hex'),'standard',true);
select set_config('shopgo.test_user_a',gen_random_uuid()::text,true);
select set_config('shopgo.test_user_b',gen_random_uuid()::text,true);
insert into auth.users (id,email,raw_user_meta_data) values
  (current_setting('shopgo.test_user_a')::uuid, 'shopgo-test-a-'||current_setting('shopgo.test_user_a')||'@example.invalid','{"full_name":"QA A","purchase_code":"qa-registration-only"}'),
  (current_setting('shopgo.test_user_b')::uuid, 'shopgo-test-b-'||current_setting('shopgo.test_user_b')||'@example.invalid','{"full_name":"QA B","purchase_code":"qa-registration-only"}');

do $$ declare bad_code text; begin
  assert not exists(select 1 from auth.users where id=current_setting('shopgo.test_user_a')::uuid and raw_user_meta_data ? 'purchase_code'), 'purchase credential retained';
  foreach bad_code in array array['','wrong','101190','887422','123456','12456'] loop
    begin
      insert into auth.users(id,email,raw_user_meta_data) values(gen_random_uuid(),'blocked@example.invalid',jsonb_build_object('purchase_code',bad_code));
      raise exception 'invalid code created a user';
    exception when check_violation then null;
    end;
  end loop;
end $$;

do $$ begin
  assert not has_table_privilege('anon','public.profiles','select'), 'anon can read profiles';
  assert not has_table_privilege('authenticated','public.memberships','insert'), 'users can create memberships';
  assert not has_table_privilege('authenticated','public.memberships','update'), 'users can alter plans';
  assert not has_schema_privilege('authenticated','shopgo_private','usage'), 'private schema exposed';
  assert not has_function_privilege('anon','public.redeem_access_code(text)','execute'), 'anonymous activation allowed';
end $$;
select set_config('request.jwt.claim.sub',current_setting('shopgo.test_user_a'),true);
set local role authenticated;
do $$ declare affected integer; begin
  assert (select count(*) from public.profiles) = 1, 'RLS exposes another profile';
  update public.profiles set full_name='QA updated',phone='123' where id=current_setting('shopgo.test_user_a')::uuid;
  get diagnostics affected = row_count;
  assert affected = 1, 'cannot update own profile';
  update public.profiles set full_name='intrusion' where id=current_setting('shopgo.test_user_b')::uuid;
  get diagnostics affected = row_count;
  assert affected = 0, 'can update another profile';
  assert public.redeem_access_code('invalid-code') = false, 'invalid license accepted';
  assert public.redeem_access_code('101190') = false, 'old license accepted';
  assert public.redeem_access_code('qa-registration-only') = true, 'valid license rejected';
  assert (select plan from public.memberships) = 'standard', 'wrong plan assigned';
  assert (select count(*) from public.memberships) = 1, 'membership not visible';
end $$;
reset role;
select set_config('request.jwt.claim.sub',current_setting('shopgo.test_user_b'),true);
set local role authenticated;
do $$ begin
  assert (select count(*) from public.memberships) = 1, 'own membership missing or another visible';
  for i in 1..11 loop perform public.redeem_access_code('invalid-code'); end loop;
  assert public.redeem_access_code('qa-registration-only') = false, 'rate limit failed';
end $$;
reset role;
rollback;
