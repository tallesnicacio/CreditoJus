/**
 * Modelo de Transação
 * Representa uma transação de compra e venda de crédito judicial
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Schema para documentos da transação
const DocumentoTransacaoSchema = new Schema({
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
  },
  enviadoPor: {
    type: String,
    required: true,
    enum: ['vendedor', 'comprador', 'sistema']
  }
}, { _id: true });

// Schema para histórico de status da transação
const HistoricoStatusTransacaoSchema = new Schema({
  status: {
    type: String,
    required: true,
    enum: ['iniciada', 'contratoEnviado', 'contratoAssinado', 'aguardandoPagamento', 
           'pagamentoRegistrado', 'concluida', 'cancelada', 'reembolsada']
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

// Schema principal da transação
const TransacaoSchema = new Schema({
  // Referências
  oferta: {
    type: Schema.Types.ObjectId,
    ref: 'Oferta',
    required: true
  },
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

  // Valores financeiros
  valor: {
    type: Number,
    required: true,
    min: 0
  },
  comissao: {
    type: Number,
    required: true,
    min: 0
  },
  valorLiquido: {
    type: Number,
    required: true,
    min: 0
  },

  // Status e datas
  status: {
    type: String,
    required: true,
    enum: ['iniciada', 'contratoEnviado', 'contratoAssinado', 'aguardandoPagamento', 
           'pagamentoRegistrado', 'concluida', 'cancelada', 'reembolsada'],
    default: 'iniciada'
  },
  dataCriacao: {
    type: Date,
    required: true,
    default: Date.now
  },
  dataPagamento: {
    type: Date
  },
  dataConclusao: {
    type: Date
  },
  dataCancelamento: {
    type: Date
  },

  // Informações de pagamento
  comprovantePagamento: {
    type: String
  },
  observacaoPagamento: {
    type: String
  },

  // Informações de cancelamento
  motivoCancelamento: {
    type: String
  },
  canceladoPor: {
    type: String,
    enum: ['vendedor', 'comprador', 'sistema']
  },

  // Documentos e histórico
  documentos: [DocumentoTransacaoSchema],
  historicoStatus: [HistoricoStatusTransacaoSchema]
}, {
  timestamps: true
});

// Índices para melhorar performance de consultas
TransacaoSchema.index({ oferta: 1 }, { unique: true });
TransacaoSchema.index({ processo: 1 });
TransacaoSchema.index({ vendedor: 1, status: 1 });
TransacaoSchema.index({ comprador: 1, status: 1 });
TransacaoSchema.index({ dataCriacao: -1 });

// Método para verificar se a transação pode ser finalizada
TransacaoSchema.methods.podeSerFinalizada = function() {
  return this.status === 'pagamentoRegistrado';
};

// Método para verificar se a transação pode ser cancelada
TransacaoSchema.methods.podeSerCancelada = function() {
  const statusPermitidos = ['iniciada', 'contratoEnviado', 'contratoAssinado', 'aguardandoPagamento'];
  return statusPermitidos.includes(this.status);
};

// Virtuals
TransacaoSchema.virtual('percentualComissao').get(function() {
  return (this.comissao / this.valor) * 100;
});

TransacaoSchema.virtual('documentosVendedor').get(function() {
  return this.documentos.filter(doc => doc.enviadoPor === 'vendedor');
});

TransacaoSchema.virtual('documentosComprador').get(function() {
  return this.documentos.filter(doc => doc.enviadoPor === 'comprador');
});

module.exports = mongoose.model('Transacao', TransacaoSchema);