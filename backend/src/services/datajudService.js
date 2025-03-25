const axios = require('axios');
const tribunais = require('../services/tribunais_datajud.json');

class DatajudService {
  constructor() {
    this.tribunais = tribunais;
  }

  // 🔍 Busca por número de processo CNJ
  async buscarProcessoPorNumero(numeroProcesso) {
    console.log('Método buscarProcessoPorNumero chamado');
    console.log('Número do processo:', numeroProcesso);
  
    // 🧼 Remove pontos, traços e espaços
    const numeroLimpo = numeroProcesso.replace(/[\.\- ]/g, '');
    console.log('Número do processo (limpo):', numeroLimpo);
  
    try {
      // ❗ Validação e extração com o número original formatado
      if (!this.validarNumeroCNJ(numeroProcesso)) {
        throw new Error('Número do processo inválido');
      }
  
      const codigoCNJ = this.extrairCodigoCNJ(numeroProcesso);
      const endpoint = this.getEndpoint(codigoCNJ);
      
      console.log('[DEBUG] Endpoint gerado:', endpoint);
      console.log('[DEBUG] Headers enviados:', {
        'Authorization': `Bearer ${process.env.DATAJUD_API_TOKEN}`,
        'Content-Type': 'application/json'
      });
  
      const response = await axios.post(
        endpoint,
        {
          query: {
            bool: {
              must: [
                {
                  match: {
                    numeroProcesso: numeroLimpo // usa número sem formatação aqui
                  }
                }
              ]
            }
          }
        },
        {
          headers: {
            'Authorization': `APIKey ${process.env.DATAJUD_API_TOKEN}`,
            'Content-Type': 'application/json'
          }
        }
      );
  
      const resultados = response.data?.hits?.hits || [];
      return resultados.map(hit => this.mapearDadosProcesso(hit._source));
  
    } catch (error) {
      console.error('Erro no serviço DataJud (por número):', error.message);
      throw error;
    }
  }

  // 🌐 Mapeia tribunal → endpoint
  getEndpoint(identificador) {
    let tribunal = this.tribunais[identificador] || 
      Object.values(this.tribunais).find(t => t.codCNJ === identificador);

    if (!tribunal) {
      throw new Error(`Tribunal não encontrado para identificador: ${identificador}`);
    }

    return `https://api-publica.datajud.cnj.jus.br/${tribunal.alias}/_search`;
  }

  // 🔎 Extrai código CNJ do número do processo
  extrairCodigoCNJ(numero) {
    const partes = numero.split('.');
    if (partes.length >= 4) {
      return `${partes[2]}.${partes[3]}`;
    }
    throw new Error('Formato de número CNJ inválido para extração');
  }

  // 🗂 Mapeia dados da API para o modelo do sistema
  mapearDadosProcesso(dadosOriginais) {
    const dados = dadosOriginais.dadosBasicos || {};
    const orgao = dados.orgaoJulgador || {};

    return {
      numero: dadosOriginais.numeroProcesso,
      tipo: this.classificarTipoProcesso(dados.classeProcessual),
      tribunal: dadosOriginais.tribunal,
      vara: orgao.nomeOrgao || '',
      cidade: 'Não informado', // A API pública não fornece
      estado: this.deduzirEstado(dadosOriginais.tribunal),
      fase: this.classificarFaseProcesso(dados.instancia),
      valorCausa: parseFloat(dados.valorCausa || 0),
      valorEstimado: parseFloat(dados.valorCausa || 0),
      descricao: dados.assunto?.join(', ') || 'Processo importado do DataJud',
      expectativaRecebimento: this.calcularExpectativaRecebimento(dadosOriginais)
    };
  }

  classificarTipoProcesso(classeOriginal) {
    const mapeamento = {
      'Ação Trabalhista': 'trabalhista',
      'Ação Cível': 'civel',
      'Ação Previdenciária': 'previdenciario',
      'Ação Tributária': 'tributario',
      'Ação de Consumo': 'consumidor'
    };
    return mapeamento[classeOriginal] || 'outro';
  }

  classificarFaseProcesso(faseOriginal) {
    const mapeamento = {
      '1º Grau': 'conhecimento',
      '2º Grau': 'recursos',
      'Recurso Especial': 'recursos',
      'Recurso Extraordinário': 'recursos',
      'Trânsito em Julgado': 'transitoJulgado',
      'Execução': 'execucao'
    };
    return mapeamento[faseOriginal] || 'conhecimento';
  }

  deduzirEstado(tribunal) {
    const mapa = {
      TJES: 'ES',
      TJSP: 'SP',
      TJRJ: 'RJ',
      TJMG: 'MG',
      TRF1: 'DF',
      TRF2: 'RJ',
      TRF3: 'SP',
      TRF4: 'RS',
      TRF5: 'PE'
    };
    return mapa[tribunal] || '';
  }

  calcularExpectativaRecebimento(dadosProcesso) {
    const dataDistribuicao = new Date(dadosProcesso.dataDistribuicao || '2000-01-01');
    const dataAtual = new Date();
    const diferencaAnos = (dataAtual - dataDistribuicao) / (1000 * 60 * 60 * 24 * 365);

    if (diferencaAnos < 0.5) return '6';
    if (diferencaAnos < 1) return '12';
    if (diferencaAnos < 2) return '24';
    if (diferencaAnos < 3) return '36';
    return '48';
  }

  validarNumeroCNJ(numero) {
    const regexCNJ = /^\d{7}-\d{2}\.\d{4}\.\d\.\d{2}\.\d{4}$/;
    return regexCNJ.test(numero);
  }

  validarCPF(cpf) {
    const regexCPF = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;
    return regexCPF.test(cpf);
  }
}

module.exports = new DatajudService();
