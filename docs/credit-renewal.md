# Credit renewal UI

The renewal dialog appears after the final available credit is used in either automatic promotion flow. Starting without credits opens the same dialog. Each completed campaign consumes one credit; closing the renewal dialog does not grant credits.

Plans requested by the owner:

- Unlimited credits: R$ 64,90.
- 35 credits: R$ 34,90.

Checkout ativo: https://go.ironpayapp.com.br/1apinrpokb para créditos ilimitados (R$64,90). A opção35 está indisponível: preço riscado, aviso explícito e link identificado para o plano ilimitado com o preço correto. Nenhum link de35créditos é usado, mesmo que exista variável de ambiente antiga.

This change implements the offer dialog, not payment processing or paid entitlements. Before enabling actual sales, implement a verified provider webhook, server-side entitlements and idempotent credit grants for the authenticated account. Never grant credits from a client click or payment-return query string. Daily free-credit renewal remains unchanged. The validity/period of the unlimited option is not defined yet.
Liberações administrativas de ilimitados usam public.ai_credit_entitlements, por user_id, com SELECT proprietário e escrita exclusiva administrativa. O cadastro carrega unlimited na autenticação; consumir divulgação não decrementa créditos quando habilitado. O estado local continua finito e a indicação ilimitada é derivada da permissão da conta, sem alterar membership ou saldo financeiro. Isso não implementa confirmação automática de checkout nem recarga de 35 créditos.
