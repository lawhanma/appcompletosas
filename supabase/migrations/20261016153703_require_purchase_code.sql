-- Only the owner's current purchase code authorizes new accounts.
update shopgo_private.access_codes set enabled = false;
insert into shopgo_private.access_codes(code_hash,plan,enabled)
values ('c31407d4918c3f3c0720af68e33a2657f63e5ceb2bc9cea3acae40fb8acba3fc','standard',true)
on conflict(code_hash) do update set plan=excluded.plan,enabled=true,expires_at=null;

-- Runs in the same transaction as Auth: rejection rolls back the user itself.
create function shopgo_private.register_purchased_account() returns trigger
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
revoke all on function shopgo_private.register_purchased_account() from public,anon,authenticated;
drop trigger shopgo_user_created on auth.users;
create trigger shopgo_user_created after insert on auth.users
for each row execute function shopgo_private.register_purchased_account();
drop function public.create_shopgo_profile();
