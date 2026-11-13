alter table shopgo_private.access_codes drop constraint access_codes_plan_check;
alter table shopgo_private.access_codes add constraint access_codes_plan_check check(plan in ('free','standard','vip'));
insert into shopgo_private.access_codes(code_hash,plan,enabled) values(encode(sha256(convert_to('121314','UTF8')),'hex'),'free',true) on conflict(code_hash) do update set plan='free',enabled=true,expires_at=null;
create or replace function shopgo_private.register_purchased_account() returns trigger
language plpgsql security definer set search_path='' as $$
declare selected_plan text;
begin
  select plan into selected_plan from shopgo_private.access_codes
  where code_hash=encode(sha256(convert_to(trim(coalesce(new.raw_user_meta_data->>'purchase_code','')),'UTF8')),'hex')
    and enabled and (expires_at is null or expires_at>now());
  if selected_plan is null then
    raise exception 'Purchase code required or invalid' using errcode='23514';
  end if;
  insert into public.profiles(id,full_name,phone)
  values(new.id,left(coalesce(new.raw_user_meta_data->>'full_name',''),200),
    left(coalesce(new.raw_user_meta_data->>'phone',''),40));
  insert into public.memberships(user_id,plan,active) values(new.id,selected_plan,true);
  -- Never include the purchase credential in saved metadata or future JWTs.
  update auth.users set raw_user_meta_data=raw_user_meta_data-'purchase_code' where id=new.id;
  return new;
end;
$$;
