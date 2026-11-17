# Divulgação sem perfil

Os dois pontos de entrada da divulgação aceitam o campo de perfil vazio. Nesse caso, a campanha e a comissão são vinculadas à conta, sem criar um perfil automático ou consumir o limite de perfis do gratuito. Um perfil explicitamente informado precisa continuar ativo e pertencer ao usuário.

O banco aceita `profile_id=null` no livro de campanhas. A consulta do financeiro usa LEFT JOIN e o rótulo “Sem perfil · conta ShopGO”, preservando campanhas e valores sem perfil. A conclusão continua idempotente, e as regras de remuneração não foram modificadas.

# Recuperação no celular

As telas possuem uma barreira de erro para falhas de importação de módulos ou renderização. A mensagem permite atualizar a página para recuperar módulos de uma nova publicação. A validação das fotos aceita navegadores sem createImageBitmap e possui alternativa para falha de decodificação. Prévia com object URL indisponível vira mensagem no campo, sem interromper o formulário.

Não foi reproduzida a falha intermitente original em um aparelho físico. Foram verificados o formulário compartilhado de perfil em viewport de 390 × 844, o seletor opcional, os fallbacks de imagens e os lançamentos sem perfil no banco.
