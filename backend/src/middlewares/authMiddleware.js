/**
 * Middleware de autenticação
 * Verifica se o usuário está autenticado e extrai informações do token JWT
 */

const jwt = require('jsonwebtoken');
const authConfig = require('../config/auth');

module.exports = (req, res, next) => {
  // Obter o token do cabeçalho Authorization
  const authHeader = req.headers.authorization;

  // Verificar se o token foi fornecido
  if (!authHeader) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  // O formato do cabeçalho deve ser: Bearer [token]
  const parts = authHeader.split(' ');

  if (parts.length !== 2) {
    return res.status(401).json({ error: 'Erro no formato do token' });
  }

  const [scheme, token] = parts;

  // Verificar se o formato tem a palavra Bearer
  if (!/^Bearer$/i.test(scheme)) {
    return res.status(401).json({ error: 'Token mal formatado' });
  }

  // Verificar se o token é válido
  try {
    const decoded = jwt.verify(token, authConfig.secret);

    // Adicionar o ID do usuário e tipo à requisição
    req.userId = decoded.id;
    req.userType = decoded.tipo; // Útil para verificar permissões

    return next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ error: 'Token expirado' });
    }
    
    if (err instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ error: 'Token inválido' });
    }
    
    console.error('Erro na verificação do token JWT:', err);
    return res.status(401).json({ error: 'Falha na autenticação do token' });
  }
};