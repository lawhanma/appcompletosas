-- Manual orders are independent of activity commissions and require administrator approval.
create schema shopgo_orders;
revoke all on schema shopgo_orders from public,anon;
grant usage on schema shopgo_orders to authenticated;
create table shopgo_orders.admins(user_id uuid primary key references auth.users(id) on delete cascade);
insert into shopgo_orders.admins(user_id) select id from auth.users where lower(email)='isaquelaw@gmail.com';
create table shopgo_orders.orders(
 id uuid primary key default gen_random_uuid(),user_id uuid not null references auth.users(id),
 created_by uuid not null references auth.users(id),
 order_ref text not null check(char_length(trim(order_ref)) between 1 and 100),
 product text not null check(char_length(trim(product)) between 1 and 200),
 quantity integer not null check(quantity between 1 and 10000),
 status text not null default 'registered' check(status in ('registered','dispatched','cancelled')),
 created_at timestamptz not null default clock_timestamp(),updated_at timestamptz not null default clock_timestamp(),
 unique(user_id,order_ref)
);
create index orders_customer on shopgo_orders.orders(user_id,created_at desc);
alter table shopgo_orders.admins enable row level security;
alter table shopgo_orders.orders enable row level security;
revoke all on all tables in schema shopgo_orders from public,anon,authenticated;
create function shopgo_orders.is_admin() returns boolean language sql stable security definer set search_path='' as $$
 select auth.uid() is not null and exists(select 1 from shopgo_orders.admins where user_id=auth.uid())
$$;
create function shopgo_orders.customer_orders() returns jsonb language plpgsql security definer set search_path='' as $$
begin
 if auth.uid() is null then raise exception 'Authentication required';end if;
 return jsonb_build_object('total', (select coalesce(sum(quantity),0) from shopgo_orders.orders where user_id=auth.uid() and status<>'cancelled'),
 'items',coalesce((select jsonb_agg(to_jsonb(o)) from (select id,order_ref,product,quantity,status,created_at from shopgo_orders.orders where user_id=auth.uid() order by created_at desc limit 100) o),'[]'::jsonb));
end $$;
create function shopgo_orders.admin_orders(email_ text default null) returns jsonb language plpgsql security definer set search_path='' as $$
declare recipient uuid; client_name text; client_email text;
begin
 if not shopgo_orders.is_admin() then raise exception 'Administrator required';end if;
 if nullif(trim(email_),'') is not null then
  select u.id,p.full_name,u.email into recipient,client_name,client_email from auth.users u join public.profiles p on p.id=u.id where lower(u.email)=lower(trim(email_));
  if recipient is null then raise exception 'Customer not found';end if;
 end if;
 return jsonb_build_object('customer',case when recipient is null then null else jsonb_build_object('id',recipient,'name',client_name,'email',client_email) end,
 'items',coalesce((select jsonb_agg(to_jsonb(o)) from (select o.id,o.order_ref,o.product,o.quantity,o.status,o.created_at,u.email as customer_email,p.full_name as customer_name from shopgo_orders.orders o join auth.users u on u.id=o.user_id join public.profiles p on p.id=o.user_id where recipient is null or o.user_id=recipient order by o.created_at desc limit 100) o),'[]'::jsonb));
end $$;
create function shopgo_orders.save_order(id_ uuid,user_id_ uuid,order_ref_ text,product_ text,quantity_ integer) returns uuid language plpgsql security definer set search_path='' as $$
declare existing shopgo_orders.orders;
begin
 if not shopgo_orders.is_admin() then raise exception 'Administrator required';end if;
 if id_ is null or user_id_ is null or not exists(select 1 from public.memberships where user_id=user_id_ and active) then raise exception 'Active customer required';end if;
 if order_ref_ is null or product_ is null or quantity_ is null or char_length(trim(order_ref_)) not between 1 and 100 or char_length(trim(product_)) not between 1 and 200 or quantity_ not between 1 and 10000 then raise exception 'Invalid order';end if;
 perform pg_advisory_xact_lock(hashtextextended(user_id_::text,1));
 select * into existing from shopgo_orders.orders where id=id_;
 if found then
  if existing.user_id=user_id_ and existing.order_ref=trim(order_ref_) and existing.product=trim(product_) and existing.quantity=quantity_ then return id_;end if;
  raise exception 'Order identifier already used';
 end if;
 insert into shopgo_orders.orders(id,user_id,created_by,order_ref,product,quantity) values(id_,user_id_,auth.uid(),trim(order_ref_),trim(product_),quantity_);
 return id_;
end $$;
create function shopgo_orders.set_status(id_ uuid,status_ text) returns void language plpgsql security definer set search_path='' as $$
begin
 if not shopgo_orders.is_admin() then raise exception 'Administrator required';end if;
 if status_ is null or status_ not in ('registered','dispatched','cancelled') then raise exception 'Invalid status';end if;
 update shopgo_orders.orders set status=status_,updated_at=clock_timestamp() where id=id_;
 if not found then raise exception 'Order not found';end if;
end $$;
revoke all on all functions in schema shopgo_orders from public,anon,authenticated;
grant execute on function shopgo_orders.is_admin(),shopgo_orders.customer_orders(),shopgo_orders.admin_orders(text),shopgo_orders.save_order(uuid,uuid,text,text,integer),shopgo_orders.set_status(uuid,text) to authenticated;
create function public.is_shopgo_orders_admin() returns boolean language sql security invoker set search_path='' as $$select shopgo_orders.is_admin()$$;
create function public.get_customer_orders() returns jsonb language sql security invoker set search_path='' as $$select shopgo_orders.customer_orders()$$;
create function public.get_admin_orders(email_ text default null) returns jsonb language sql security invoker set search_path='' as $$select shopgo_orders.admin_orders(email_)$$;
create function public.register_customer_order(id_ uuid,user_id_ uuid,order_ref_ text,product_ text,quantity_ integer) returns uuid language sql security invoker set search_path='' as $$select shopgo_orders.save_order(id_,user_id_,order_ref_,product_,quantity_)$$;
create function public.update_customer_order_status(id_ uuid,status_ text) returns void language sql security invoker set search_path='' as $$select shopgo_orders.set_status(id_,status_)$$;
revoke all on function public.is_shopgo_orders_admin(),public.get_customer_orders(),public.get_admin_orders(text),public.register_customer_order(uuid,uuid,text,text,integer),public.update_customer_order_status(uuid,text) from public,anon,authenticated;
grant execute on function public.is_shopgo_orders_admin(),public.get_customer_orders(),public.get_admin_orders(text),public.register_customer_order(uuid,uuid,text,text,integer),public.update_customer_order_status(uuid,text) to authenticated;
