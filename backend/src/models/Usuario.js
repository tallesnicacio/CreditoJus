/**
 * Modelo de Usuário
 * Representa os usuários da plataforma (vendedores, compradores e administradores)
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Schema = mongoose.Schema;

const UsuarioSchema = new Schema({
  // Informações básicas
  nome: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Por favor, informe um email válido']
  },
  senha: {
    type: String,
    required: true,
    select: false // Não retornar a senha nas consultas
  },
  tipo: {
    type: String,
    required: true,
    enum: ['vendedor', 'comprador', 'admin'],
    default: 'vendedor'
  },
  cpfCnpj: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  telefone: {
    type: String,
    trim: true
  },

  // Status e verificação
  verificado: {
    type: Boolean,
    default: false
  },
  ativo: {
    type: Boolean,
    default: true
  },

  // Segurança
  tentativasLogin: {
    type: Number,
    default: 0,
    select: false
  },
  bloqueadoAte: {
    type: Date,
    select: false
  },
  resetPasswordToken: {
    type: String,
    select: false
  },
  resetPasswordExpires: {
    type: Date,
    select: false
  },

  // Campos específicos para compradores (escritórios)
  comprador: {
    razaoSocial: {
      type: String,
      trim: true
    },
    inscricaoOAB: {
      type: String,
      trim: true
    },
    website: {
      type: String,
      trim: true
    },
    descricao: {
      type: String,
      trim: true
    },
    areasAtuacao: [{
      type: String,
      enum: ['trabalhista', 'civel', 'previdenciario', 'tributario', 'consumidor', 'outro']
    }]
  },

  // Campos específicos para vendedores (pessoas físicas)
  vendedor: {
    dataNascimento: {
      type: Date
    },
    endereco: {
      logradouro: String,
      numero: String,
      complemento: String,
      bairro: String,
      cidade: String,
      estado: String,
      cep: String
    }
  },

  // Datas
  dataCadastro: {
    type: Date,
    default: Date.now
  },
  ultimoAcesso: {
    type: Date
  }
}, {
  timestamps: true
});

// Índices para melhorar performance de consultas
UsuarioSchema.index({ tipo: 1 });

// Método para comparar senha
UsuarioSchema.methods.compararSenha = async function(senha) {
  return await bcrypt.compare(senha, this.senha);
};

// Middleware pre-save para hash da senha
UsuarioSchema.pre('save', async function(next) {
  // Só hash a senha se ela foi modificada (ou é nova)
  if (!this.isModified('senha')) return next();

  try {
    // Gerar um salt
    const salt = await bcrypt.genSalt(10);
    // Hash a senha junto com o novo salt
    this.senha = await bcrypt.hash(this.senha, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Método para verificar se o usuário está bloqueado
UsuarioSchema.methods.estaBloqueado = function() {
  return this.bloqueadoAte && this.bloqueadoAte > new Date();
};

// Método para registrar último acesso
UsuarioSchema.methods.registrarAcesso = async function() {
  this.ultimoAcesso = new Date();
  await this.save();
};

// Virtuals
UsuarioSchema.virtual('tipoFormatado').get(function() {
  const tipos = {
    vendedor: 'Vendedor',
    comprador: 'Comprador (Escritório)',
    admin: 'Administrador'
  };
  return tipos[this.tipo] || this.tipo;
});

module.exports = mongoose.model('Usuario', UsuarioSchema);