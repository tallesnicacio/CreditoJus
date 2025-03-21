import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Sidebar from '../components/Sidebar';
import { transacaoService, processoService } from '../services/api';
import { 
  formatarMoeda, 
  formatarData, 
  formatarStatusTransacao,
  formatarCpfCnpj 
} from '../utils/formatters';

const TransacoesDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [transacao, setTransacao] = useState(null);
  const [processo, setProcesso] = useState(null);

  useEffect(() => {
    carregarDetalhesTransacao();
  }, [id]);

  const carregarDetalhesTransacao = async () => {
    try {
      setLoading(true);
      // Buscar detalhes da transação
      const transacaoResponse = await transacaoService.buscarPorId(id);
      setTransacao(transacaoResponse);

      // Buscar detalhes completos do processo
      const processoResponse = await processoService.buscarDetalhes(transacaoResponse.processo._id);
      setProcesso(processoResponse);
    } catch (error) {
      console.error('Erro ao carregar detalhes da transação:', error);
      navigate('/transacoes');
    } finally {
      setLoading(false);
    }
  };

  const handleAcaoTransacao = async (acao) => {
    try {
      setLoading(true);
      await transacaoService.atualizarStatus(id, acao);
      await carregarDetalhesTransacao();
    } catch (error) {
      console.error(`Erro ao ${acao} transação:`, error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-100">
        <Sidebar />
        <div className="flex-1 flex justify-center items-center">
          <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      </div>
    );
  }

  if (!transacao) {
    return (
      <div className="flex h-screen bg-gray-100">
        <Sidebar />
        <div className="flex-1 flex justify-center items-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Transação não encontrada
            </h2>
            <button
              onClick={() => navigate('/transacoes')}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Voltar para Transações
            </button>
          </div>
        </div>
      </div>
    );
  }

  const statusFormatado = formatarStatusTransacao(transacao.status);

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">
              Detalhes da Transação
            </h1>
            <span className={`px-3 py-1 rounded text-sm font-semibold ${statusFormatado.color} ${statusFormatado.textColor}`}>
              {statusFormatado.label}
            </span>
          </div>

          {/* Informações Principais da Transação */}
          <div className="bg-white rounded-lg shadow mb-6">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800">
                Detalhes Gerais
              </h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6 p-6">
              <div>
                <p className="text-sm text-gray-500 mb-1">Número do Processo</p>
                <p className="text-gray-900 font-medium">
                  {transacao.processo.numero}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Valor da Transação</p>
                <p className="text-gray-900 font-medium text-xl">
                  {formatarMoeda(transacao.valor)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Data de Início</p>
                <p className="text-gray-900 font-medium">
                  {formatarData(transacao.dataCriacao)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">
                  {user.tipo === 'vendedor' ? 'Comprador' : 'Vendedor'}
                </p>
                <p className="text-gray-900 font-medium">
                  {user.tipo === 'vendedor' 
                    ? transacao.comprador.nome 
                    : transacao.vendedor.nome}
                </p>
                <p className="text-sm text-gray-500">
                  {user.tipo === 'vendedor' 
                    ? transacao.comprador.email 
                    : transacao.vendedor.email}
                </p>
              </div>
            </div>
          </div>

          {/* Detalhes do Processo */}
          {processo && (
            <div className="bg-white rounded-lg shadow mb-6">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800">
                  Informações do Processo
                </h2>
              </div>
              <div className="grid md:grid-cols-2 gap-6 p-6">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Tipo de Processo</p>
                  <p className="text-gray-900 font-medium">
                    {processo.tipo}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Tribunal</p>
                  <p className="text-gray-900 font-medium">
                    {processo.tribunal}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Vara</p>
                  <p className="text-gray-900 font-medium">
                    {processo.vara}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Comarca</p>
                  <p className="text-gray-900 font-medium">
                    {processo.comarca}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Ações da Transação */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800">
                Ações da Transação
              </h2>
            </div>
            <div className="p-6 flex space-x-4">
              {transacao.status === 'iniciada' && (
                <>
                  <button
                    onClick={() => handleAcaoTransacao('documentacao')}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Iniciar Documentação
                  </button>
                  <button
                    onClick={() => handleAcaoTransacao('cancelada')}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Cancelar Transação
                  </button>
                </>
              )}
              {transacao.status === 'documentacao' && (
                <>
                  <button
                    onClick={() => handleAcaoTransacao('pagamento')}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Documentação Concluída
                  </button>
                  <button
                    onClick={() => handleAcaoTransacao('iniciada')}
                    className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                  >
                    Voltar para Iniciada
                  </button>
                </>
              )}
              {transacao.status === 'pagamento' && (
                <>
                  <button
                    onClick={() => handleAcaoTransacao('transferencia')}
                    className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                  >
                    Confirmar Pagamento
                  </button>
                  <button
                    onClick={() => handleAcaoTransacao('documentacao')}
                    className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                  >
                    Voltar para Documentação
                  </button>
                </>
              )}
              {transacao.status === 'transferencia' && (
                <>
                  <button
                    onClick={() => handleAcaoTransacao('concluida')}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Concluir Transação
                  </button>
                  <button
                    onClick={() => handleAcaoTransacao('pagamento')}
                    className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                  >
                    Voltar para Pagamento
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Botão para voltar */}
          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/transacoes')}
              className="px-6 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
            >
              Voltar para Transações
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransacoesDetails;