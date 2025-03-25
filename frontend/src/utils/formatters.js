/**
 * Funções para formatação de dados no frontend
 */

// Formata um valor monetário
export const formatarMoeda = (valor, options = {}) => {
  if (valor === undefined || valor === null) return '';
  
  const config = {
    moeda: options.moeda || 'BRL',
    locale: options.locale || 'pt-BR',
    casasDecimais: options.casasDecimais !== undefined ? options.casasDecimais : 2
  };
  
  return new Intl.NumberFormat(config.locale, {
    style: 'currency',
    currency: config.moeda,
    minimumFractionDigits: config.casasDecimais,
    maximumFractionDigits: config.casasDecimais
  }).format(valor);
};

// Formata uma data
export const formatarData = (data, options = {}) => {
  if (!data) return '';
  
  const dataObj = new Date(data);
  
  // Verificar se a data é válida
  if (isNaN(dataObj.getTime())) {
    return '';
  }
  
  const config = {
    formato: options.formato || 'data', // 'data', 'dataHora', 'hora', 'relativo'
    locale: options.locale || 'pt-BR'
  };
  
  // Formatação relativa
  if (config.formato === 'relativo') {
    const agora = new Date();
    const diff = agora - dataObj;
    const segundos = Math.floor(diff / 1000);
    
    if (segundos < 60) return 'agora mesmo';
    
    const minutos = Math.floor(segundos / 60);
    if (minutos < 60) return `${minutos} ${minutos === 1 ? 'minuto' : 'minutos'} atrás`;
    
    const horas = Math.floor(minutos / 60);
    if (horas < 24) return `${horas} ${horas === 1 ? 'hora' : 'horas'} atrás`;
    
    const dias = Math.floor(horas / 24);
    if (dias < 30) return `${dias} ${dias === 1 ? 'dia' : 'dias'} atrás`;
    
    const meses = Math.floor(dias / 30);
    if (meses < 12) return `${meses} ${meses === 1 ? 'mês' : 'meses'} atrás`;
    
    const anos = Math.floor(dias / 365);
    return `${anos} ${anos === 1 ? 'ano' : 'anos'} atrás`;
  }
  
  // Formatação padrão
  const opcoes = {};
  
  switch (config.formato) {
    case 'data':
      opcoes.day = '2-digit';
      opcoes.month = '2-digit';
      opcoes.year = 'numeric';
      break;
    case 'dataHora':
      opcoes.day = '2-digit';
      opcoes.month = '2-digit';
      opcoes.year = 'numeric';
      opcoes.hour = '2-digit';
      opcoes.minute = '2-digit';
      break;
    case 'hora':
      opcoes.hour = '2-digit';
      opcoes.minute = '2-digit';
      break;
    default:
      opcoes.day = '2-digit';
      opcoes.month = '2-digit';
      opcoes.year = 'numeric';
  }
  
  return dataObj.toLocaleDateString(config.locale, opcoes);
};

// Formata um status de processo
export const formatarStatusProcesso = (status) => {
  const statusMap = {
    pendente: { label: 'Pendente', color: 'bg-yellow-500', textColor: 'text-white' },
    emAnalise: { label: 'Em Análise', color: 'bg-blue-500', textColor: 'text-white' },
    ativo: { label: 'Ativo', color: 'bg-green-500', textColor: 'text-white' },
    rejeitado: { label: 'Rejeitado', color: 'bg-red-500', textColor: 'text-white' },
    ofertaAceita: { label: 'Oferta Aceita', color: 'bg-purple-500', textColor: 'text-white' },
    emTransacao: { label: 'Em Transação', color: 'bg-indigo-500', textColor: 'text-white' },
    vendido: { label: 'Vendido', color: 'bg-gray-600', textColor: 'text-white' },
    arquivado: { label: 'Arquivado', color: 'bg-gray-500', textColor: 'text-white' }
  };
  
  return statusMap[status] || { label: status, color: 'bg-gray-400', textColor: 'text-gray-900' };
};

