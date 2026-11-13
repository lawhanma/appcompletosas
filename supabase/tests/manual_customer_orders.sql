begin;
select set_config('qa.customer',gen_random_uuid()::text,true),set_config('qa.other',gen_random_uuid()::text,true),set_config('qa.admin',(select user_id::text from shopgo_orders.admins limit 1),true);
insert into auth.users(id,email,raw_user_meta_data) values
(current_setting('qa.customer')::uuid,'qa-'||current_setting('qa.customer')||'@example.invalid','{"purchase_code":"121314"}'),
(current_setting('qa.other')::uuid,'qa-'||current_setting('qa.other')||'@example.invalid','{"purchase_code":"121314"}');
select set_config('request.jwt.claim.sub',current_setting('qa.admin'),true);
set local role authenticated;
do $$declare oid uuid:=gen_random_uuid(); data jsonb;begin
 assert public.is_shopgo_orders_admin(),'Owner not recognized';
 data:=public.get_admin_orders('qa-'||current_setting('qa.customer')||'@example.invalid');
 assert data->'customer'->>'id'=current_setting('qa.customer'),'Exact customer lookup failed';
 perform public.register_customer_order(oid,current_setting('qa.customer')::uuid,'QA-ORDER-1','QA product',5);
 perform public.register_customer_order(oid,current_setting('qa.customer')::uuid,'QA-ORDER-1','QA product',5);
 data:=public.get_admin_orders('qa-'||current_setting('qa.customer')||'@example.invalid');
 assert jsonb_array_length(data->'items')=1,'Repeated submission duplicated order';
 begin perform public.register_customer_order(gen_random_uuid(),current_setting('qa.customer')::uuid,'QA-ORDER-1','QA product',5);raise exception 'Duplicate reference accepted';exception when unique_violation then null;end;
 begin perform public.register_customer_order(gen_random_uuid(),current_setting('qa.customer')::uuid,'QA-invalid','QA product',0);raise exception 'Invalid quantity accepted';exception when raise_exception then if sqlerrm<>'Invalid order' then raise;end if;end;
 perform public.update_customer_order_status(oid,'dispatched');
 perform set_config('request.jwt.claim.sub',current_setting('qa.customer'),true);
 assert not public.is_shopgo_orders_admin(),'Customer is admin';
 assert (public.get_customer_orders()->>'total')::integer=5,'Customer total incorrect';
 assert public.get_customer_orders()->'items'->0->>'status'='dispatched','Customer status incorrect';
 begin perform public.get_admin_orders(null);raise exception 'Customer can list others';exception when raise_exception then if sqlerrm<>'Administrator required' then raise;end if;end;
 begin perform public.register_customer_order(gen_random_uuid(),current_setting('qa.customer')::uuid,'FAKE','Fake',7);raise exception 'Customer can self-register';exception when raise_exception then if sqlerrm<>'Administrator required' then raise;end if;end;
 begin perform public.update_customer_order_status(oid,'cancelled');raise exception 'Customer can change status';exception when raise_exception then if sqlerrm<>'Administrator required' then raise;end if;end;
 perform set_config('request.jwt.claim.sub',current_setting('qa.other'),true);
 assert (public.get_customer_orders()->>'total')::integer=0,'Cross-account orders leaked';
 perform set_config('request.jwt.claim.sub',current_setting('qa.admin'),true);
 perform public.update_customer_order_status(oid,'cancelled');
 perform set_config('request.jwt.claim.sub',current_setting('qa.customer'),true);
 assert (public.get_customer_orders()->>'total')::integer=0,'Cancelled order counted';
 assert not has_table_privilege('authenticated','shopgo_orders.orders','INSERT'),'Direct order writes allowed';
 assert not has_table_privilege('authenticated','shopgo_orders.admins','INSERT'),'Self admin enrollment allowed';
 assert not has_function_privilege('anon','public.register_customer_order(uuid,uuid,text,text,integer)','EXECUTE'),'Anonymous order creation allowed';
end $$;
reset role;
select 'PASS: owner-only administration, customer lookup, registration, duplicate protection, dispatch/cancellation, own totals and cross-account isolation' as result;
rollback;
