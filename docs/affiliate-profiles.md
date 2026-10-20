# Affiliate profiles

Meus Perfis is separate from the account's identity profile. Each authenticated customer owns their affiliate profiles and manually recorded sales in Supabase (`affiliate_profiles`, `affiliate_profile_sales`). The reviewed schema is in `supabase/affiliate_profiles.sql`; the remote migrations are `affiliate_profiles_and_sales` and `restrict_affiliate_profile_table_grants`.

Customers choose a platform icon, name, handle, optional HTTPS URL and cover color. Editing supports archiving without deleting history. The metrics icon opens gross revenue, commissions, order count, average ticket, daily chart and sales records. Periods: current month in Brasília, last 30 days, all history. An optional order identifier prevents duplicates within a profile. Canceling a sale marks it voided and excludes it from metrics.

Metrics are based only on recorded sales. No old global transaction is arbitrarily assigned. No profiles or revenue are seeded in production, no social login/password is collected, and no external posting or affiliate reporting API is connected by adding a profile. Manual amounts do not create withdrawable balance. This is a separate attribution ledger, not a payment confirmation service.

RLS checks `auth.uid() = user_id` for reads/inserts/updates. Composite foreign keys prevent associating sales with another customer's profile. Anonymous access and authenticated DELETE are denied. Rollback-only SQL tests cover two owners, cross-owner references, reassignment, duplicate orders and totals. Paginated sales loading avoids Supabase's default row cap truncating totals.
