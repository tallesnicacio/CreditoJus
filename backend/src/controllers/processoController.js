/**
 * Controller de processos judiciais
 * Gerencia operações de cadastro, consulta e atualização de processos
 */

const Processo = require('../models/Processo');
const Usuario = require('../models/Usuario');
const Oferta = require('../models/Oferta');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const unlinkAsync = promisify(fs.unlink);
const DatajudService = require('../services/datajudService');

// Função auxiliar para validar número de processo no formato CNJ
const validarNumeroCNJ = (numero) => {
  // Formato CNJ: NNNNNNN-DD.AAAA.J.TR.OOOO
  const regexCNJ = /^\d{7}-\d{2}\.\d{4}\.\d\.\d{2}\.\d{4}$/;
  return regexCNJ.test(numero);
};

module.exports = {
  /**
   * Cadastrar um novo processo
   */
  async cadastrar(req, res) {
    try {
      const {
        numero,
        tipo,
        tribunal,
        vara,
        cidade,
        estado,
        fase,
        valorCausa,
        valorEstimado,  // Aqui é onde o problema ocorre
        descricao,
        expectativaRecebimento,
        valorMinimo,
        isConfidencial
      } = req.body;
  
      const usuarioId = req.userId; // ID do usuário autenticado
  
      // Validações de valores numéricos
      const valorCausaNumerico = parseFloat(valorCausa);
      const valorEstimadoNumerico = parseFloat(valorEstimado);
      const valorMinimoNumerico = valorMinimo ? parseFloat(valorMinimo) : null;
  
      // Verificar se os valores numéricos são válidos
      if (isNaN(valorCausaNumerico) || isNaN(valorEstimadoNumerico)) {
        return res.status(400).json({ 
          error: 'Valores numéricos inválidos',
          detalhes: {
            valorCausa: valorCausa,
            valorEstimado: valorEstimado
          }
        });
      }

      // Verificar se o usuário é um vendedor
      const usuario = await Usuario.findById(usuarioId);
      if (!usuario || usuario.tipo !== 'vendedor') {
        return res.status(403).json({ error: 'Apenas vendedores podem cadastrar processos' });
      }

      // Validar número do processo no formato CNJ
      if (!validarNumeroCNJ(numero)) {
        return res.status(400).json({ error: 'Número de processo inválido. Use o formato CNJ: NNNNNNN-DD.AAAA.J.TR.OOOO' });
      }

      // Verificar se o processo já existe para este usuário
      const processoExistente = await Processo.findOne({ numero, usuario: usuarioId });
      if (processoExistente) {
        return res.status(400).json({ error: 'Você já cadastrou um processo com este número' });
      }

      // Criar o processo
      const processo = await Processo.create({
        numero,
        tipo,
        tribunal,
        vara,
        cidade,
        estado,
        fase,
        valorCausa: valorCausaNumerico,
        valorEstimado: valorEstimadoNumerico,
        descricao,
        expectativaRecebimento,
        valorMinimo: valorMinimoNumerico,
        isConfidencial: isConfidencial || false,
        usuario: usuarioId,
        status: 'pendente',
        temOfertas: false,
        documentos: [],
        dataCadastro: new Date(),
        historicoStatus: [{
          status: 'pendente',
          data: new Date(),
          observacao: 'Processo cadastrado'
        }]
      });
  
      return res.status(201).json({
        processo,
        message: 'Processo cadastrado com sucesso! Agora adicione os documentos necessários para validação.'
      });
    } catch (err) {
      console.error('Erro detalhado ao cadastrar processo:', err);
      return res.status(500).json({ 
        error: 'Falha ao cadastrar processo',
        detalhes: err.message
      });
    }
  },

  /**
   * Adicionar documentos a um processo
   */
  async adicionarDocumentos(req, res) {
    try {
      const { id } = req.params;
      const usuarioId = req.userId;

      // Verificar se existem arquivos no upload
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: 'Nenhum documento enviado' });
      }

      // Buscar o processo
      const processo = await Processo.findById(id);
      if (!processo) {
        // Remover os arquivos enviados, já que o processo não existe
        for (const file of req.files) {
          await unlinkAsync(file.path);
        }
        return res.status(404).json({ error: 'Processo não encontrado' });
      }

      // Verificar se o usuário é o dono do processo
      if (processo.usuario.toString() !== usuarioId) {
        // Remover os arquivos enviados, já que o usuário não tem permissão
        for (const file of req.files) {
          await unlinkAsync(file.path);
        }
        return res.status(403).json({ error: 'Você não tem permissão para adicionar documentos a este processo' });
      }

      // Adicionar os documentos ao processo
      const novosDocumentos = req.files.map(file => ({
        nome: file.originalname,
        tipo: file.mimetype,
        caminho: file.path,
        tamanho: file.size,
        dataUpload: new Date()
      }));

      processo.documentos.push(...novosDocumentos);

      // Se o processo está pendente e tem documentos, mudar para "em análise"
      if (processo.status === 'pendente') {
        processo.status = 'emAnalise';
        processo.historicoStatus.push({
          status: 'emAnalise',
          data: new Date(),
          observacao: 'Documentos adicionados, processo em análise'
        });
      }

      await processo.save();

      return res.json({
        processo,
        message: 'Documentos adicionados com sucesso'
      });
    } catch (err) {
      console.error('Erro ao adicionar documentos:', err);
      return res.status(500).json({ error: 'Falha ao adicionar documentos' });
    }
  },

  /**
   * Remover um documento de um processo
   */
  async removerDocumento(req, res) {
    try {
      const { id, documentoId } = req.params;
      const usuarioId = req.userId;

      // Buscar o processo
      const processo = await Processo.findById(id);
      if (!processo) {
        return res.status(404).json({ error: 'Processo não encontrado' });
      }

      // Verificar se o usuário é o dono do processo
      if (processo.usuario.toString() !== usuarioId) {
        return res.status(403).json({ error: 'Você não tem permissão para remover documentos deste processo' });
      }

      // Verificar se o documento existe
      const documento = processo.documentos.id(documentoId);
      if (!documento) {
        return res.status(404).json({ error: 'Documento não encontrado' });
      }

      // Remover o arquivo físico
      await unlinkAsync(documento.caminho);

      // Remover o documento do array
      processo.documentos.pull(documentoId);
      await processo.save();

      return res.json({
        message: 'Documento removido com sucesso'
      });
    } catch (err) {
      console.error('Erro ao remover documento:', err);
      return res.status(500).json({ error: 'Falha ao remover documento' });
    }
  },

  /**
   * Atualizar informações de um processo
   */
  async atualizar(req, res) {
    try {
      const { id } = req.params;
      const usuarioId = req.userId;
      const dadosAtualizados = req.body;

      // Buscar o processo
      const processo = await Processo.findById(id);
      if (!processo) {
        return res.status(404).json({ error: 'Processo não encontrado' });
      }

      // Verificar se o usuário é o dono do processo
      if (processo.usuario.toString() !== usuarioId) {
        return res.status(403).json({ error: 'Você não tem permissão para atualizar este processo' });
      }

      // Verificar se o processo pode ser atualizado
      const statusPermitidos = ['pendente', 'emAnalise', 'ativo', 'rejeitado'];
      if (!statusPermitidos.includes(processo.status)) {
        return res.status(400).json({ error: `Não é possível atualizar um processo com status '${processo.status}'` });
      }

      // Lista de campos que podem ser atualizados
      const camposPermitidos = [
        'tipo', 'tribunal', 'vara', 'cidade', 'estado', 'fase',
        'valorEstimado', 'descricao', 'expectativaRecebimento',
        'valorMinimo', 'isConfidencial'
      ];

      // Filtrar apenas os campos permitidos
      const atualizacoes = {};
      for (const campo of camposPermitidos) {
        if (dadosAtualizados[campo] !== undefined) {
          atualizacoes[campo] = dadosAtualizados[campo];
        }
      }

      // Converter valores para float
      if (atualizacoes.valorEstimado) atualizacoes.valorEstimado = parseFloat(atualizacoes.valorEstimado);
      if (atualizacoes.valorMinimo) atualizacoes.valorMinimo = parseFloat(atualizacoes.valorMinimo);

      // Se estiver atualizando o número do processo, validar formato CNJ
      if (dadosAtualizados.numero && dadosAtualizados.numero !== processo.numero) {
        if (!validarNumeroCNJ(dadosAtualizados.numero)) {
          return res.status(400).json({ error: 'Número de processo inválido. Use o formato CNJ: NNNNNNN-DD.AAAA.J.TR.OOOO' });
        }
        
        // Verificar se já existe outro processo com este número
        const processoExistente = await Processo.findOne({
          numero: dadosAtualizados.numero,
          usuario: usuarioId,
          _id: { $ne: id }
        });
        
        if (processoExistente) {
          return res.status(400).json({ error: 'Você já cadastrou um processo com este número' });
        }
        
        atualizacoes.numero = dadosAtualizados.numero;
      }

      // Atualizar o processo
      Object.assign(processo, atualizacoes);
      
      // Registrar a atualização no histórico se houve mudanças
      if (Object.keys(atualizacoes).length > 0) {
        processo.dataAtualizacao = new Date();
        
        // Se o processo foi rejeitado e está sendo corrigido, voltar para análise
        if (processo.status === 'rejeitado') {
          processo.status = 'emAnalise';
          processo.historicoStatus.push({
            status: 'emAnalise',
            data: new Date(),
            observacao: 'Dados atualizados após rejeição, processo em nova análise'
          });
        } else {
          processo.historicoStatus.push({
            status: processo.status,
            data: new Date(),
            observacao: 'Dados do processo atualizados'
          });
        }
      }

      await processo.save();

      return res.json({
        processo,
        message: 'Processo atualizado com sucesso'
      });
    } catch (err) {
      console.error('Erro ao atualizar processo:', err);
      return res.status(500).json({ error: 'Falha ao atualizar processo' });
    }
  },
  /**
   * Obter detalhes de um processo específico
   */
  async obterDetalhes(req, res) {
    try {
      const { id } = req.params;
      const usuarioId = req.userId;

      // Buscar o processo com informações do vendedor
      const processo = await Processo.findById(id)
        .populate('usuario', 'nome email telefone'); // Não expor todos os dados do usuário

      if (!processo) {
        return res.status(404).json({ error: 'Processo não encontrado' });
      }

      // Se o processo é confidencial e o usuário não é o dono
      if (processo.isConfidencial && processo.usuario._id.toString() !== usuarioId) {
        // Verificar se o usuário é um comprador que fez uma oferta
        const temOferta = await Oferta.findOne({
          processo: id,
          comprador: usuarioId
        });

        if (!temOferta) {
          // Ocultar algumas informações confidenciais
          processo.numero = processo.numero.replace(/\d{4}$/, 'XXXX');
          processo.vara = 'Confidencial';
          processo.cidade = 'Confidencial';
          // Outras ocultações conforme necessário
        }
      }

      // Verificar ofertas do usuário para este processo (se ele for comprador)
      const minhasOfertas = await Oferta.find({
        processo: id,
        comprador: usuarioId
      }).sort({ dataCriacao: -1 });

      // Contar total de ofertas (apenas para o dono do processo)
      let totalOfertas = 0;
      if (processo.usuario._id.toString() === usuarioId) {
        totalOfertas = await Oferta.countDocuments({
          processo: id,
          status: { $in: ['pendente', 'emNegociacao'] }
        });
      }

      return res.json({
        processo,
        minhasOfertas: minhasOfertas || [],
        totalOfertas: totalOfertas || 0
      });
    } catch (err) {
      console.error('Erro ao obter detalhes do processo:', err);
      return res.status(500).json({ error: 'Falha ao obter detalhes do processo' });
    }
  },

  /**
   * Listar processos do usuário autenticado (para vendedores)
   */
  async listarMeusProcessos(req, res) {
    try {
      const usuarioId = req.userId;
      const { status, tipo, valorMinimo, valorMaximo, ordenar } = req.query;
      const pagina = parseInt(req.query.pagina) || 1;
      const limite = parseInt(req.query.limite) || 10;
      const skip = (pagina - 1) * limite;

      // Construir o filtro base
      const filtro = { usuario: usuarioId };

      // Adicionar filtros adicionais se fornecidos
      if (status) {
        filtro.status = status;
      }

      if (tipo) {
        filtro.tipo = tipo;
      }

      // Filtro de valor estimado
      if (valorMinimo || valorMaximo) {
        filtro.valorEstimado = {};
        if (valorMinimo) filtro.valorEstimado.$gte = parseFloat(valorMinimo);
        if (valorMaximo) filtro.valorEstimado.$lte = parseFloat(valorMaximo);
      }

      // Determinar ordenação
      let sort = { dataCadastro: -1 }; // Padrão: mais recentes primeiro
      if (ordenar === 'valorAsc') {
        sort = { valorEstimado: 1 };
      } else if (ordenar === 'valorDesc') {
        sort = { valorEstimado: -1 };
      } else if (ordenar === 'antigos') {
        sort = { dataCadastro: 1 };
      }

      // Contar total de processos para paginação
      const total = await Processo.countDocuments(filtro);

      // Buscar os processos
      const processos = await Processo.find(filtro)
        .sort(sort)
        .skip(skip)
        .limit(limite);

      // Para cada processo, contar as ofertas ativas
      const processosComOfertas = await Promise.all(processos.map(async (processo) => {
        const ofertasAtivas = await Oferta.countDocuments({
          processo: processo._id,
          status: { $in: ['pendente', 'emNegociacao'] }
        });

        const processoObj = processo.toObject();
        processoObj.ofertasAtivas = ofertasAtivas;
        return processoObj;
      }));

      return res.json({
        processos: processosComOfertas,
        paginacao: {
          total,
          pagina,
          limite,
          totalPaginas: Math.ceil(total / limite)
        }
      });
    } catch (err) {
      console.error('Erro ao listar processos:', err);
      return res.status(500).json({ error: 'Falha ao listar processos' });
    }
  },

  /**
   * Listar processos disponíveis no marketplace (para compradores)
   */
  async listarMarketplace(req, res) {
    try {
      const usuarioId = req.userId;
      const {
        tipo, tribunal, fase, 
        valorMinimo, valorMaximo,
        expectativaRecebimento,
        pesquisa, ordenar
      } = req.query;
      
      const pagina = parseInt(req.query.pagina) || 1;
      const limite = parseInt(req.query.limite) || 20;
      const skip = (pagina - 1) * limite;

      // Verificar se o usuário é um comprador
      const usuario = await Usuario.findById(usuarioId);
      if (!usuario || usuario.tipo !== 'comprador') {
        return res.status(403).json({ error: 'Apenas compradores podem acessar o marketplace' });
      }

      // Construir o filtro base - apenas processos ativos
      const filtro = { status: 'ativo' };

      // Adicionar filtros adicionais se fornecidos
      if (tipo) {
        filtro.tipo = tipo;
      }

      if (tribunal) {
        filtro.tribunal = tribunal;
      }

      if (fase) {
        filtro.fase = fase;
      }

      if (expectativaRecebimento) {
        filtro.expectativaRecebimento = expectativaRecebimento;
      }

      // Filtro de valor estimado
      if (valorMinimo || valorMaximo) {
        filtro.valorEstimado = {};
        if (valorMinimo) filtro.valorEstimado.$gte = parseFloat(valorMinimo);
        if (valorMaximo) filtro.valorEstimado.$lte = parseFloat(valorMaximo);
      }

      // Filtro de pesquisa de texto
      if (pesquisa) {
        filtro.$or = [
          { numero: { $regex: pesquisa, $options: 'i' } },
          { descricao: { $regex: pesquisa, $options: 'i' } }
        ];
      }

      // Determinar ordenação
      let sort = { dataCadastro: -1 }; // Padrão: mais recentes primeiro
      if (ordenar === 'valorAsc') {
        sort = { valorEstimado: 1 };
      } else if (ordenar === 'valorDesc') {
        sort = { valorEstimado: -1 };
      } else if (ordenar === 'antigos') {
        sort = { dataCadastro: 1 };
      }

      // Contar total de processos para paginação
      const total = await Processo.countDocuments(filtro);

      // Buscar os processos
      const processos = await Processo.find(filtro)
        .select('-documentos') // Não enviar documentos na listagem
        .populate('usuario', 'nome') // Apenas o nome do vendedor
        .sort(sort)
        .skip(skip)
        .limit(limite);

      // Verificar para quais processos o usuário já fez ofertas
      const processosComStatus = await Promise.all(processos.map(async (processo) => {
        const minhaOferta = await Oferta.findOne({
          processo: processo._id,
          comprador: usuarioId,
          status: { $in: ['pendente', 'emNegociacao'] }
        });

        const processoObj = processo.toObject();
        processoObj.temMinhaOferta = !!minhaOferta;
        
        // Tratar informações confidenciais
        if (processo.isConfidencial) {
          processoObj.numero = processo.numero.replace(/\d{4}$/, 'XXXX');
          processoObj.vara = 'Confidencial';
          processoObj.cidade = 'Confidencial';
        }
        
        return processoObj;
      }));

      return res.json({
        processos: processosComStatus,
        paginacao: {
          total,
          pagina,
          limite,
          totalPaginas: Math.ceil(total / limite)
        }
      });
    } catch (err) {
      console.error('Erro ao listar marketplace:', err);
      return res.status(500).json({ error: 'Falha ao listar marketplace' });
    }
  },

  /**
   * Excluir um processo (apenas se não tiver ofertas)
   */
  async excluir(req, res) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const { id } = req.params;
      const usuarioId = req.userId;

      // Buscar o processo
      const processo = await Processo.findById(id).session(session);
      if (!processo) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({ error: 'Processo não encontrado' });
      }

      // Verificar se o usuário é o dono do processo
      if (processo.usuario.toString() !== usuarioId) {
        await session.abortTransaction();
        session.endSession();
        return res.status(403).json({ error: 'Você não tem permissão para excluir este processo' });
      }

      // Verificar se o processo tem ofertas
      const temOfertas = await Oferta.countDocuments({ processo: id }).session(session);
      if (temOfertas > 0) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ error: 'Não é possível excluir um processo que possui ofertas' });
      }

      // Verificar se o processo está em um estado que permite exclusão
      const statusPermitidos = ['pendente', 'emAnalise', 'rejeitado'];
      if (!statusPermitidos.includes(processo.status)) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ error: `Não é possível excluir um processo com status '${processo.status}'` });
      }

      // Remover os arquivos físicos dos documentos
      for (const documento of processo.documentos) {
        try {
          await unlinkAsync(documento.caminho);
        } catch (erro) {
          console.error(`Erro ao remover arquivo ${documento.caminho}:`, erro);
          // Continuar mesmo se um arquivo não puder ser removido
        }
      }

      // Excluir o processo
      await Processo.deleteOne({ _id: id }).session(session);

      await session.commitTransaction();
      session.endSession();

      return res.json({ message: 'Processo excluído com sucesso' });
    } catch (err) {
      await session.abortTransaction();
      session.endSession();
      console.error('Erro ao excluir processo:', err);
      return res.status(500).json({ error: 'Falha ao excluir processo' });
    }
  },

  /**
   * Validar um processo (para administradores)
   */
  async validarProcesso(req, res) {
    try {
      const { id } = req.params;
      const { acao, observacao } = req.body;
      const adminId = req.userId;

      // Verificar se o usuário é um administrador
      const admin = await Usuario.findById(adminId);
      if (!admin || admin.tipo !== 'admin') {
        return res.status(403).json({ error: 'Apenas administradores podem validar processos' });
      }

      // Verificar se a ação é válida
      if (acao !== 'aprovar' && acao !== 'rejeitar') {
        return res.status(400).json({ error: 'Ação inválida. Escolha entre aprovar ou rejeitar' });
      }

      // Buscar o processo
      const processo = await Processo.findById(id);
      if (!processo) {
        return res.status(404).json({ error: 'Processo não encontrado' });
      }

      // Verificar se o processo está em análise
      if (processo.status !== 'emAnalise') {
        return res.status(400).json({ error: `Não é possível validar um processo com status '${processo.status}'` });
      }

      // Atualizar o status do processo
      if (acao === 'aprovar') {
        processo.status = 'ativo';
        processo.historicoStatus.push({
          status: 'ativo',
          data: new Date(),
          observacao: observacao || 'Processo aprovado pela administração'
        });
      } else {
        processo.status = 'rejeitado';
        processo.historicoStatus.push({
          status: 'rejeitado',
          data: new Date(),
          observacao: observacao || 'Processo rejeitado pela administração'
        });
      }

      processo.dataAtualizacao = new Date();
      await processo.save();

      return res.json({
        processo,
        message: `Processo ${acao === 'aprovar' ? 'aprovado' : 'rejeitado'} com sucesso`
      });
    } catch (err) {
      console.error('Erro ao validar processo:', err);
      return res.status(500).json({ error: 'Falha ao validar processo' });
    }
},

// Métodos para DataJud
async buscarProcessoDatajud(req, res) {
  console.log('Rota de busca de processo chamada');
  console.log('Número do processo:', req.params.numeroProcesso);

  try {
    const { numeroProcesso } = req.params;
    
    // Log adicional
    console.log('Iniciando busca no serviço DataJud');
    
    const resultado = await DatajudService.buscarProcessoPorNumero(numeroProcesso);
    
    console.log('Resultado obtido:', resultado);
    
    return res.json(resultado);
  } catch (error) {
    console.error('Erro detalhado no controlador:', {
      message: error.message,
      stack: error.stack
    });
    
    return res.status(500).json({ 
      error: 'Não foi possível recuperar os dados do processo',
      detalhes: error.message 
    });
  }
},

  async buscarProcessosPorCPF(req, res) {
    try {
      const { cpf } = req.params;
      
      const processosEncontrados = await DatajudService.buscarProcessosPorCPF(cpf);
      
      return res.json({
        processos: processosEncontrados,
        fonte: 'DataJud'
      });
    } catch (error) {
      console.error('Erro ao buscar processos por CPF:', error);
      return res.status(500).json({ 
        error: 'Não foi possível recuperar os processos',
        detalhes: error.message 
      });
    }
  }
};