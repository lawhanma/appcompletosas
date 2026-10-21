# Configurações dos canais

Nome/e-mail e estado ativo de Shopee, TikTok Shop e Mercado Livre são salvos em public.channel_connections, com chave (user_id, channel) e RLS proprietário para SELECT/INSERT/UPDATE. Sem acesso anon ou DELETE. Desconectar persiste enabled=false. Upsert evita duplicação. Não armazena tokens ou senhas nem concede autorização OAuth; o frontend identifica os dados como configuração salva.

Ao montar a tela, busca novamente no banco. Não apresenta sucesso antes da confirmação do banco nem recorre a estado local em erro. Requisições antigas são descartadas ao trocar de conta/desmontar. Sem migração dos dados anteriores: existiam somente em useState e não podem ser recuperados após fechar a tela. É necessário salvar uma vez após a atualização.

Schema: supabase/channel_connections.sql; teste de persistência, upsert, desconexão/reconexão e isolamento em supabase/tests/channel_connections.sql (rollback).
