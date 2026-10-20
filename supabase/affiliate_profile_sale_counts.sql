alter table public.affiliate_profile_sales add column quantity integer not null default 1 check(quantity between 1 and 1000000);
alter table public.affiliate_profile_sales drop constraint affiliate_profile_sales_source_check;
alter table public.affiliate_profile_sales drop constraint affiliate_profile_sales_gross_check;
alter table public.affiliate_profile_sales add constraint affiliate_profile_sales_source_check check(source in ('manual','manual_count'));
alter table public.affiliate_profile_sales add constraint affiliate_profile_sales_gross_check check((source='manual' and gross>0 and quantity=1) or (source='manual_count' and gross=0 and commission=0));
