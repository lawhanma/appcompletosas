alter table public.affiliate_profiles add column avatar_path text not null default '', add column banner_path text not null default '';
alter table public.affiliate_profiles add constraint affiliate_avatar_owner check(avatar_path='' or (split_part(avatar_path,'/',1)=user_id::text and char_length(avatar_path)<300));
alter table public.affiliate_profiles add constraint affiliate_banner_owner check(banner_path='' or (split_part(banner_path,'/',1)=user_id::text and char_length(banner_path)<300));
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('affiliate-profile-media','affiliate-profile-media',false,5242880,array['image/jpeg','image/png','image/webp']);
create policy affiliate_media_read on storage.objects for select to authenticated using(bucket_id='affiliate-profile-media' and (storage.foldername(name))[1]=(select auth.uid())::text);
create policy affiliate_media_insert on storage.objects for insert to authenticated with check(bucket_id='affiliate-profile-media' and (storage.foldername(name))[1]=(select auth.uid())::text);
create policy affiliate_media_delete on storage.objects for delete to authenticated using(bucket_id='affiliate-profile-media' and (storage.foldername(name))[1]=(select auth.uid())::text);
