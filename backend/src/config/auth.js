/**
 * Configurações de autenticação para o sistema CreditoJus
 * Este arquivo define parâmetros relacionados a autenticação, tokens e segurança
 */

module.exports = {
  // Segredo usado para assinar os tokens JWT - em produção, deve ser uma string complexa
  // e armazenada em variáveis de ambiente
  secret: process.env.JWT_SECRET || 'creditojus-secret-key-development',
  
  // Tempo de expiração do token JWT
  expiresIn: '1d', // 1 dia
  
  // Tempo de expiração do token de refresh
  refreshExpiresIn: '7d', // 7 dias
  
  // Configurações de senha
  password: {
    // Tamanho mínimo da senha
    minLength: 8,
    
    // Exigir pelo menos um caractere especial
    requireSpecialChar: true,
    
    // Exigir pelo menos um número
    requireNumber: true,
    
    // Exigir letras maiúsculas e minúsculas
    requireMixedCase: true,
    
    // Número de tentativas de login antes de bloquear a conta
    maxAttempts: 5,
    
    // Tempo (em minutos) que a conta fica bloqueada após exceder maxAttempts
    lockTime: 30
  },
  
  // Configurações para verificação em duas etapas (2FA)
  twoFactor: {
    // Se a verificação em duas etapas está habilitada
    enabled: false,
    
    // Tempo de validade do código em segundos
    codeValidityTime: 300 // 5 minutos
  },
  
  // Configurações para redefinição de senha
  passwordReset: {
    // Tempo de validade do token de redefinição de senha em horas
    tokenValidityTime: 1, // 1 hora
  }
};