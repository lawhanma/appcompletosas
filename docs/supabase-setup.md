# Banco de usuários do Shop GO

Cadastro e login usam Supabase Auth. A senha não é armazenada nas tabelas públicas nem enviada para o cache legado de usuários.

## Configuração

Defina `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY` em `.env.local` para desenvolvimento e nas variáveis de build/servidor da hospedagem. Use apenas a chave pública. Reinicie o servidor após mudar o arquivo. O projeto inclui `.env.local` no `.gitignore`.

A migração `supabase/migrations/202610160001_accounts.sql` cria:

- `profiles`: nome, telefone e chave Pix de cada conta, com leitura e edição restritas ao próprio usuário.
- `memberships`: plano e acesso ativo, com leitura restrita ao titular e escrita exclusiva do servidor.
- `shopgo_private.access_codes`: hashes dos códigos de licença, sem acesso direto pelo navegador.
- `shopgo_private.activation_attempts`: limite de tentativas de ativação por conta.

Novos usuários recebem seu perfil pelo gatilho em `auth.users`. Cadastro envia nome/telefone ao Auth; o e-mail de confirmação deve ser aberto pelo usuário. Configure em Authentication > URL Configuration a URL pública do site e inclua `http://localhost:3000` na lista de redirecionamentos durante o desenvolvimento. Não desative a confirmação de e-mail para contornar dificuldades de teste.

## Uso

1. Selecione Cadastrar e crie a conta com nome, telefone opcional, e-mail e senha.
2. Confirme o e-mail, quando solicitado, e entre na plataforma.
3. Informe o código de compra na tela de ativação. Os códigos atuais do protótipo foram preservados no banco; substitua-os por licenças reais antes do uso comercial. Os códigos curtos e compartilhados do protótipo não constituem um sistema de cobrança.
4. Em Perfil, salve e confira os dados em outro dispositivo usando a mesma conta.

O cache de apresentação local não libera acesso: o aplicativo exige uma sessão Supabase e consulta o plano no banco. Os endpoints de IA validam token e licença no servidor.

## Limites desta etapa

O catálogo continua nos arquivos TypeScript com suas 175 fotos atualizadas. Saldos, vendas, saques, créditos e integrações de marketplace continuam sendo funcionalidades locais do protótipo. Nenhum saldo local foi importado como dinheiro real, e este banco não executa pagamentos.

Contas antigas gravadas apenas no navegador precisam de novo cadastro. Senhas locais não são migradas. A migração inclui testes de isolamento em `supabase/tests/accounts.sql`, executáveis dentro de uma transação que termina com rollback.

## Código obrigatório no cadastro
A migração 20261016153703_require_purchase_code.sql substitui os códigos antigos e valida a credencial na mesma transação que cria o usuário. Código ausente/incorreto reverte a conta; código correto cria perfil e licença standard. A credencial é removida dos metadados. Contas existentes são preservadas. O código compartilhado controla acesso, mas não consulta pagamentos. Aplicada no projeto remoto em 2026-10-16. Testes transacionais passaram: código correto cria perfil e licença; ausente, incorreto e códigos antigos rejeitados sem criar conta. Testes atualizados em supabase/tests/accounts.sql (rollback).


## Conta de apresentação
O e-mail isaquelaw@gmail.com recebe no cache visual o comportamento do antigo código 123456, sem alterar o plano ou as permissões do Supabase. O painel inicia com dados de exemplo, todos os 175 produtos passam pela afiliação local e campanhas simuladas aumentam o faturamento diário/mensal e as comissões locais. Nenhuma integração, venda, publicação ou transferência real é realizada. O cadastro continua aceitando apenas o código definido pelo proprietário. Os exemplos são guardados no navegador; não são registros de vendas no banco. Teste: scripts/check-presentation.ts. Janela de divulgação corrigida para montar os hooks somente no componente ativo; totais da campanha e do painel usam os mesmos valores.


## Publicação na Vercel
Configure VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY nas variáveis de ambiente da Vercel (Production e Preview) e faça um novo deploy. Os valores públicos estão no painel Supabase; nunca use service_role. O .env.local não vai para o GitHub. Em Supabase Authentication > URL Configuration, configure a URL de produção e os redirecionamentos autorizados. vercel.json configura o frontend Vite em dist e encaminha /api para a função api/handler.ts, que exporta as mesmas rotas Express do servidor local. Configure GEMINI_API_KEY apenas como variável de servidor se quiser usar a geração por Gemini. O código de compra real é validado no banco. O login offline de desenvolvimento usa somente local-demo.
