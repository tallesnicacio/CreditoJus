/**
 * Ponto de entrada da aplicação
 * Configuração e inicialização do servidor Express
 */

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const path = require('path');

// Carregando configurações
require('dotenv').config();
const dbConfig = require('./config/database');
const routes = require('./routes');
const { errorHandler } = require('./utils/errors');
const { requestLogger, log } = require('./utils/logger');
const { upload, handleMulterError } = require('./middlewares/uploadMiddleware');

// Criar o app Express
const app = express();
const PORT = process.env.PORT || 3000;

// Conectar ao MongoDB
mongoose.connect(dbConfig.uri, dbConfig.options)
  .then(() => {
    log.info('Conectado ao MongoDB com sucesso');
  })
  .catch((err) => {
    log.error('Erro ao conectar ao MongoDB', { error: err.message });
    process.exit(1);
  });

// Middlewares
app.use(helmet()); // Segurança
app.use(cors()); // Habilitar CORS
app.use(compression()); // Compressão de resposta
app.use(express.json()); // Parsing de JSON
app.use(express.urlencoded({ extended: true })); // Parsing de URL-encoded

// Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev')); // Logging básico de requisições HTTP
  app.use(requestLogger); // Logging detalhado
}

// Configuração da pasta de uploads (acessível publicamente)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Rotas da API
app.use('/api', routes);

// Rota de saúde para verificar se o servidor está funcionando
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date(),
    uptime: process.uptime()
  });
});

// Middleware de tratamento de erros deve ser o último
app.use(errorHandler);

// Iniciar o servidor
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    log.info(`Servidor rodando na porta ${PORT}`);
    log.info(`Ambiente: ${process.env.NODE_ENV || 'development'}`);
  });
}

// Tratamento de erros não capturados
process.on('uncaughtException', (err) => {
  log.error('Erro não capturado', { error: err.stack });
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  log.error('Promessa rejeitada não tratada', { reason, promise });
});

module.exports = app; // Exportar para testes