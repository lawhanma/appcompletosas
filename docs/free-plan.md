# Plano gratuito e comissões por divulgação

Novos cadastros com código `121314` recebem `memberships.plan=free` no servidor. Um código válido continua concedendo o plano pago correspondente; um código inválido continua sendo recusado. Contas existentes não são rebaixadas.

O gratuito mostra a seleção de Utilidades ShopGO. Outros fornecedores e a seleção Black Friday abrem a janela dos planos mensal e vitalício. Os botões levam ao checkout; não alteram permissões. O processo atual de confirmação e ativação do acesso pago continua sendo necessário.

A cada divulgação concluída no gratuito, o servidor registra de R$ 30 a R$ 44 como comissão por atividade custeada pela ShopGO. Não é uma venda, não aumenta pedidos/faturamento de produtos e não confirma publicação em redes externas. Exige perfil do próprio usuário e 30 segundos de execução. A conclusão é idempotente. Uma campanha pendente deve ser confirmada antes de iniciar outra.

As comissões são liberadas imediatamente, inclusive as antigas conforme autorização do proprietário. Saque mínimo de R$ 200 para o gratuito e R$ 150 para os planos pagos; o saldo é reservado atomicamente e solicitações repetidas com o mesmo identificador não debitam novamente. A solicitação não transfere Pix: o pagamento é feito e confirmado pela equipe.

Migração: `supabase/migrations/202611130001_free_plan_and_immediate_commissions.sql`.
Teste transacional sem persistência: `supabase/tests/free_plan_commissions.sql`.

O gratuito permite um único perfil por conta, incluindo perfis arquivados. O banco serializa novas criações por usuário para impedir cadastros concorrentes acima do limite. Editar o perfil e as imagens continua permitido. Perfis já existentes são preservados.
