create policy orders_no_direct_access on shopgo_orders.orders for all to authenticated using(false) with check(false);
create policy orders_admins_no_direct_access on shopgo_orders.admins for all to authenticated using(false) with check(false);
