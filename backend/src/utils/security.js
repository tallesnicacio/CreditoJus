/**
 * Utilitários de segurança
 * Funções para operações relacionadas à segurança
 */

const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const authConfig = require('../config/auth');

/**
 * Gera um hash para uma senha
 * @param {String} senha Senha em texto puro
 * @returns {Promise<String>} Hash da senha
 */
const hashSenha = async (senha) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(senha, salt);
};

/**
 * Compara uma senha com um hash
 * @param {String} senha Senha em texto puro
 * @param {String} hash Hash armazenado
 * @returns {Promise<Boolean>} Resultado da comparação
 */
const comparaSenha = async (senha, hash) => {
  return bcrypt.compare(senha, hash);
};

/**
 * Gera um token JWT
 * @param {Object} payload Dados a serem incluídos no token
 * @param {Object} options Opções adicionais
 * @returns {String} Token JWT
 */
const gerarToken = (payload, options = {}) => {
  const expiresIn = options.expiresIn || authConfig.expiresIn;
  return jwt.sign(payload, authConfig.secret, { expiresIn });
};

/**
 * Gera um token de refresh
 * @param {String} userId ID do usuário
 * @param {Object} options Opções adicionais
 * @returns {String} Token de refresh
 */
const gerarRefreshToken = (userId, options = {}) => {
  const expiresIn = options.expiresIn || authConfig.refreshExpiresIn;
  return jwt.sign({ id: userId }, authConfig.secret, { expiresIn });
};

/**
 * Verifica um token JWT
 * @param {String} token Token JWT
 * @returns {Object} Payload decodificado ou erro
 */
const verificarToken = (token) => {
  try {
    return {
      valido: true,
      payload: jwt.verify(token, authConfig.secret)
    };
  } catch (err) {
    return {
      valido: false,
      erro: err.name === 'TokenExpiredError' ? 'Token expirado' : 'Token inválido',
      detalhes: err
    };
  }
};

/**
 * Gera um token aleatório para recuperação de senha
 * @param {Number} length Tamanho do token
 * @returns {String} Token aleatório
 */
const gerarTokenRecuperacao = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

/**
 * Sanitiza uma string para evitar XSS
 * @param {String} str String a ser sanitizada
 * @returns {String} String sanitizada
 */
const sanitizarString = (str) => {
  if (!str) return '';
  
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

/**
 * Gera um ID de sessão único
 * @returns {String} ID de sessão
 */
const gerarIdSessao = () => {
  return crypto.randomBytes(16).toString('hex');
};

/**
 * Verifica se uma senha atende aos requisitos de segurança
 * @param {String} senha Senha a ser verificada
 * @returns {Object} Resultado da verificação
 */
const verificarForcaSenha = (senha) => {
  const resultado = {
    valido: true,
    pontuacao: 0,
    erros: []
  };
  
  // Verificar comprimento mínimo
  if (senha.length < authConfig.password.minLength) {
    resultado.valido = false;
    resultado.erros.push(`A senha deve ter pelo menos ${authConfig.password.minLength} caracteres`);
  } else {
    resultado.pontuacao += 10;
  }
  
  // Verificar letras maiúsculas e minúsculas
  if (authConfig.password.requireMixedCase) {
    const temMaiuscula = /[A-Z]/.test(senha);
    const temMinuscula = /[a-z]/.test(senha);
    
    if (!temMaiuscula || !temMinuscula) {
      resultado.valido = false;
      resultado.erros.push('A senha deve conter letras maiúsculas e minúsculas');
    } else {
      resultado.pontuacao += 10;
    }
  }
  
  // Verificar números
  if (authConfig.password.requireNumber) {
    const temNumero = /[0-9]/.test(senha);
    
    if (!temNumero) {
      resultado.valido = false;
      resultado.erros.push('A senha deve conter pelo menos um número');
    } else {
      resultado.pontuacao += 10;
    }
  }
  
  // Verificar caracteres especiais
  if (authConfig.password.requireSpecialChar) {
    const temEspecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(senha);
    
    if (!temEspecial) {
      resultado.valido = false;
      resultado.erros.push('A senha deve conter pelo menos um caractere especial');
    } else {
      resultado.pontuacao += 10;
    }
  }
  
  // Classificar a força da senha
  if (resultado.pontuacao >= 30) {
    resultado.forca = 'forte';
  } else if (resultado.pontuacao >= 20) {
    resultado.forca = 'média';
  } else {
    resultado.forca = 'fraca';
  }
  
  return resultado;
};

module.exports = {
  hashSenha,
  comparaSenha,
  gerarToken,
  gerarRefreshToken,
  verificarToken,
  gerarTokenRecuperacao,
  sanitizarString,
  gerarIdSessao,
  verificarForcaSenha
};