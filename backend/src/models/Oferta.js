/**
 * Modelo de Oferta
 * Representa uma oferta feita por um comprador para um processo judicial
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Schema para histórico de status da oferta
const HistoricoStatusSchema = new Schema({
  status: {
    type: String,
    required: true,
    enum: ['pendente', 'emNegociacao', 'aceita', 'rejeitada', 'cancelada', 'emTransacao', 'concluida']
  },
  data: {
    type: Date,
    required: true,
    default: Date.now
  },
  observacao: {
    type: String
  }
}, { _id: true });

// Schema para histórico de negociação (valores e contrapropostas)
const HistoricoNegociacaoSchema = new Schema({
  tipo: {
    type: String,
    required: true,
    enum: ['oferta', 'contraproposta', 'aceitacao', 'recusa']
  },
  valor: {
    type: Number
  },
  mensagem: {
    type: String
  },
  condicoesEspeciais: {
    type: String
  },
  data: {
    type: Date,
    required: true,
    default: Date.now
  }
}, { _id: true });

// Schema principal da oferta
const OfertaSchema = new Schema({
  // Referências
  processo: {
    type: Schema.Types.ObjectId,
    ref: 'Processo',
    required: true
  },
  vendedor: {
    type: Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true
  },
  comprador: {
    type: Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true
  },

  // Dados da oferta
  valor: {
    type: Number,
    required: true,
    min: 0
  },
  mensagem: {
    type: String,
    trim: true
  },
  condicoesEspeciais: {
    type: String,
    trim: true
  },

  // Status e datas
  status: {
    type: String,
    required: true,
    enum: ['pendente', 'emNegociacao', 'aceita', 'rejeitada', 'cancelada', 'emTransacao', 'concluida'],
    default: 'pendente'
  },
  dataCriacao: {
    type: Date,
    required: true,
    default: Date.now
  },
  dataAtualizacao: {
    type: Date
  },
  dataValidade: {
    type: Date,
    required: true
  },

  // Históricos
  historicoStatus: [HistoricoStatusSchema],
  historicoNegociacao: [HistoricoNegociacaoSchema]
}, {
  timestamps: true
});

// Índices para melhorar performance de consultas
OfertaSchema.index({ processo: 1, comprador: 1 });
OfertaSchema.index({ vendedor: 1, status: 1 });
OfertaSchema.index({ comprador: 1, status: 1 });
OfertaSchema.index({ dataCriacao: -1 });

// Método para verificar se a oferta está válida (não expirada)
OfertaSchema.methods.isValida = function() {
  return new Date() <= this.dataValidade;
};

// Método para verificar se a oferta pode ser atualizada
OfertaSchema.methods.podeSerAtualizada = function() {
  const statusPermitidos = ['pendente', 'emNegociacao'];
  return statusPermitidos.includes(this.status) && this.isValida();
};

// Middleware pre-save para atualizar dataAtualizacao
OfertaSchema.pre('save', function(next) {
  if (this.isModified() && !this.isNew) {
    this.dataAtualizacao = new Date();
  }
  next();
});

module.exports = mongoose.model('Oferta', OfertaSchema);