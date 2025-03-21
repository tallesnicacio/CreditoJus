/**
 * Utilitários de formatação
 * Funções para formatação de valores, datas e textos
 */

/**
 * Formata um valor monetário
 * @param {Number} valor Valor a ser formatado
 * @param {String} moeda Símbolo da moeda (padrão: R$)
 * @param {String} locale Localização para formatação (padrão: pt-BR)
 * @returns {String} Valor formatado
 */
const formatarMoeda = (valor, moeda = 'BRL', locale = 'pt-BR') => {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: moeda
    }).format(valor);
  };
  
  /**
   * Formata uma data
   * @param {Date|String|Number} data Data a ser formatada
   * @param {Object} options Opções de formatação
   * @returns {String} Data formatada
   */
  const formatarData = (data, options = {}) => {
    const dataObj = data instanceof Date ? data : new Date(data);
    
    const config = {
      formato: options.formato || 'data', // 'data', 'dataHora', 'hora', 'relativo'
      locale: options.locale || 'pt-BR'
    };
    
    // Verificar se a data é válida
    if (isNaN(dataObj.getTime())) {
      return '';
    }
    
    // Formatação relativa
    if (config.formato === 'relativo') {
      const agora = new Date();
      const diff = agora - dataObj;
      const segundos = Math.floor(diff / 1000);
      const minutos = Math.floor(segundos / 60);
      const horas = Math.floor(minutos / 60);
      const dias = Math.floor(horas / 24);
      const meses = Math.floor(dias / 30);
      const anos = Math.floor(dias / 365);
      
      if (segundos < 60) return 'agora mesmo';
      if (minutos < 60) return `${minutos} ${minutos === 1 ? 'minuto' : 'minutos'} atrás`;
      if (horas < 24) return `${horas} ${horas === 1 ? 'hora' : 'horas'} atrás`;
      if (dias < 30) return `${dias} ${dias === 1 ? 'dia' : 'dias'} atrás`;
      if (meses < 12) return `${meses} ${meses === 1 ? 'mês' : 'meses'} atrás`;
      return `${anos} ${anos === 1 ? 'ano' : 'anos'} atrás`;
    }
    
    // Formatação padrão
    let formatoOpcoes = {};
    
    switch (config.formato) {
      case 'data':
        formatoOpcoes = { 
          day: '2-digit', 
          month: '2-digit', 
          year: 'numeric' 
        };
        break;
      case 'dataHora':
        formatoOpcoes = { 
          day: '2-digit', 
          month: '2-digit', 
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        };
        break;
      case 'hora':
        formatoOpcoes = { 
          hour: '2-digit', 
          minute: '2-digit' 
        };
        break;
      default:
        formatoOpcoes = { 
          day: '2-digit', 
          month: '2-digit', 
          year: 'numeric' 
        };
    }
    
    return dataObj.toLocaleDateString(config.locale, formatoOpcoes);
  };
  
  /**
   * Formata um número
   * @param {Number} numero Número a ser formatado
   * @param {Object} options Opções de formatação
   * @returns {String} Número formatado
   */
  const formatarNumero = (numero, options = {}) => {
    const config = {
      casasDecimais: options.casasDecimais !== undefined ? options.casasDecimais : 2,
      separadorDecimal: options.separadorDecimal || ',',
      separadorMilhar: options.separadorMilhar || '.',
      locale: options.locale || 'pt-BR'
    };
    
    if (config.locale) {
      return new Intl.NumberFormat(config.locale, {
        minimumFractionDigits: config.casasDecimais,
        maximumFractionDigits: config.casasDecimais
      }).format(numero);
    }
    
    // Formatação manual se não usar locale
    const partes = numero.toFixed(config.casasDecimais).split('.');
    partes[0] = partes[0].replace(/\B(?=(\d{3})+(?!\d))/g, config.separadorMilhar);
    
    return partes.join(config.separadorDecimal);
  };
  
  /**
   * Formata um percentual
   * @param {Number} valor Valor a ser formatado (0.1 para 10%)
   * @param {Object} options Opções de formatação
   * @returns {String} Percentual formatado
   */
  const formatarPercentual = (valor, options = {}) => {
    const config = {
      casasDecimais: options.casasDecimais !== undefined ? options.casasDecimais : 2,
      simbolo: options.simbolo !== undefined ? options.simbolo : true,
      locale: options.locale || 'pt-BR'
    };
    
    if (config.locale) {
      return new Intl.NumberFormat(config.locale, {
        style: 'percent',
        minimumFractionDigits: config.casasDecimais,
        maximumFractionDigits: config.casasDecimais
      }).format(valor);
    }
    
    // Formatação manual se não usar locale
    const valorPercentual = (valor * 100).toFixed(config.casasDecimais);
    return `${valorPercentual}${config.simbolo ? '%' : ''}`;
  };
  
  /**
   * Formata um CPF
   * @param {String} cpf CPF a ser formatado
   * @returns {String} CPF formatado
   */
  const formatarCPF = (cpf) => {
    // Remove caracteres não numéricos
    cpf = cpf.replace(/\D/g, '');
    
    // Adiciona pontos e traço
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };
  
  /**
   * Formata um CNPJ
   * @param {String} cnpj CNPJ a ser formatado
   * @returns {String} CNPJ formatado
   */
  const formatarCNPJ = (cnpj) => {
    // Remove caracteres não numéricos
    cnpj = cnpj.replace(/\D/g, '');
    
    // Adiciona pontos, barra e traço
    return cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  };
  
  /**
   * Formata um número de telefone
   * @param {String} telefone Telefone a ser formatado
   * @returns {String} Telefone formatado
   */
  const formatarTelefone = (telefone) => {
    // Remove caracteres não numéricos
    telefone = telefone.replace(/\D/g, '');
    
    // Formato para celular com 9 dígitos
    if (telefone.length === 11) {
      return telefone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    
    // Formato para telefone fixo com 8 dígitos
    if (telefone.length === 10) {
      return telefone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    
    // Retorna sem formatação se não se encaixar nos padrões
    return telefone;
  };
  
  /**
   * Limita o texto a um número máximo de caracteres
   * @param {String} texto Texto a ser limitado
   * @param {Number} tamanho Tamanho máximo
   * @param {String} sufixo Sufixo a ser adicionado quando o texto é truncado
   * @returns {String} Texto limitado
   */
  const limitarTexto = (texto, tamanho, sufixo = '...') => {
    if (!texto || texto.length <= tamanho) {
      return texto;
    }
    
    return texto.substring(0, tamanho) + sufixo;
  };
  
  module.exports = {
    formatarMoeda,
    formatarData,
    formatarNumero,
    formatarPercentual,
    formatarCPF,
    formatarCNPJ,
    formatarTelefone,
    limitarTexto
  };