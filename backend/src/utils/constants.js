/**
 * Constantes globais
 * Valores constantes usados em toda a aplicação
 */

// Status de processos
const PROCESSO_STATUS = {
    PENDENTE: 'pendente',
    EM_ANALISE: 'emAnalise',
    ATIVO: 'ativo',
    REJEITADO: 'rejeitado',
    OFERTA_ACEITA: 'ofertaAceita',
    EM_TRANSACAO: 'emTransacao',
    VENDIDO: 'vendido',
    ARQUIVADO: 'arquivado'
  };
  
  // Status de ofertas
  const OFERTA_STATUS = {
    PENDENTE: 'pendente',
    EM_NEGOCIACAO: 'emNegociacao',
    ACEITA: 'aceita',
    REJEITADA: 'rejeitada',
    CANCELADA: 'cancelada',
    EM_TRANSACAO: 'emTransacao',
    CONCLUIDA: 'concluida'
  };
  
  // Status de transações
  const TRANSACAO_STATUS = {
    INICIADA: 'iniciada',
    CONTRATO_ENVIADO: 'contratoEnviado',
    CONTRATO_ASSINADO: 'contratoAssinado',
    AGUARDANDO_PAGAMENTO: 'aguardandoPagamento',
    PAGAMENTO_REGISTRADO: 'pagamentoRegistrado',
    CONCLUIDA: 'concluida',
    CANCELADA: 'cancelada',
    REEMBOLSADA: 'reembolsada'
  };
  
  // Tipos de usuário
  const USUARIO_TIPO = {
    VENDEDOR: 'vendedor',
    COMPRADOR: 'comprador',
    ADMIN: 'admin'
  };
  
  // Tipos de processo
  const PROCESSO_TIPO = {
    TRABALHISTA: 'trabalhista',
    CIVEL: 'civel',
    PREVIDENCIARIO: 'previdenciario',
    TRIBUTARIO: 'tributario',
    CONSUMIDOR: 'consumidor',
    OUTRO: 'outro'
  };
  
  // Fases processuais
  const PROCESSO_FASE = {
    CONHECIMENTO: 'conhecimento',
    SENTENCA: 'sentenca',
    RECURSOS: 'recursos',
    TRANSITO_JULGADO: 'transitoJulgado',
    CUMPRIMENTO_SENTENCA: 'cumprimentoSentenca',
    EXECUCAO: 'execucao',
    PRECATORIO: 'precatorio'
  };
  
  // Expectativas de recebimento
  const EXPECTATIVA_RECEBIMENTO = {
    ATE_6_MESES: '6',
    DE_6_A_12_MESES: '12',
    DE_12_A_24_MESES: '24',
    DE_24_A_36_MESES: '36',
    MAIS_DE_36_MESES: '48',
    INCERTO: 'incerto'
  };
  
  // Taxa de comissão padrão
  const TAXA_COMISSAO_PADRAO = 0.05; // 5%
  
  // Limites
  const LIMITES = {
    UPLOAD_ARQUIVO_MAX: 10 * 1024 * 1024, // 10MB
    DOCUMENTOS_POR_UPLOAD: 10,
    TENTATIVAS_LOGIN_MAX: 5,
    TEMPO_BLOQUEIO_MIN: 30, // 30 minutos
    VALIDADE_TOKEN_RESET_SENHA_HORAS: 1,
    VALIDADE_OFERTA_DIAS: 7
  };
  
  // Regex para validações
  const REGEX = {
    EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    NUMERO_CNJ: /^\d{7}-\d{2}\.\d{4}\.\d\.\d{2}\.\d{4}$/,
    CPF: /^\d{3}\.\d{3}\.\d{3}-\d{2}$/,
    CNPJ: /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/,
    TELEFONE: /^\(\d{2}\)\s\d{4,5}-\d{4}$/
  };
  
  // Mensagens padrão
  const MENSAGENS = {
    ERRO_INTERNO: 'Ocorreu um erro interno no servidor. Por favor, tente novamente mais tarde.',
    NAO_AUTORIZADO: 'Você não está autorizado a realizar esta ação.',
    ACESSO_NEGADO: 'Acesso negado. Você não tem permissão para acessar este recurso.',
    RECURSO_NAO_ENCONTRADO: 'O recurso solicitado não foi encontrado.',
    DADOS_INVALIDOS: 'Os dados fornecidos são inválidos. Por favor, verifique e tente novamente.'
  };
  
  module.exports = {
    PROCESSO_STATUS,
    OFERTA_STATUS,
    TRANSACAO_STATUS,
    USUARIO_TIPO,
    PROCESSO_TIPO,
    PROCESSO_FASE,
    EXPECTATIVA_RECEBIMENTO,
    TAXA_COMISSAO_PADRAO,
    LIMITES,
    REGEX,
    MENSAGENS
  };