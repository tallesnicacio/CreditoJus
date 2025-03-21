/**
 * Sistema de logging centralizado
 * Fornece funções para registro de logs com diferentes níveis
 */

const winston = require('winston');
const path = require('path');
const fs = require('fs');

// Criar diretório de logs se não existir
const logDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Formato personalizado para os logs
const customFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Criar o logger com configurações
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: customFormat,
  defaultMeta: { service: 'creditojus-api' },
  transports: [
    // Logs de erro são salvos em um arquivo separado
    new winston.transports.File({ 
      filename: path.join(logDir, 'error.log'), 
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    // Logs combinados são salvos em outro arquivo
    new winston.transports.File({ 
      filename: path.join(logDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5
    })
  ]
});

// Adicionar console transport em ambiente de desenvolvimento
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      winston.format.printf(({ timestamp, level, message, ...rest }) => {
        const restString = Object.keys(rest).length ? JSON.stringify(rest, null, 2) : '';
        return `${timestamp} ${level}: ${message} ${restString}`;
      })
    )
  }));
}

// Funções para diferentes níveis de log
const log = {
  error: (message, meta = {}) => {
    logger.error(message, meta);
  },
  
  warn: (message, meta = {}) => {
    logger.warn(message, meta);
  },
  
  info: (message, meta = {}) => {
    logger.info(message, meta);
  },
  
  debug: (message, meta = {}) => {
    logger.debug(message, meta);
  },
  
  // Para logs de acesso da API
  access: (req, res, responseTime) => {
    const { method, originalUrl, ip, user } = req;
    const { statusCode } = res;
    
    logger.info('API Access', {
      method,
      url: originalUrl,
      statusCode,
      responseTime,
      ip,
      userId: user ? user.id : undefined
    });
  },
  
  // Para logs de erros da API
  apiError: (err, req) => {
    const { method, originalUrl, ip, user } = req;
    
    logger.error('API Error', {
      method,
      url: originalUrl,
      ip,
      userId: user ? user.id : undefined,
      error: {
        name: err.name,
        message: err.message,
        stack: err.stack,
        code: err.code,
        statusCode: err.statusCode
      }
    });
  },
  
  // Para logs de transações financeiras
  transaction: (transactionData) => {
    logger.info('Financial Transaction', {
      ...transactionData,
      timestamp: new Date()
    });
  }
};

// Middleware para logging de requisições HTTP
const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  // Após completar a resposta
  res.on('finish', () => {
    const responseTime = Date.now() - start;
    log.access(req, res, responseTime);
  });
  
  next();
};

module.exports = {
  logger,
  log,
  requestLogger
};