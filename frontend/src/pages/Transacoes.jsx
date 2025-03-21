import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Sidebar from '../components/Sidebar';
import { transacaoService } from '../services/api';
import { formatarMoeda, formatarData, formatarStatusTransacao } from '../utils/formatters';

const Transacoes = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [transacoes, setTransacoes] = useState([]);
  const [paginacao, setPaginacao] = useState({
    pagina: 1,
    limite: 10,
    total: 0,
    totalPaginas: 0
  });
  const [filtros, setFiltros] = useState({
    status: '',
    processo: '',
    valorMin: '',
    valorMax: '',
    dataInicio: '',
    dataFim: '',
    ordenar: 'recentes'
  });

  useEffect(() => {
    carregarTransacoes();
  }, [paginacao.pagina, filtros]);

  const carregarTransacoes = async () => {
    try {
      setLoading(true);
      const response = await transacaoService.listar({
        pagina: paginacao.pagina,
        limite: paginacao.limite,
        status: filtros.status,
        processo: filtros.processo,
        valorMin: filtros.valorMin,
        valorMax: filtros.valorMax,
        dataInicio: filtros.dataInicio,
        dataFim: filtros.dataFim,
        ordenar: filtros.ordenar
      });

      setTransacoes(response.transacoes);
      setPaginacao({
        ...paginacao,
        total: response.paginacao.total,
        totalPaginas: response.paginacao.totalPaginas
      });
    } catch (error) {
      console.error('Erro ao carregar transações:', error);
    } finally {
      setLoading(false);
    }
  };

  const aplicarFiltros = (e) => {
    e.preventDefault();
    setPaginacao({ ...paginacao, pagina: 1 });
  };

  const limparFiltros = () => {
    setFiltros({
      status: '',
      processo: '',
      valorMin: '',
      valorMax: '',
      dataInicio: '',
      dataFim: '',
      ordenar: 'recentes'
    });
    setPaginacao({ ...paginacao, pagina: 1 });
  };

  const mudarPagina = (novaPagina) => {
    if (novaPagina >= 1 && novaPagina <= paginacao.totalPaginas) {
      setPaginacao({ ...paginacao, pagina: novaPagina });
    }
  };

  const renderPaginacao = () => {
    const paginas = [];
    const maxPaginas = 5;
    let paginaInicial = Math.max(1, paginacao.pagina - Math.floor(maxPaginas / 2));
    const paginaFinal = Math.min(paginacao.totalPaginas, paginaInicial + maxPaginas - 1);

    // Ajustar paginaInicial se necessário
    paginaInicial = Math.max(1, paginaFinal - maxPaginas + 1);

    for (let i = paginaInicial; i <= paginaFinal; i++) {
      paginas.push(
        <button
          key={i}
          onClick={() => mudarPagina(i)}
          className={`px-3 py-1 mx-1 rounded ${
            paginacao.pagina === i
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          {i}
        </button>
      );
    }

    return (
      <div className="flex justify-center mt-6">
        <button
          onClick={() => mudarPagina(paginacao.pagina - 1)}
          disabled={paginacao.pagina === 1}
          className="px-3 py-1 mx-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Anterior
        </button>
        {paginas}
        <button
          onClick={() => mudarPagina(paginacao.pagina + 1)}
          disabled={paginacao.pagina === paginacao.totalPaginas}
          className="px-3 py-1 mx-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Próxima
        </button>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Minhas Transações</h1>

          {/* Filtros */}
          <div className="bg-white rounded-lg shadow mb-6">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800">Filtros</h2>
            </div>
            <div className="p-4">
              <form onSubmit={aplicarFiltros}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      value={filtros.status}
                      onChange={(e) => setFiltros({ ...filtros, status: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Todos</option>
                      <option value="iniciada">Iniciada</option>
                      <option value="documentacao">Documentação</option>
                      <option value="pagamento">Pagamento</option>
                      <option value="transferencia">Transferência</option>
                      <option value="concluida">Concluída</option>
                      <option value="cancelada">Cancelada</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Número do Processo
                    </label>
                    <input
                      type="text"
                      value={filtros.processo}
                      onChange={(e) => setFiltros({ ...filtros, processo: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Ex: 0001234-12.2020.8.26.0100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Valor Mínimo
                    </label>
                    <input
                      type="number"
                      value={filtros.valorMin}
                      onChange={(e) => setFiltros({ ...filtros, valorMin: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="R$ 0,00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Valor Máximo
                    </label>
                    <input
                      type="number"
                      value={filtros.valorMax}
                      onChange={(e) => setFiltros({ ...filtros, valorMax: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="R$ 100.000,00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Data Inicial
                    </label>
                    <input
                      type="date"
                      value={filtros.dataInicio}
                      onChange={(e) => setFiltros({ ...filtros, dataInicio: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Data Final
                    </label>
                    <input
                      type="date"
                      value={filtros.dataFim}
                      onChange={(e) => setFiltros({ ...filtros, dataFim: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ordenar por
                    </label>
                    <select
                      value={filtros.ordenar}
                      onChange={(e) => setFiltros({ ...filtros, ordenar: e.target.value })}
                      className="p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="recentes">Mais recentes</option>
                      <option value="antigos">Mais antigos</option>
                      <option value="valor_asc">Menor valor</option>
                      <option value="valor_desc">Maior valor</option>
                    </select>
                  </div>
                  <div className="space-x-2">
                    <button
                      type="button"
                      onClick={limparFiltros}
                      className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-100"
                    >
                      Limpar Filtros
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Aplicar Filtros
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          ) : (
            <>
              <div className="mb-4">
                <p className="text-gray-600">
                  Exibindo {transacoes.length} de {paginacao.total} transações
                </p>
              </div>
              
              {transacoes.length > 0 ? (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Processo
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {user.tipo === 'vendedor' ? 'Comprador' : 'Vendedor'}
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Valor
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Data de Início
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Ações
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {transacoes.map((transacao) => {
                        const statusFormatado = formatarStatusTransacao(transacao.status);
                        
                        return (
                          <tr key={transacao._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {transacao.processo.numero}
                              </div>
                              <div className="text-sm text-gray-500">
                                {transacao.processo.tipo}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {user.tipo === 'vendedor' 
                                  ? transacao.comprador.nome 
                                  : transacao.vendedor.nome}
                              </div>
                              <div className="text-sm text-gray-500">
                                {user.tipo === 'vendedor' 
                                  ? transacao.comprador.email 
                                  : transacao.vendedor.email}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {formatarMoeda(transacao.valor)}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatarData(transacao.dataCriacao)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusFormatado.color} ${statusFormatado.textColor}`}>
                                {statusFormatado.label}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <Link
                                to={`/transacoes/${transacao._id}`}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                Visualizar
                              </Link>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow p-6 text-center">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Nenhuma transação encontrada
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Você ainda não possui transações ou os filtros aplicados não retornaram resultados.
                  </p>
                  <Link
                    to={user.tipo === 'vendedor' ? '/meus-processos' : '/marketplace'}
                    className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    {user.tipo === 'vendedor' ? 'Gerenciar Meus Processos' : 'Explorar Marketplace'}
                  </Link>
                </div>
              )}
              
              {paginacao.totalPaginas > 1 && renderPaginacao()}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Transacoes;