// Formata um status de oferta
export const formatarStatusOferta = (status) => {
  const statusMap = {
    pendente: { label: 'Pendente', color: 'bg-yellow-500', textColor: 'text-white' },
    emNegociacao: { label: 'Em Negociação', color: 'bg-blue-500', textColor: 'text-white' },
    aceita: { label: 'Aceita', color: 'bg-green-500', textColor: 'text-white' },
    rejeitada: { label: 'Rejeitada', color: 'bg-red-500', textColor: 'text-white' },
    cancelada: { label: 'Cancelada', color: 'bg-gray-500', textColor: 'text-white' },
    emTransacao: { label: 'Em Transação', color: 'bg-indigo-500', textColor: 'text-white' },
    concluida: { label: 'Concluída', color: 'bg-green-700', textColor: 'text-white' }
  };
  
  return statusMap[status] || { label: status, color: 'bg-gray-400', textColor: 'text-gray-900' };
};

// Formata um status de transação
export const formatarStatusTransacao = (status) => {
  const statusMap = {
    iniciada: { label: 'Iniciada', color: 'bg-yellow-500', textColor: 'text-white' },
    contratoEnviado: { label: 'Contrato Enviado', color: 'bg-blue-500', textColor: 'text-white' },
    contratoAssinado: { label: 'Contrato Assinado', color: 'bg-teal-500', textColor: 'text-white' },
    aguardandoPagamento: { label: 'Aguardando Pagamento', color: 'bg-purple-500', textColor: 'text-white' },
    pagamentoRegistrado: { label: 'Pagamento Registrado', color: 'bg-indigo-500', textColor: 'text-white' },
    concluida: { label: 'Concluída', color: 'bg-green-600', textColor: 'text-white' },
    cancelada: { label: 'Cancelada', color: 'bg-red-500', textColor: 'text-white' },
    reembolsada: { label: 'Reembolsada', color: 'bg-orange-500', textColor: 'text-white' }
  };
  
  return statusMap[status] || { label: status, color: 'bg-gray-400', textColor: 'text-gray-900' };
};

// Formata um tipo de processo
export const formatarTipoProcesso = (tipo) => {
  const tipoMap = {
    trabalhista: 'Trabalhista',
    civel: 'Cível',
    previdenciario: 'Previdenciário',
    tributario: 'Tributário',
    consumidor: 'Direito do Consumidor',
    outro: 'Outro'
  };
  
  return tipoMap[tipo] || tipo;
};

// Formata uma fase processual
export const formatarFaseProcessual = (fase) => {
  const faseMap = {
    conhecimento: 'Conhecimento',
    sentenca: 'Sentença',
    recursos: 'Recursos',
    transitoJulgado: 'Trânsito em Julgado',
    cumprimentoSentenca: 'Cumprimento de Sentença',
    execucao: 'Execução',
    precatorio: 'Precatório/RPV'
  };
  
  return faseMap[fase] || fase;
};

// Formata uma expectativa de recebimento
export const formatarExpectativaRecebimento = (expectativa) => {
  const expectativaMap = {
    '6': 'Menos de 6 meses',
    '12': '6 a 12 meses',
    '24': '12 a 24 meses',
    '36': '24 a 36 meses',
    '48': 'Mais de 36 meses',
    'incerto': 'Incerto'
  };
  
  return expectativaMap[expectativa] || expectativa;
};

// Formatar CPF/CNPJ
export function formatarCpfCnpj(documento) {
  if (!documento) return '';

  // Remove todos os caracteres não numéricos
  const numero = documento.replace(/\D/g, '');

  if (numero.length <= 11) {
    // CPF: 123.456.789-01
    return numero.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  } else {
    // CNPJ: 12.345.678/0001-90
    return numero.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  }
}

// Alias para manter compatibilidade
export const formatarCPFCNPJ = formatarCpfCnpj;

// Formata um número de telefone
export const formatarTelefone = (telefone) => {
  if (!telefone) return '';
  
  // Remove caracteres não numéricos
  const valor = telefone.replace(/\D/g, '');
  
  // Celular com 9 dígitos
  if (valor.length === 11) {
    return valor.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  }
  
  // Telefone fixo com 8 dígitos
  if (valor.length === 10) {
    return valor.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }
  
  return telefone;
};

// Limita o texto a um determinado tamanho
export const limitarTexto = (texto, tamanho, sufixo = '...') => {
  if (!texto || texto.length <= tamanho) {
    return texto || '';
  }
  
  return texto.substring(0, tamanho) + sufixo;
};

// Calcula o deságio entre dois valores
export const calcularDesagio = (valorEstimado, valorOferta) => {
  if (!valorEstimado || !valorOferta || valorEstimado <= 0) {
    return 0;
  }
  
  return ((valorEstimado - valorOferta) / valorEstimado) * 100;
};