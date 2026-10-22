# Comissão promocional ShopGO

## Regra aprovada
Somente novos cadastros com código de compra promocional vigente a partir da implantação do trigger. Contas anteriores não foram habilitadas. O trigger captura o código original no INSERT de auth.users; o código continua removido dos metadados e não concede acesso pelo JWT. Membership padrão ativa também é exigida para gerar recompensas.

Primeira atividade concluída: zero. A partir da segunda desde o cadastro: valor aleatório em centavos entre R$5 e R$15, limitado ao restante do teto diário de R$30 no fuso America/Sao_Paulo. Se restarem menos de R$5, não remunera aquela atividade para evitar uma comissão abaixo do mínimo. O limite é um teto, não promessa de atingir exatamente R$30 todos os dias. Compartilhamentos manuais isolados não são contabilizados automaticamente por este fluxo.

A conclusão registrada nos dois fluxos automáticos chama o mesmo ledger no servidor, com produto e perfil proprietário. A atividade precisa durar ao menos30segundos. O fluxo atual NÃO comprova postagem externa nem cria venda, faturamento de produto, entrega ou comissão recebida de marketplace. A recompensa é custeada pelo dono da plataforma e aparece identificada como comissão promocional. O processo existente de divulgação prepara/representa uma atividade no app, sem publicação externa verificada. Não implementar contagens de vendas a partir deste ledger.

## Saldo e saque
A recompensa positiva tem available_at=completed_at+192hours. Consultas calculam o saldo usando o relógio do banco; não é necessário deixar o navegador aberto. A interface atualiza a consulta a cada60segundos e ao voltar à aba. Data e valor permanecem por conta e dispositivo, sem fallback local.

Solicitar pagamento cria uma solicitação em shopgo_rewards.withdrawals com estado requested e reserva o saldo. NÃO envia Pix, não cobra taxa de antecipação e não anuncia transferência sem confirmação. A equipe precisa pagar a chave Pix indicada fora do app e confirmar o pagamento no banco. Ainda não há painel de administração ou provedor de pagamentos automático nesta alteração.

Operação administrativa, somente depois da transferência comprovada: atualizar o pedido específico de requested para paid, preenchendo paid_at com o instante efetivo. Pedidos recusados devem receber rejected com paid_at=null; isso devolve a reserva ao saldo. Nunca marcar paid somente para testar. Chaves Pix ficam na tabela privada e não são retornadas no extrato. Para localizar pedidos pendentes usar uma consulta administrativa apenas dos pedidos necessários, sem publicar chaves ou e-mails.

## Proteções e verificação
Tabelas em schema privado, RLS com negação explícita e nenhum grant direto para usuários. Endpoints públicos SECURITY INVOKER chamam funções privadas SECURITY DEFINER de escopo limitado, sempre validadas por auth.uid(), search_path vazio. Locks transacionais por usuário serializam conclusão e reserva de saque. IDs únicos tornam repetição idempotente. O cliente não escolhe valor, horário, titular, elegibilidade ou saldo.

Fontes: supabase/promotion_rewards.sql; teste rollback supabase/tests/promotion_rewards.sql. Teste cobre elegibilidade código elegível/outro código, primeira/segunda, teto diário/fuso, repetição, prazo8dias, reservas/duplo gasto e isolamento entre contas. Dados QA e usuários fictícios são revertidos. Nenhum cliente anterior foi alterado ou pagamento efetuado.

O teste exige qa.promotion_purchase_code configurado somente na sessão de teste, sem salvar o código de compra em arquivos versionados.
