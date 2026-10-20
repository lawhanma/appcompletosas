# Affiliate profiles

Meus Perfis is separate from the account's identity profile. Each authenticated customer owns their affiliate profiles and manually recorded sales in Supabase (`affiliate_profiles`, `affiliate_profile_sales`). The reviewed schema is in `supabase/affiliate_profiles.sql`; the remote migrations are `affiliate_profiles_and_sales` and `restrict_affiliate_profile_table_grants`.

Customers choose a platform icon, name, handle, optional HTTPS URL and cover color. Editing supports archiving without deleting history. The metrics icon opens gross revenue, commissions, order count, average ticket, daily chart and sales records. Periods: current month in Brasília, last 30 days, all history. An optional order identifier prevents duplicates within a profile. Canceling a sale marks it voided and excludes it from metrics.

Metrics are based only on recorded sales. No old global transaction is arbitrarily assigned. No profiles or revenue are seeded in production, no social login/password is collected, and no external posting or affiliate reporting API is connected by adding a profile. Manual amounts do not create withdrawable balance. This is a separate attribution ledger, not a payment confirmation service.

RLS checks `auth.uid() = user_id` for reads/inserts/updates. Composite foreign keys prevent associating sales with another customer's profile. Anonymous access and authenticated DELETE are denied. Rollback-only SQL tests cover two owners, cross-owner references, reassignment, duplicate orders and totals. Paginated sales loading avoids Supabase's default row cap truncating totals.

## Profile photos and banners

Customers can upload JPEG, PNG or WebP files up to 5 MB. Client decoding checks reject broken files and dimensions above 12,000 px. Avatar and banner use object-cover; replacing/removing either is optional. Uploads are saved only after clicking Save.

Private bucket `affiliate-profile-media` is owner-folder restricted, including signed URL reads. File paths are also owner-constrained in the profile table. Signed URLs last one hour and refresh while the profile area is visible. Fresh sessions reload new URLs. Failed profile writes clean up newly uploaded objects; old replaced objects remain private for future retention cleanup.

Additional remote migration: `affiliate_profile_private_images`; schema in `supabase/affiliate_profile_media.sql`. No secret key is exposed and no bucket is made public.
`nQuantidades históricas podem ser registradas administrativamente como manual_count, com quantity e valores zerados. São identificadas como informadas manualmente. Registros comuns continuam com quantity=1 e gross>0; novas vendas aumentam a contagem. Aplicar affiliate_profile_sale_counts.sql após o schema inicial.
