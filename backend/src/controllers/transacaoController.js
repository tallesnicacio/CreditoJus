/**
 * Controller de transações
 * Gerencia todas as operações relacionadas às transações de compra e venda de créditos
 */

const Transacao = require('../models/Transacao');
const Oferta = require('../models/Oferta');
const Processo = require('../models/Processo');
const Usuario = require('../models/Usuario');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const unlinkAsync = promisify(fs.unlink);

const transacaoController = {
  /**
   * Iniciar uma transação a partir de uma oferta aceita
   */
  async iniciar(req, res) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const { ofertaId } = req.body;
      const usuarioId = req.userId;

      // Buscar a oferta
      const oferta = await Oferta.findById(ofertaId).session(session)
        .populate('processo')
        .populate('vendedor')
        .populate('comprador');

      if (!oferta) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({ error: 'Oferta não encontrada' });
      }

      // Verificar se o usuário é o vendedor ou o comprador
      if (oferta.vendedor._id.toString() !== usuarioId && oferta.comprador._id.toString() !== usuarioId) {
        await session.abortTransaction();
        session.endSession();
        return res.status(403).json({ error: 'Você não tem permissão para iniciar esta transação' });
      }

      // Verificar se a oferta está aceita
      if (oferta.status !== 'aceita') {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ error: 'Apenas ofertas aceitas podem iniciar uma transação' });
      }

      // Verificar se já existe uma transação para esta oferta
      const transacaoExistente = await Transacao.findOne({ oferta: ofertaId }).session(session);
      if (transacaoExistente) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ 
          error: 'Já existe uma transação iniciada para esta oferta',
          transacaoId: transacaoExistente._id
        });
      }

      // Determinar comissão da plataforma (exemplo: 5% do valor da oferta)
      const taxaComissao = 0.05;
      const valorComissao = oferta.valor * taxaComissao;
      const valorLiquido = oferta.valor - valorComissao;

      // Criar a transação
      const transacao = await Transacao.create([{
        oferta: ofertaId,
        processo: oferta.processo._id,
        vendedor: oferta.vendedor._id,
        comprador: oferta.comprador._id,
        valor: oferta.valor,
        comissao: valorComissao,
        valorLiquido,
        status: 'iniciada',
        dataCriacao: new Date(),
        historicoStatus: [{
          status: 'iniciada',
          data: new Date(),
          observacao: 'Transação iniciada'
        }],
        documentos: []
      }], { session });

      // Atualizar status da oferta
      oferta.status = 'emTransacao';
      oferta.historicoStatus.push({
        status: 'emTransacao',
        data: new Date(),
        observacao: 'Oferta entrou em fase de transação'
      });
      await oferta.save({ session });

      // Atualizar status do processo
      oferta.processo.status = 'emTransacao';
      oferta.processo.historicoStatus.push({
        status: 'emTransacao',
        data: new Date(),
        observacao: 'Processo em fase de transação'
      });
      await oferta.processo.save({ session });

      await session.commitTransaction();
      session.endSession();

      return res.status(201).json({
        transacao: transacao[0],
        message: 'Transação iniciada com sucesso'
      });
    } catch (err) {
      await session.abortTransaction();
      session.endSession();
      console.error('Erro ao iniciar transação:', err);
      return res.status(500).json({ error: 'Falha ao iniciar transação' });
    }
  },

  /**
   * Enviar contrato de cessão de crédito assinado
   */
  async enviarContrato(req, res) {
    try {
      const { id } = req.params;
      const usuarioId = req.userId;

      // Verificar se existem arquivos no upload
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: 'Nenhum documento enviado' });
      }

      // Buscar a transação
      const transacao = await Transacao.findById(id)
        .populate('vendedor')
        .populate('comprador');

      if (!transacao) {
        // Remover os arquivos enviados, já que a transação não existe
        for (const file of req.files) {
          await unlinkAsync(file.path);
        }
        return res.status(404).json({ error: 'Transação não encontrada' });
      }

      // Verificar se o usuário é o vendedor ou o comprador
      if (transacao.vendedor._id.toString() !== usuarioId && transacao.comprador._id.toString() !== usuarioId) {
        // Remover os arquivos enviados, já que o usuário não tem permissão
        for (const file of req.files) {
          await unlinkAsync(file.path);
        }
        return res.status(403).json({ error: 'Você não tem permissão para enviar documentos para esta transação' });
      }

      // Verificar se a transação está em um status que permite envio de documentos
      const statusPermitidos = ['iniciada', 'contratoEnviado', 'contratoAssinado', 'aguardandoPagamento'];
      if (!statusPermitidos.includes(transacao.status)) {
        // Remover os arquivos enviados, já que o status não permite
        for (const file of req.files) {
          await unlinkAsync(file.path);
        }
        return res.status(400).json({ error: `Não é possível enviar documentos para uma transação com status '${transacao.status}'` });
      }

      // Determinar se é o vendedor ou comprador enviando
      const isVendedor = transacao.vendedor._id.toString() === usuarioId;
      const tipoParte = isVendedor ? 'vendedor' : 'comprador';

      // Adicionar os documentos à transação
      const novosDocumentos = req.files.map(file => ({
        nome: file.originalname,
        tipo: file.mimetype,
        caminho: file.path,
        tamanho: file.size,
        dataUpload: new Date(),
        enviadoPor: tipoParte
      }));

      transacao.documentos.push(...novosDocumentos);

      // Atualizar status da transação conforme necessário
      if (transacao.status === 'iniciada') {
        transacao.status = 'contratoEnviado';
        transacao.historicoStatus.push({
          status: 'contratoEnviado',
          data: new Date(),
          observacao: `Contrato enviado pelo ${tipoParte}`
        });
      } else if (
        transacao.status === 'contratoEnviado' && 
        (
          (isVendedor && transacao.documentos.some(doc => doc.enviadoPor === 'comprador')) ||
          (!isVendedor && transacao.documentos.some(doc => doc.enviadoPor === 'vendedor'))
        )
      ) {
        // Se ambas as partes enviaram documentos, mudar para contratoAssinado
        transacao.status = 'contratoAssinado';
        transacao.historicoStatus.push({
          status: 'contratoAssinado',
          data: new Date(),
          observacao: 'Contrato assinado por ambas as partes'
        });
      }

      await transacao.save();

      return res.json({
        transacao,
        message: 'Documentos enviados com sucesso'
      });
    } catch (err) {
      console.error('Erro ao enviar contrato:', err);
      return res.status(500).json({ error: 'Falha ao enviar contrato' });
    }
  },
  /**
   * Registrar pagamento (para o comprador)
   */
  async registrarPagamento(req, res) {
    try {
      const { id } = req.params;
      const { comprovante, observacao } = req.body;
      const compradorId = req.userId;

      // Verificar se existe comprovante
      if (!comprovante) {
        return res.status(400).json({ error: 'Comprovante de pagamento é obrigatório' });
      }

      // Buscar a transação
      const transacao = await Transacao.findById(id)
        .populate('comprador');

      if (!transacao) {
        return res.status(404).json({ error: 'Transação não encontrada' });
      }

      // Verificar se o usuário é o comprador
      if (transacao.comprador._id.toString() !== compradorId) {
        return res.status(403).json({ error: 'Apenas o comprador pode registrar pagamento' });
      }

      // Verificar se a transação está em um status que permite pagamento
      const statusPermitidos = ['contratoAssinado', 'aguardandoPagamento'];
      if (!statusPermitidos.includes(transacao.status)) {
        return res.status(400).json({ error: `Não é possível registrar pagamento para uma transação com status '${transacao.status}'` });
      }

      // Registrar o pagamento
      transacao.comprovantePagamento = comprovante;
      transacao.observacaoPagamento = observacao;
      transacao.dataPagamento = new Date();
      transacao.status = 'pagamentoRegistrado';
      transacao.historicoStatus.push({
        status: 'pagamentoRegistrado',
        data: new Date(),
        observacao: 'Pagamento registrado pelo comprador'
      });

      await transacao.save();

      return res.json({
        transacao,
        message: 'Pagamento registrado com sucesso. Aguardando confirmação do vendedor.'
      });
    } catch (err) {
      console.error('Erro ao registrar pagamento:', err);
      return res.status(500).json({ error: 'Falha ao registrar pagamento' });
    }
  },

  /**
   * Confirmar recebimento de pagamento (para o vendedor)
   */
  async confirmarRecebimento(req, res) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const { id } = req.params;
      const { observacao } = req.body;
      const vendedorId = req.userId;

      // Buscar a transação
      const transacao = await Transacao.findById(id).session(session)
        .populate('oferta')
        .populate('processo')
        .populate('vendedor');

      if (!transacao) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({ error: 'Transação não encontrada' });
      }

      // Verificar se o usuário é o vendedor
      if (transacao.vendedor._id.toString() !== vendedorId) {
        await session.abortTransaction();
        session.endSession();
        return res.status(403).json({ error: 'Apenas o vendedor pode confirmar recebimento' });
      }

      // Verificar se a transação está no status correto
      if (transacao.status !== 'pagamentoRegistrado') {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ error: `Não é possível confirmar recebimento para uma transação com status '${transacao.status}'` });
      }

      // Confirmar o recebimento
      transacao.status = 'concluida';
      transacao.dataConclusao = new Date();
      transacao.historicoStatus.push({
        status: 'concluida',
        data: new Date(),
        observacao: observacao || 'Recebimento confirmado pelo vendedor'
      });

      await transacao.save({ session });

      // Atualizar status da oferta
      await Oferta.findByIdAndUpdate(transacao.oferta._id, {
        status: 'concluida',
        $push: {
          historicoStatus: {
            status: 'concluida',
            data: new Date(),
            observacao: 'Transação concluída com sucesso'
          }
        }
      }, { session });

      // Atualizar status do processo
      await Processo.findByIdAndUpdate(transacao.processo._id, {
        status: 'vendido',
        $push: {
          historicoStatus: {
            status: 'vendido',
            data: new Date(),
            observacao: 'Processo vendido com sucesso'
          }
        }
      }, { session });

      await session.commitTransaction();
      session.endSession();

      return res.json({
        transacao,
        message: 'Recebimento confirmado com sucesso. Transação concluída!'
      });
    } catch (err) {
      await session.abortTransaction();
      session.endSession();
      console.error('Erro ao confirmar recebimento:', err);
      return res.status(500).json({ error: 'Falha ao confirmar recebimento' });
    }
  },

  /**
   * Cancelar uma transação
   */
  async cancelar(req, res) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const { id } = req.params;
      const { motivo } = req.body;
      const usuarioId = req.userId;

      // Verificar se o motivo foi fornecido
      if (!motivo) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ error: 'Motivo do cancelamento é obrigatório' });
      }

      // Buscar a transação
      const transacao = await Transacao.findById(id).session(session)
        .populate('oferta')
        .populate('processo')
        .populate('vendedor')
        .populate('comprador');

      if (!transacao) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({ error: 'Transação não encontrada' });
      }

      // Verificar se o usuário é o vendedor ou o comprador
      if (transacao.vendedor._id.toString() !== usuarioId && transacao.comprador._id.toString() !== usuarioId) {
        await session.abortTransaction();
        session.endSession();
        return res.status(403).json({ error: 'Você não tem permissão para cancelar esta transação' });
      }

      // Verificar se a transação está em um status que permite cancelamento
      const statusPermitidos = ['iniciada', 'contratoEnviado', 'contratoAssinado', 'aguardandoPagamento'];
      if (!statusPermitidos.includes(transacao.status)) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ error: `Não é possível cancelar uma transação com status '${transacao.status}'` });
      }

      // Determinar quem está cancelando
      const tipoParte = transacao.vendedor._id.toString() === usuarioId ? 'vendedor' : 'comprador';

      // Cancelar a transação
      transacao.status = 'cancelada';
      transacao.motivoCancelamento = motivo;
      transacao.canceladoPor = tipoParte;
      transacao.dataCancelamento = new Date();
      transacao.historicoStatus.push({
        status: 'cancelada',
        data: new Date(),
        observacao: `Transação cancelada pelo ${tipoParte}: ${motivo}`
      });

      await transacao.save({ session });

      // Atualizar status da oferta
      await Oferta.findByIdAndUpdate(transacao.oferta._id, {
        status: 'cancelada',
        $push: {
          historicoStatus: {
            status: 'cancelada',
            data: new Date(),
            observacao: `Transação cancelada pelo ${tipoParte}: ${motivo}`
          }
        }
      }, { session });

      // Atualizar status do processo para ativo novamente
      await Processo.findByIdAndUpdate(transacao.processo._id, {
        status: 'ativo',
        ofertaAceita: null,
        $push: {
          historicoStatus: {
            status: 'ativo',
            data: new Date(),
            observacao: 'Processo reativado após cancelamento de transação'
          }
        }
      }, { session });

      await session.commitTransaction();
      session.endSession();

      return res.json({
        transacao,
        message: 'Transação cancelada com sucesso'
      });
    } catch (err) {
      await session.abortTransaction();
      session.endSession();
      console.error('Erro ao cancelar transação:', err);
      return res.status(500).json({ error: 'Falha ao cancelar transação' });
    }
  },

  /**
   * Obter detalhes de uma transação
   */
  async obterDetalhes(req, res) {
    try {
      const { id } = req.params;
      const usuarioId = req.userId;

      // Buscar a transação
      const transacao = await Transacao.findById(id)
        .populate('oferta')
        .populate({
          path: 'processo',
          select: 'numero tipo valorEstimado tribunal fase descricao'
        })
        .populate('vendedor', 'nome email telefone')
        .populate('comprador', 'nome email telefone');

      if (!transacao) {
        return res.status(404).json({ error: 'Transação não encontrada' });
      }

      // Verificar se o usuário é o vendedor, o comprador ou um administrador
      const isAdmin = await Usuario.exists({ _id: usuarioId, tipo: 'admin' });
      
      if (transacao.vendedor._id.toString() !== usuarioId && 
          transacao.comprador._id.toString() !== usuarioId && 
          !isAdmin) {
        return res.status(403).json({ error: 'Você não tem permissão para acessar esta transação' });
      }

      return res.json({ transacao });
    } catch (err) {
      console.error('Erro ao obter detalhes da transação:', err);
      return res.status(500).json({ error: 'Falha ao obter detalhes da transação' });
    }
  },

  /**
   * Listar transações do usuário
   */
  async listar(req, res) {
    try {
      const usuarioId = req.userId;
      const { status, ordenar } = req.query;
      const pagina = parseInt(req.query.pagina) || 1;
      const limite = parseInt(req.query.limite) || 10;
      const skip = (pagina - 1) * limite;

      // Construir o filtro base
      const filtro = {
        $or: [
          { vendedor: usuarioId },
          { comprador: usuarioId }
        ]
      };

      // Adicionar filtro de status se fornecido
      if (status) {
        filtro.status = status;
      }

      // Determinar ordenação
      let sort = { dataCriacao: -1 }; // Padrão: mais recentes primeiro
      if (ordenar === 'valorAsc') {
        sort = { valor: 1 };
      } else if (ordenar === 'valorDesc') {
        sort = { valor: -1 };
      } else if (ordenar === 'antigas') {
        sort = { dataCriacao: 1 };
      }

      // Contar total de transações para paginação
      const total = await Transacao.countDocuments(filtro);

      // Buscar as transações
      const transacoes = await Transacao.find(filtro)
        .populate({
          path: 'processo',
          select: 'numero tipo valorEstimado'
        })
        .populate('vendedor', 'nome')
        .populate('comprador', 'nome')
        .sort(sort)
        .skip(skip)
        .limit(limite);

      // Determinar para cada transação se o usuário é o vendedor ou comprador
      const transacoesProcessadas = transacoes.map(transacao => {
        const transacaoObj = transacao.toObject();
        transacaoObj.isVendedor = transacao.vendedor._id.toString() === usuarioId;
        return transacaoObj;
      });

      return res.json({
        transacoes: transacoesProcessadas,
        paginacao: {
          total,
          pagina,
          limite,
          totalPaginas: Math.ceil(total / limite)
        }
      });
    } catch (err) {
      console.error('Erro ao listar transações:', err);
      return res.status(500).json({ error: 'Falha ao listar transações' });
    }
  }
};

module.exports = transacaoController;