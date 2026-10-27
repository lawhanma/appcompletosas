# Comissão promocional ShopGO

## Regra aprovada
Somente novos cadastros com código de compra promocional vigente a partir da implantação do trigger. Contas anteriores não foram habilitadas. O trigger captura o código original no INSERT de auth.users; o código continua removido dos metadados e não concede acesso pelo JWT. Membership padrão ativa também é exigida para gerar recompensas.

Ciclo diário de cinco divulgações concluídas (America/Sao_Paulo): primeira R$0; segunda à quinta R$13,25 cada. Total de R$53 por ciclo completo. Depois da quinta não há remuneração extra no mesmo dia, inclusive com créditos ilimitados. O contador diário vem do servidor e fornece cinco créditos por dia para contas elegíveis; ilimitados continuam sem limite de utilização. Compartilhamentos manuais isolados não são contados automaticamente.

Registros e valores anteriores são preservados. Não há reprocessamento ou redução de recompensas antigas; em um dia de transição, créditos antigos podem impedir que o ciclo feche exatamente no novo total. A nova sequência completa fica garantida para dias iniciados sob a nova regra.

A conclusão registrada nos dois fluxos automáticos chama o mesmo ledger no servidor, com produto e perfil proprietário. A atividade precisa durar ao menos30segundos. O fluxo atual NÃO comprova postagem externa nem cria venda, faturamento de produto, entrega ou comissão recebida de marketplace. A recompensa é custeada pelo dono da plataforma e aparece identificada como comissão promocional. O processo existente de divulgação prepara/representa uma atividade no app, sem publicação externa verificada. Não implementar contagens de vendas a partir deste ledger.

## Saldo e saque
A recompensa positiva tem available_at=completed_at+192hours. Consultas calculam o saldo usando o relógio do banco; não é necessário deixar o navegador aberto. A interface atualiza a consulta a cada60segundos e ao voltar à aba. Data e valor permanecem por conta e dispositivo, sem fallback local.

Solicitar pagamento cria uma solicitação em shopgo_rewards.withdrawals com estado requested e reserva o saldo. NÃO envia Pix, não cobra taxa de antecipação e não anuncia transferência sem confirmação. A equipe precisa pagar a chave Pix indicada fora do app e confirmar o pagamento no banco. Ainda não há painel de administração ou provedor de pagamentos automático nesta alteração.

Operação administrativa, somente depois da transferência comprovada: atualizar o pedido específico de requested para paid, preenchendo paid_at com o instante efetivo. Pedidos recusados devem receber rejected com paid_at=null; isso devolve a reserva ao saldo. Nunca marcar paid somente para testar. Chaves Pix ficam na tabela privada e não são retornadas no extrato. Para localizar pedidos pendentes usar uma consulta administrativa apenas dos pedidos necessários, sem publicar chaves ou e-mails.

## Proteções e verificação
Tabelas em schema privado, RLS com negação explícita e nenhum grant direto para usuários. Endpoints públicos SECURITY INVOKER chamam funções privadas SECURITY DEFINER de escopo limitado, sempre validadas por auth.uid(), search_path vazio. Locks transacionais por usuário serializam conclusão e reserva de saque. IDs únicos tornam repetição idempotente. O cliente não escolhe valor, horário, titular, elegibilidade ou saldo.

Fontes: supabase/promotion_rewards.sql; teste rollback supabase/tests/promotion_rewards.sql. Teste cobre elegibilidade código elegível/outro código, primeira/segunda, teto diário/fuso, repetição, prazo8dias, reservas/duplo gasto e isolamento entre contas. Dados QA e usuários fictícios são revertidos. Nenhum cliente anterior foi alterado ou pagamento efetuado.

O teste exige qa.promotion_purchase_code configurado somente na sessão de teste, sem salvar o código de compra em arquivos versionados.

Atualização anterior, substituída pelo ciclo de R$53: teto de R$50/dia; sem meta ou progresso de limite na dashboard. Regras consultáveis em detalhes no financeiro e na divulgação. Nenhum crédito retroativo ou alteração de saldos já existentes.
Antecipação opcional: botão Solicitar antecipação abre https://go.ironpayapp.com.br/tgphlqdt9x em nova aba, somente quando a carteira cloud possui comissão pendente e a consulta não falhou. Liberação normal após8dias independe dessa contratação. Valores/condições ficam no checkout; sem taxa numérica inferida no app. O link não modifica saldo, não registra pagamento de taxa, não confirma Pix e não implementa liberação antecipada automática. Equipe deve confirmar pagamento/condições e fazer o acerto da carteira de forma administrativa; esse processamento não foi automatizado nesta alteração. Modal legado não anuncia mais aprovação bancária fictícia.

Alcance estimado: ilustração local, sem medição das redes, exibida com rótulo explícito no resultado e relatório dos dois fluxos. Não é registrada como analytics, venda ou base para cálculo de comissão. Números não são retroalimentados no ledger.
