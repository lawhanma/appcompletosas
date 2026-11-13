# Pedidos manuais

A conta `isaquelaw@gmail.com` é autorizada pelo ID de usuário numa tabela privada de administradores. E-mail informado pelo navegador ou metadados editáveis não concedem acesso. Outros usuários não conseguem consultar pedidos alheios nem registrar pedidos.

A aba Pedidos mostra os últimos 100 registros, permite localizar um cliente pelo e-mail exato e registrar produto, referência e quantidade. Referências são únicas por cliente; repetição da mesma requisição não duplica o registro. Os status são registrado, despachado e cancelado. Cancelar preserva o histórico e remove a quantidade dos totais.

O gratuito mostra o total registrado no Dashboard e nos resultados de divulgação. O total é da conta, sem atribuição automática à campanha. A consulta é atualizada ao abrir a tela e a cada 30 segundos. Registrar pedidos não cria comissões, não altera saldo e não confirma pagamento.

Os testes `supabase/tests/manual_customer_orders.sql` usam contas e pedidos temporários dentro de uma transação finalizada com rollback.
