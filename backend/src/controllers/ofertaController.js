/**
 * Controller de ofertas
 * Gerencia todas as operações relacionadas às ofertas para processos judiciais
 */

const Oferta = require('../models/Oferta');
const Processo = require('../models/Processo');
const Usuario = require('../models/Usuario');
const mongoose = require('mongoose');

const ofertaController = {
  /**
   * Criar uma nova oferta para um processo
   */
  async criar(req, res) {
    try {
      const { processoId, valor, mensagem, condicoesEspeciais, dataValidade } = req.body;
      const compradorId = req.userId; // ID do usuário autenticado

      // Verificar se o processo existe
      const processo = await Processo.findById(processoId);
      if (!processo) {
        return res.status(404).json({ error: 'Processo não encontrado' });
      }

      // Verificar se o processo está disponível para ofertas
      if (processo.status !== 'ativo') {
        return res.status(400).json({ error: 'Este processo não está disponível para ofertas' });
      }

      // Verificar se o usuário é um comprador
      const comprador = await Usuario.findById(compradorId);
      if (!comprador || comprador.tipo !== 'comprador') {
        return res.status(403).json({ error: 'Apenas compradores podem fazer ofertas' });
      }

      // Verificar se o usuário já fez uma oferta ativa para este processo
      const ofertaExistente = await Oferta.findOne({
        processo: processoId,
        comprador: compradorId,
        status: { $in: ['pendente', 'emNegociacao'] }
      });

      if (ofertaExistente) {
        return res.status(400).json({ 
          error: 'Você já tem uma oferta ativa para este processo',
          ofertaId: ofertaExistente._id
        });
      }

      // Verificar se o valor da oferta é válido
      if (!valor || valor <= 0) {
        return res.status(400).json({ error: 'O valor da oferta deve ser maior que zero' });
      }

      // Criar a oferta
      const oferta = await Oferta.create({
        processo: processoId,
        vendedor: processo.usuario,
        comprador: compradorId,
        valor,
        mensagem,
        condicoesEspeciais,
        dataValidade: dataValidade || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 dias se não especificado
        status: 'pendente',
        dataCriacao: new Date(),
        historicoStatus: [{
          status: 'pendente',
          data: new Date(),
          observacao: 'Oferta criada'
        }]
      });

      // Atualizar o processo para indicar que tem ofertas
      if (!processo.temOfertas) {
        processo.temOfertas = true;
        await processo.save();
      }

      // Retornar a oferta criada
      return res.status(201).json({ oferta });
    } catch (err) {
      console.error('Erro ao criar oferta:', err);
      return res.status(500).json({ error: 'Falha ao criar oferta' });
    }
  },

  /**
   * Listar todas as ofertas recebidas (para vendedores)
   */
  async listarRecebidas(req, res) {
    try {
      const vendedorId = req.userId;
      const { status, processoId } = req.query;

      // Construir o filtro base
      const filtro = { vendedor: vendedorId };

      // Adicionar filtro de status se fornecido
      if (status) {
        filtro.status = status;
      }

      // Adicionar filtro de processo se fornecido
      if (processoId) {
        filtro.processo = processoId;
      }

      // Buscar as ofertas com os filtros aplicados
      const ofertas = await Oferta.find(filtro)
        .populate('processo', 'numero tipo valorEstimado')
        .populate('comprador', 'nome')
        .sort({ dataCriacao: -1 });

      return res.json({ ofertas });
    } catch (err) {
      console.error('Erro ao listar ofertas recebidas:', err);
      return res.status(500).json({ error: 'Falha ao listar ofertas recebidas' });
    }
  },

  /**
   * Listar todas as ofertas enviadas (para compradores)
   */
  async listarEnviadas(req, res) {
    try {
      const compradorId = req.userId;
      const { status, processoId } = req.query;

      // Construir o filtro base
      const filtro = { comprador: compradorId };

      // Adicionar filtro de status se fornecido
      if (status) {
        filtro.status = status;
      }

      // Adicionar filtro de processo se fornecido
      if (processoId) {
        filtro.processo = processoId;
      }

      // Buscar as ofertas com os filtros aplicados
      const ofertas = await Oferta.find(filtro)
        .populate('processo', 'numero tipo valorEstimado')
        .populate('vendedor', 'nome')
        .sort({ dataCriacao: -1 });

      return res.json({ ofertas });
    } catch (err) {
      console.error('Erro ao listar ofertas enviadas:', err);
      return res.status(500).json({ error: 'Falha ao listar ofertas enviadas' });
    }
  },

  /**
   * Obter detalhes de uma oferta específica
   */
  async obterDetalhes(req, res) {
    try {
      const { id } = req.params;
      const usuarioId = req.userId;

      // Verificar se a oferta existe
      const oferta = await Oferta.findById(id)
        .populate('processo')
        .populate('vendedor', 'nome email telefone')
        .populate('comprador', 'nome email telefone');

      if (!oferta) {
        return res.status(404).json({ error: 'Oferta não encontrada' });
      }

      // Verificar se o usuário tem permissão para ver esta oferta
      if (oferta.vendedor._id.toString() !== usuarioId && 
          oferta.comprador._id.toString() !== usuarioId) {
        return res.status(403).json({ error: 'Você não tem permissão para acessar esta oferta' });
      }

      return res.json({ oferta });
    } catch (err) {
      console.error('Erro ao obter detalhes da oferta:', err);
      return res.status(500).json({ error: 'Falha ao obter detalhes da oferta' });
    }
  },

  /**
   * Aceitar uma oferta (para vendedores)
   */
  async aceitar(req, res) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const { id } = req.params;
      const vendedorId = req.userId;
      const { observacao } = req.body;

      // Buscar a oferta no banco de dados
      const oferta = await Oferta.findById(id).session(session);
      
      if (!oferta) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({ error: 'Oferta não encontrada' });
      }

      // Verificar se o usuário é o vendedor
      if (oferta.vendedor.toString() !== vendedorId) {
        await session.abortTransaction();
        session.endSession();
        return res.status(403).json({ error: 'Apenas o vendedor pode aceitar a oferta' });
      }

      // Verificar se a oferta está pendente
      if (oferta.status !== 'pendente' && oferta.status !== 'emNegociacao') {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ error: `Não é possível aceitar uma oferta com status '${oferta.status}'` });
      }

      // Atualizar o status da oferta
      oferta.status = 'aceita';
      oferta.historicoStatus.push({
        status: 'aceita',
        data: new Date(),
        observacao: observacao || 'Oferta aceita pelo vendedor'
      });
      await oferta.save({ session });

      // Atualizar o status do processo
      const processo = await Processo.findById(oferta.processo).session(session);
      processo.status = 'ofertaAceita';
      processo.ofertaAceita = oferta._id;
      await processo.save({ session });

      // Rejeitar todas as outras ofertas para este processo
      await Oferta.updateMany(
        { 
          processo: oferta.processo, 
          _id: { $ne: oferta._id },
          status: { $in: ['pendente', 'emNegociacao'] }
        },
        { 
          status: 'rejeitada',
          $push: { 
            historicoStatus: {
              status: 'rejeitada',
              data: new Date(),
              observacao: 'Rejeitada automaticamente devido à aceitação de outra oferta'
            }
          }
        },
        { session }
      );

      await session.commitTransaction();
      session.endSession();

      // Retornar a oferta atualizada
      return res.json({ 
        oferta,
        message: 'Oferta aceita com sucesso. O próximo passo é a formalização do contrato.'
      });
    } catch (err) {
      await session.abortTransaction();
      session.endSession();
      console.error('Erro ao aceitar oferta:', err);
      return res.status(500).json({ error: 'Falha ao aceitar oferta' });
    }
  },

  /**
   * Rejeitar uma oferta (para vendedores)
   */
  async rejeitar(req, res) {
    try {
      const { id } = req.params;
      const vendedorId = req.userId;
      const { motivo } = req.body;

      // Buscar a oferta no banco de dados
      const oferta = await Oferta.findById(id);
      
      if (!oferta) {
        return res.status(404).json({ error: 'Oferta não encontrada' });
      }

      // Verificar se o usuário é o vendedor
      if (oferta.vendedor.toString() !== vendedorId) {
        return res.status(403).json({ error: 'Apenas o vendedor pode rejeitar a oferta' });
      }

      // Verificar se a oferta está pendente ou em negociação
      if (oferta.status !== 'pendente' && oferta.status !== 'emNegociacao') {
        return res.status(400).json({ error: `Não é possível rejeitar uma oferta com status '${oferta.status}'` });
      }

      // Atualizar o status da oferta
      oferta.status = 'rejeitada';
      oferta.historicoStatus.push({
        status: 'rejeitada',
        data: new Date(),
        observacao: motivo || 'Oferta rejeitada pelo vendedor'
      });
      await oferta.save();

      // Verificar se existem outras ofertas para o processo
      const outrasOfertas = await Oferta.countDocuments({
        processo: oferta.processo,
        status: { $in: ['pendente', 'emNegociacao'] }
      });

      // Se não houver outras ofertas, atualizar o flag temOfertas do processo
      if (outrasOfertas === 0) {
        const processo = await Processo.findById(oferta.processo);
        if (processo && processo.temOfertas) {
          processo.temOfertas = false;
          await processo.save();
        }
      }

      return res.json({ 
        oferta,
        message: 'Oferta rejeitada com sucesso'
      });
    } catch (err) {
      console.error('Erro ao rejeitar oferta:', err);
      return res.status(500).json({ error: 'Falha ao rejeitar oferta' });
    }
  },

  /**
   * Cancelar uma oferta (para compradores)
   */
  async cancelar(req, res) {
    try {
      const { id } = req.params;
      const compradorId = req.userId;
      const { motivo } = req.body;

      // Buscar a oferta no banco de dados
      const oferta = await Oferta.findById(id);
      
      if (!oferta) {
        return res.status(404).json({ error: 'Oferta não encontrada' });
      }

      // Verificar se o usuário é o comprador
      if (oferta.comprador.toString() !== compradorId) {
        return res.status(403).json({ error: 'Apenas o comprador pode cancelar a oferta' });
      }

      // Verificar se a oferta está pendente ou em negociação
      if (oferta.status !== 'pendente' && oferta.status !== 'emNegociacao') {
        return res.status(400).json({ error: `Não é possível cancelar uma oferta com status '${oferta.status}'` });
      }

      // Atualizar o status da oferta
      oferta.status = 'cancelada';
      oferta.historicoStatus.push({
        status: 'cancelada',
        data: new Date(),
        observacao: motivo || 'Oferta cancelada pelo comprador'
      });
      await oferta.save();

      // Verificar se existem outras ofertas para o processo
      const outrasOfertas = await Oferta.countDocuments({
        processo: oferta.processo,
        status: { $in: ['pendente', 'emNegociacao'] }
      });

      // Se não houver outras ofertas, atualizar o flag temOfertas do processo
      if (outrasOfertas === 0) {
        const processo = await Processo.findById(oferta.processo);
        if (processo && processo.temOfertas) {
          processo.temOfertas = false;
          await processo.save();
        }
      }

      return res.json({ 
        oferta,
        message: 'Oferta cancelada com sucesso'
      });
    } catch (err) {
      console.error('Erro ao cancelar oferta:', err);
      return res.status(500).json({ error: 'Falha ao cancelar oferta' });
    }
  },

  /**
   * Fazer contraproposta (para vendedores)
   */
  async contraproposta(req, res) {
    try {
      const { id } = req.params;
      const vendedorId = req.userId;
      const { valor, mensagem, condicoesEspeciais, dataValidade } = req.body;

      // Buscar a oferta no banco de dados
      const oferta = await Oferta.findById(id);
      
      if (!oferta) {
        return res.status(404).json({ error: 'Oferta não encontrada' });
      }

      // Verificar se o usuário é o vendedor
      if (oferta.vendedor.toString() !== vendedorId) {
        return res.status(403).json({ error: 'Apenas o vendedor pode fazer uma contraproposta' });
      }

      // Verificar se a oferta está pendente
      if (oferta.status !== 'pendente' && oferta.status !== 'emNegociacao') {
        return res.status(400).json({ error: `Não é possível fazer contraproposta para uma oferta com status '${oferta.status}'` });
      }

      // Verificar se o valor da contraproposta é válido
      if (!valor || valor <= 0) {
        return res.status(400).json({ error: 'O valor da contraproposta deve ser maior que zero' });
      }

      // Salvar a oferta anterior no histórico de negociação
      oferta.historicoNegociacao = oferta.historicoNegociacao || [];
      oferta.historicoNegociacao.push({
        tipo: 'oferta',
        valor: oferta.valor,
        mensagem: oferta.mensagem,
        condicoesEspeciais: oferta.condicoesEspeciais,
        data: oferta.dataAtualizacao || oferta.dataCriacao
      });

      // Atualizar a oferta com a contraproposta
      oferta.valor = valor;
      oferta.mensagem = mensagem || oferta.mensagem;
      oferta.condicoesEspeciais = condicoesEspeciais || oferta.condicoesEspeciais;
      if (dataValidade) {
        oferta.dataValidade = dataValidade;
      }
      
      oferta.status = 'emNegociacao';
      oferta.dataAtualizacao = new Date();
      
      oferta.historicoStatus.push({
        status: 'emNegociacao',
        data: new Date(),
        observacao: 'Contraproposta feita pelo vendedor'
      });
      
      oferta.historicoNegociacao.push({
        tipo: 'contraproposta',
        valor,
        mensagem,
        condicoesEspeciais,
        data: new Date()
      });

      await oferta.save();

      return res.json({ 
        oferta,
        message: 'Contraproposta enviada com sucesso'
      });
    } catch (err) {
      console.error('Erro ao fazer contraproposta:', err);
      return res.status(500).json({ error: 'Falha ao fazer contraproposta' });
    }
  },

  /**
   * Responder à contraproposta (para compradores)
   */
  async responderContraproposta(req, res) {
    try {
      const { id } = req.params;
      const compradorId = req.userId;
      const { acao, valor, mensagem, condicoesEspeciais, dataValidade } = req.body;

      // Verificar se a ação é válida
      if (acao !== 'aceitar' && acao !== 'recusar' && acao !== 'contrapropor') {
        return res.status(400).json({ error: 'Ação inválida. Escolha entre aceitar, recusar ou contrapropor' });
      }

      // Buscar a oferta no banco de dados
      const oferta = await Oferta.findById(id);
      
      if (!oferta) {
        return res.status(404).json({ error: 'Oferta não encontrada' });
      }

      // Verificar se o usuário é o comprador
      if (oferta.comprador.toString() !== compradorId) {
        return res.status(403).json({ error: 'Apenas o comprador pode responder à contraproposta' });
      }

      // Verificar se a oferta está em negociação
      if (oferta.status !== 'emNegociacao') {
        return res.status(400).json({ error: `Não é possível responder a uma oferta com status '${oferta.status}'` });
      }

      // Processar de acordo com a ação escolhida
      if (acao === 'aceitar') {
        // Aceitar a contraproposta
        oferta.status = 'pendente';
        oferta.historicoStatus.push({
          status: 'pendente',
          data: new Date(),
          observacao: 'Contraproposta aceita pelo comprador'
        });
        
        oferta.historicoNegociacao = oferta.historicoNegociacao || [];
        oferta.historicoNegociacao.push({
          tipo: 'aceitacao',
          valor: oferta.valor,
          mensagem: mensagem || 'Contraproposta aceita',
          data: new Date()
        });
        
        oferta.dataAtualizacao = new Date();
        await oferta.save();

        return res.json({ 
          oferta,
          message: 'Contraproposta aceita com sucesso. Aguardando confirmação final do vendedor.'
        });
      } else if (acao === 'recusar') {
        // Recusar a contraproposta e cancelar a oferta
        oferta.status = 'cancelada';
        oferta.historicoStatus.push({
          status: 'cancelada',
          data: new Date(),
          observacao: mensagem || 'Contraproposta recusada pelo comprador'
        });
        
        oferta.historicoNegociacao = oferta.historicoNegociacao || [];
        oferta.historicoNegociacao.push({
          tipo: 'recusa',
          mensagem: mensagem || 'Contraproposta recusada',
          data: new Date()
        });
        
        oferta.dataAtualizacao = new Date();
        await oferta.save();

        // Verificar se existem outras ofertas para o processo
        const outrasOfertas = await Oferta.countDocuments({
          processo: oferta.processo,
          status: { $in: ['pendente', 'emNegociacao'] }
        });

        // Se não houver outras ofertas, atualizar o flag temOfertas do processo
        if (outrasOfertas === 0) {
          const processo = await Processo.findById(oferta.processo);
          if (processo && processo.temOfertas) {
            processo.temOfertas = false;
            await processo.save();
          }
        }

        return res.json({ 
          oferta,
          message: 'Contraproposta recusada e oferta cancelada'
        });
      } else if (acao === 'contrapropor') {
        // Verificar se foram fornecidos os dados necessários
        if (!valor || valor <= 0) {
          return res.status(400).json({ error: 'O valor da contraproposta deve ser maior que zero' });
        }

        // Salvar a oferta anterior no histórico de negociação
        oferta.historicoNegociacao = oferta.historicoNegociacao || [];
        oferta.historicoNegociacao.push({
          tipo: 'contraproposta',
          valor: oferta.valor,
          mensagem: oferta.mensagem,
          condicoesEspeciais: oferta.condicoesEspeciais,
          data: oferta.dataAtualizacao || oferta.dataCriacao
        });

        // Atualizar a oferta com a nova contraproposta
        oferta.valor = valor;
        oferta.mensagem = mensagem || oferta.mensagem;
        oferta.condicoesEspeciais = condicoesEspeciais || oferta.condicoesEspeciais;
        if (dataValidade) {
          oferta.dataValidade = dataValidade;
        }
        
        oferta.status = 'emNegociacao';
        oferta.dataAtualizacao = new Date();
        
        oferta.historicoStatus.push({
          status: 'emNegociacao',
          data: new Date(),
          observacao: 'Nova contraproposta feita pelo comprador'
        });
        
        oferta.historicoNegociacao.push({
          tipo: 'contraproposta',
          valor,
          mensagem,
          condicoesEspeciais,
          data: new Date()
        });

        await oferta.save();

        return res.json({ 
          oferta,
          message: 'Nova contraproposta enviada com sucesso'
        });
      }
    } catch (err) {
      console.error('Erro ao responder contraproposta:', err);
      return res.status(500).json({ error: 'Falha ao responder contraproposta' });
    }
  }
};

module.exports = ofertaController;