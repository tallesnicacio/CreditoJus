/**
 * Utilitários para tratamento de erros
 * Fornece classes e funções para padronização de erros na API
 */

/**
 * Classe base para erros da API
 */
class ApiError extends Error {
    constructor(message, statusCode, code, details = null) {
      super(message);
      this.name = this.constructor.name;
      this.statusCode = statusCode;
      this.code = code;
      this.details = details;
      Error.captureStackTrace(this, this.constructor);
    }
  }
  
  /**
   * Erro 400 - Bad Request
   */
  class BadRequestError extends ApiError {
    constructor(message = 'Requisição inválida', code = 'BAD_REQUEST', details = null) {
      super(message, 400, code, details);
    }
  }
  
  /**
   * Erro 401 - Unauthorized
   */
  class UnauthorizedError extends ApiError {
    constructor(message = 'Não autorizado', code = 'UNAUTHORIZED', details = null) {
      super(message, 401, code, details);
    }
  }
  
  /**
   * Erro 403 - Forbidden
   */
  class ForbiddenError extends ApiError {
    constructor(message = 'Acesso negado', code = 'FORBIDDEN', details = null) {
      super(message, 403, code, details);
    }
  }
  
  /**
   * Erro 404 - Not Found
   */
  class NotFoundError extends ApiError {
    constructor(message = 'Recurso não encontrado', code = 'NOT_FOUND', details = null) {
      super(message, 404, code, details);
    }
  }
  
  /**
   * Erro 409 - Conflict
   */
  class ConflictError extends ApiError {
    constructor(message = 'Conflito de recursos', code = 'CONFLICT', details = null) {
      super(message, 409, code, details);
    }
  }
  
  /**
   * Erro 422 - Unprocessable Entity
   */
  class ValidationError extends ApiError {
    constructor(message = 'Erro de validação', code = 'VALIDATION_ERROR', details = null) {
      super(message, 422, code, details);
    }
  }
  
  /**
   * Erro 500 - Internal Server Error
   */
  class InternalServerError extends ApiError {
    constructor(message = 'Erro interno do servidor', code = 'INTERNAL_ERROR', details = null) {
      super(message, 500, code, details);
    }
  }
  
  /**
   * Middleware para tratamento de erros
   * @param {Error} err Erro capturado
   * @param {Object} req Requisição
   * @param {Object} res Resposta
   * @param {Function} next Próximo middleware
   */
  const errorHandler = (err, req, res, next) => {
    console.error('Erro capturado:', err);
    
    // Se for um erro da API, retorna com o statusCode e detalhes
    if (err instanceof ApiError) {
      return res.status(err.statusCode).json({
        error: {
          message: err.message,
          code: err.code,
          details: err.details
        }
      });
    }
    
    // Verificar erros de validação do Mongoose
    if (err.name === 'ValidationError') {
      const details = Object.keys(err.errors).reduce((acc, key) => {
        acc[key] = err.errors[key].message;
        return acc;
      }, {});
      
      return res.status(422).json({
        error: {
          message: 'Erro de validação',
          code: 'VALIDATION_ERROR',
          details
        }
      });
    }
    
    // Erro de cast do MongoDB (ex: ID inválido)
    if (err.name === 'CastError') {
      return res.status(400).json({
        error: {
          message: 'Formato de dados inválido',
          code: 'CAST_ERROR',
          details: {
            path: err.path,
            value: err.value
          }
        }
      });
    }
    
    // Erro de duplicação do MongoDB
    if (err.name === 'MongoError' && err.code === 11000) {
      return res.status(409).json({
        error: {
          message: 'Duplicação de dados',
          code: 'DUPLICATE_KEY',
          details: err.keyValue
        }
      });
    }
    
    // Erro genérico
    return res.status(500).json({
      error: {
        message: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR'
      }
    });
  };
  
  module.exports = {
    ApiError,
    BadRequestError,
    UnauthorizedError,
    ForbiddenError,
    NotFoundError,
    ConflictError,
    ValidationError,
    InternalServerError,
    errorHandler
  };