/**
 * Mapeia erros técnicos do Supabase para mensagens amigáveis em Português.
 * Segue boas práticas de UX e segurança da informação.
 */
export const getFriendlyErrorMessage = (error) => {
  if (!error) return null;
  
  const message = error.message.toLowerCase();

  if (message.includes('rate limit exceeded')) {
    return 'Muitas tentativas em pouco tempo. Por favor, aguarde alguns minutos antes de tentar novamente.';
  }

  if (message.includes('invalid login credentials')) {
    return 'E-mail ou senha incorretos. Verifique seus dados e tente novamente.';
  }

  if (message.includes('user already registered')) {
    return 'Este e-mail já está cadastrado. Tente fazer login ou recuperar sua senha.';
  }

  if (message.includes('email not confirmed')) {
    return 'Por favor, confirme seu e-mail antes de acessar a plataforma.';
  }

  if (message.includes('password is too short')) {
    return 'Sua senha deve ter pelo menos 6 caracteres.';
  }

  // Fallback para erros desconhecidos
  return 'Ocorreu um erro inesperado. Por favor, tente novamente mais tarde.';
};
