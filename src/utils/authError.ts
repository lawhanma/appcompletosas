export function authErrorMessage(error: {code?: string; status?: number}, registering: boolean): string {
  switch (error.code) {
    case 'user_already_exists':
    case 'email_exists': return 'Este e-mail já tem uma conta no ShopGO. Clique em Entrar e use a senha criada no primeiro cadastro.';
    case 'invalid_credentials': return 'E-mail ou senha incorretos. Use a senha criada no seu primeiro cadastro; o código de compra não é a senha.';
    case 'email_not_confirmed': return 'Seu e-mail ainda precisa de confirmação. Entre em contato com o suporte para verificar seu acesso.';
    case 'weak_password': return 'Escolha uma senha com pelo menos 8 caracteres. Evite senhas comuns ou fáceis de adivinhar.';
    case 'email_address_invalid': return 'Confira o endereço de e-mail e use um e-mail válido.';
    case 'over_email_send_rate_limit':
    case 'over_request_rate_limit':
    case 'over_email_send_rate_limit_exceeded': return 'Muitas tentativas em pouco tempo. Aguarde alguns minutos antes de tentar novamente.';
    case 'signup_disabled':
    case 'email_provider_disabled': return 'O cadastro está temporariamente indisponível. Entre em contato com o suporte.';
    case 'unexpected_failure': return registering
      ? 'Não foi possível concluir o cadastro. Confira o código de compra; se estiver correto, informe este erro ao suporte.'
      : 'Não foi possível entrar agora. Tente novamente em instantes.';
    default: return error.status && error.status >= 500
      ? 'O serviço de acesso está temporariamente indisponível. Tente novamente em instantes.'
      : registering ? 'Não foi possível criar a conta. Confira os dados. Se já se cadastrou antes, clique em Entrar.'
      : 'Não foi possível entrar. Confira o e-mail e a senha e tente novamente.';
  }
}
