/**
 * Modelo de Processo Judicial
 * Representa um processo cadastrado por um vendedor na plataforma
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Schema para documentos anexados ao processo
const DocumentoSchema = new Schema({
  nome: {
    type: String,
    required: true,
    trim: true
  },
  tipo: {
    type: String,
    required: true,
    trim: true
  },
  caminho: {
    type: String,
    required: true
  },
  tamanho: {
    type: Number,
    required: true
  },
  dataUpload: {
    type: Date,
    required: true,
    default: Date.now
  }
}, { _id: true });

// Schema para histórico de status do processo
const HistoricoStatusSchema = new Schema({
  status: {
    type: String,
    required: true,
    enum: ['pendente', 'emAnalise', 'ativo', 'rejeitado', 'ofertaAceita', 'emTransacao', 'vendido', 'arquivado']
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

// Schema principal do processo
const ProcessoSchema = new Schema({
  // Dados do processo
  numero: {
    type: String,
    required: true,
    trim: true
  },
  tipo: {
    type: String,
    required: true,
    enum: ['trabalhista', 'civel', 'previdenciario', 'tributario', 'consumidor', 'outro']
  },
  tribunal: {
    type: String,
    required: true,
    trim: true
  },
  vara: {
    type: String,
    trim: true
  },
  cidade: {
    type: String,
    trim: true
  },
  estado: {
    type: String,
    trim: true
  },
  fase: {
    type: String,
    required: true,
    enum: ['conhecimento', 'sentenca', 'recursos', 'transitoJulgado', 'cumprimentoSentenca', 'execucao', 'precatorio']
  },
  valorCausa: {
    type: Number,
    required: true,
    min: 0
  },
  valorEstimado: {
    type: Number,
    required: true,
    min: 0
  },
  descricao: {
    type: String,
    required: true,
    trim: true
  },
  expectativaRecebimento: {
    type: String,
    enum: ['6', '12', '24', '36', '48', 'incerto'],
    default: 'incerto'
  },
  valorMinimo: {
    type: Number,
    min: 0
  },
  isConfidencial: {
    type: Boolean,
    default: false
  },

  // Referências e relacionamentos
  usuario: {
    type: Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true
  },
  ofertaAceita: {
    type: Schema.Types.ObjectId,
    ref: 'Oferta'
  },

  // Status e flags
  status: {
    type: String,
    required: true,
    enum: ['pendente', 'emAnalise', 'ativo', 'rejeitado', 'ofertaAceita', 'emTransacao', 'vendido', 'arquivado'],
    default: 'pendente'
  },
  temOfertas: {
    type: Boolean,
    default: false
  },

  // Datas
  dataCadastro: {
    type: Date,
    required: true,
    default: Date.now
  },
  dataAtualizacao: {
    type: Date
  },

  // Documentos e histórico
  documentos: [DocumentoSchema],
  historicoStatus: [HistoricoStatusSchema]
}, {
  timestamps: true
});

// Índices para melhorar performance de consultas
ProcessoSchema.index({ usuario: 1, status: 1 });
ProcessoSchema.index({ numero: 1, usuario: 1 }, { unique: true });
ProcessoSchema.index({ status: 1, tipo: 1, valorEstimado: 1 });
ProcessoSchema.index({ dataCadastro: -1 });

// Middleware pre-save para atualizar dataAtualizacao
ProcessoSchema.pre('save', function(next) {
  if (this.isModified() && !this.isNew) {
    this.dataAtualizacao = new Date();
  }
  next();
});

// Método para verificar se o processo aceita ofertas
ProcessoSchema.methods.aceitaOfertas = function() {
  return this.status === 'ativo';
};

// Método para calcular deságio com base no valor mínimo
ProcessoSchema.methods.calcularDesagio = function() {
  if (!this.valorMinimo || this.valorMinimo <= 0) {
    return null;
  }
  
  return 100 - ((this.valorMinimo / this.valorEstimado) * 100);
};

// Virtuals
ProcessoSchema.virtual('valorDesagio').get(function() {
  return this.calcularDesagio();
});

module.exports = mongoose.model('Processo', ProcessoSchema);