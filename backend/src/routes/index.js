/**
 * Configuração central de rotas da API
 * Agrupa todas as rotas da aplicação
 */

const express = require('express');
const router = express.Router();

// Controllers
const authController = require('../controllers/authController');
const processoController = require('../controllers/processoController');
const ofertaController = require('../controllers/ofertaController');
const transacaoController = require('../controllers/transacaoController');

// Middlewares
const authMiddleware = require('../middlewares/authMiddleware');
const uploadMiddleware = require('../middlewares/uploadMiddleware');

// Rotas públicas de autenticação
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);
router.post('/auth/refresh-token', authController.refreshToken);
router.post('/auth/forgot-password', authController.forgotPassword);
router.post('/auth/reset-password', authController.resetPassword);

// Rota de verificação de usuário
router.post('/auth/verificar/:id', authController.verificarUsuario);

// Middleware de autenticação para as rotas protegidas
router.use('/auth/me', authMiddleware);
router.use('/processos', authMiddleware);
router.use('/ofertas', authMiddleware);
router.use('/transacoes', authMiddleware);

// Rotas de usuário autenticado
router.get('/auth/me', authController.me);
router.put('/auth/me', authController.update);

// Rotas de processos
router.post('/processos', processoController.cadastrar);
router.get('/processos', processoController.listarMeusProcessos);
router.get('/processos/marketplace', processoController.listarMarketplace);
router.get('/processos/:id', processoController.obterDetalhes);
router.put('/processos/:id', processoController.atualizar);
router.delete('/processos/:id', processoController.excluir);
router.post('/processos/:id/documentos', uploadMiddleware.array('documentos', 10), processoController.adicionarDocumentos);
router.delete('/processos/:id/documentos/:documentoId', processoController.removerDocumento);
router.put('/processos/:id/validar', processoController.validarProcesso);

// Rotas de ofertas
router.post('/ofertas', ofertaController.criar);
router.get('/ofertas/recebidas', ofertaController.listarRecebidas);
router.get('/ofertas/enviadas', ofertaController.listarEnviadas);
router.get('/ofertas/:id', ofertaController.obterDetalhes);
router.post('/ofertas/:id/aceitar', ofertaController.aceitar);
router.post('/ofertas/:id/rejeitar', ofertaController.rejeitar);
router.post('/ofertas/:id/cancelar', ofertaController.cancelar);
router.post('/ofertas/:id/contraproposta', ofertaController.contraproposta);
router.post('/ofertas/:id/responder-contraproposta', ofertaController.responderContraproposta);

// Rotas de transações
router.post('/transacoes', transacaoController.iniciar);
router.get('/transacoes', transacaoController.listar);
router.get('/transacoes/:id', transacaoController.obterDetalhes);
router.post('/transacoes/:id/contrato', uploadMiddleware.array('documentos', 5), transacaoController.enviarContrato);
router.post('/transacoes/:id/pagamento', transacaoController.registrarPagamento);
router.post('/transacoes/:id/confirmar', transacaoController.confirmarRecebimento);
router.post('/transacoes/:id/cancelar', transacaoController.cancelar);

// Rota para verificar se a API está online
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

module.exports = router;