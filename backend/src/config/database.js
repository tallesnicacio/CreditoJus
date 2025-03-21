/**
 * Configurações de conexão com o banco de dados
 * Este arquivo define os parâmetros para conexão com MongoDB
 */

// Carregando variáveis de ambiente se não estiver em produção
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

// Configurações de conexão para diferentes ambientes
const config = {
  // Ambiente de desenvolvimento
  development: {
    uri: process.env.DEV_MONGODB_URI || 'mongodb://localhost:27017/creditojus-dev',
    options: {
      serverSelectionTimeoutMS: 5000,
      maxPoolSize: 10
    }
  },
  
  // Ambiente de teste
  test: {
    uri: process.env.TEST_MONGODB_URI || 'mongodb://localhost:27017/creditojus-test',
    options: {
      serverSelectionTimeoutMS: 5000,
      maxPoolSize: 5
    }
  },
  
  // Ambiente de produção
  production: {
    uri: process.env.MONGODB_URI,
    options: {
      serverSelectionTimeoutMS: 10000,
      maxPoolSize: 50,
      socketTimeoutMS: 45000,
      family: 4 // Forçar IPv4
    }
  }
};

// Determina qual configuração usar com base no ambiente
const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

if (!dbConfig) {
  throw new Error(`Configuração de banco de dados não encontrada para o ambiente: ${env}`);
}

if (env === 'production' && !dbConfig.uri) {
  throw new Error('URI do MongoDB não definida para o ambiente de produção');
}

module.exports = dbConfig;