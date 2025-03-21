import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Sidebar from '../components/Sidebar';
import { ofertaService } from '../services/api';
import { formatarMoeda, formatarStatusOferta } from '../utils/formatters';

const OfertasRecebidas = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [ofertas, setOfertas] = useState([]);
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
    if (user.tipo !== 'vendedor') {
      // Redirecionar se não for vendedor
      window.location.href = '/dashboard';
      return;
    }

    carregarOfertas();
  }, [paginacao.pagina, filtros]);

  const carregarOfertas = async () => {
    try {
      setLoading(true);
      const response = await ofertaService.listarRecebidas({
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

      setOfertas(response.ofertas);
      setPaginacao({
        ...paginacao,
        total: response.paginacao.total,
        totalPaginas: response.paginacao.totalPaginas
      });
    } catch (error) {
      console.error('Erro ao carregar ofertas recebidas:', error);
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

  const formatarData = (dataString) => {
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR');
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Ofertas Recebidas</h1>

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
                      <option value="pendente">Pendente</option>
                      <option value="aceita">Aceita</option>
                      <option value="recusada">Recusada</option>
                      <option value="expirada">Expirada</option>
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
                  Exibindo {ofertas.length} de {paginacao.total} ofertas recebidas
                </p>
              </div>
              
              {ofertas.length > 0 ? (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Processo
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Comprador
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Valor Ofertado
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Data
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
                      {ofertas.map((oferta) => {
                        const statusFormatado = formatarStatusOferta(oferta.status);
                        
                        return (
                          <tr key={oferta._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {oferta.processo.numero}
                              </div>
                              <div className="text-sm text-gray-500">
                                {oferta.processo.tipo}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {oferta.comprador.nome}
                              </div>
                              <div className="text-sm text-gray-500">
                                {oferta.comprador.email}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {formatarMoeda(oferta.valor)}
                              </div>
                              {oferta.processo.valorEstimado && (
                                <div className="text-xs text-gray-500">
                                  {Math.round((oferta.valor / oferta.processo.valorEstimado) * 100)}% do valor estimado
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatarData(oferta.dataCriacao)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusFormatado.color} ${statusFormatado.textColor}`}>
                                {statusFormatado.label}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <Link
                                to={`/ofertas/${oferta._id}`}
                                className="text-blue-600 hover:text-blue-900 mr-3"
                              >
                                Visualizar
                              </Link>
                              {oferta.status === 'pendente' && (
                                <>
                                  <Link
                                    to={`/ofertas/${oferta._id}/aceitar`}
                                    className="text-green-600 hover:text-green-900 mr-3"
                                  >
                                    Aceitar
                                  </Link>
                                  <Link
                                    to={`/ofertas/${oferta._id}/recusar`}
                                    className="text-red-600 hover:text-red-900"
                                  >
                                    Recusar
                                  </Link>
                                </>
                              )}
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
                    Nenhuma oferta recebida
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Você ainda não recebeu nenhuma oferta ou os filtros aplicados não retornaram resultados.
                  </p>
                  <Link
                    to="/meus-processos"
                    className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Gerenciar Meus Processos
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

export default OfertasRecebidas;