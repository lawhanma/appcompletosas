-- One profile per free account, including archived profiles. Existing profiles are preserved.
create function shopgo_private.enforce_free_profile_limit() returns trigger language plpgsql security definer set search_path='' as $$
begin
 perform pg_advisory_xact_lock(hashtextextended(new.user_id::text,2));
 if exists(select 1 from public.memberships where user_id=new.user_id and active and plan='free')
    and exists(select 1 from public.affiliate_profiles where user_id=new.user_id) then
  raise exception 'Free plan profile limit reached' using errcode='23514';
 end if;
 return new;
end $$;
revoke all on function shopgo_private.enforce_free_profile_limit() from public,anon,authenticated;
create trigger enforce_free_profile_limit before insert on public.affiliate_profiles for each row execute function shopgo_private.enforce_free_profile_limit();
