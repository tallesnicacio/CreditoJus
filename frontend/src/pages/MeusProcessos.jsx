import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Sidebar from '../components/Sidebar';
import ProcessCard from '../components/ProcessCard';
import { processoService } from '../services/api';
import { formatarMoeda, formatarStatusProcesso } from '../utils/formatters';

const MeusProcessos = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [processos, setProcessos] = useState([]);
  const [paginacao, setPaginacao] = useState({
    pagina: 1,
    limite: 12,
    total: 0,
    totalPaginas: 0
  });
  const [filtros, setFiltros] = useState({
    status: '',
    tipo: '',
    valorMin: '',
    valorMax: '',
    ordenar: 'recentes'
  });

  useEffect(() => {
    if (user.tipo !== 'vendedor') {
      // Redirecionar se não for vendedor
      window.location.href = '/dashboard';
      return;
    }

    carregarProcessos();
  }, [paginacao.pagina, filtros]);

  const carregarProcessos = async () => {
    try {
      setLoading(true);
      const response = await processoService.listarMeusProcessos({
        pagina: paginacao.pagina,
        limite: paginacao.limite,
        status: filtros.status,
        tipo: filtros.tipo,
        valorMin: filtros.valorMin,
        valorMax: filtros.valorMax,
        ordenar: filtros.ordenar
      });

      setProcessos(response.processos);
      setPaginacao({
        ...paginacao,
        total: response.paginacao.total,
        totalPaginas: response.paginacao.totalPaginas
      });
    } catch (error) {
      console.error('Erro ao carregar processos:', error);
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
      tipo: '',
      valorMin: '',
      valorMax: '',
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
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Meus Processos</h1>
            <Link
              to="/cadastrar-processo"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Cadastrar Novo Processo
            </Link>
          </div>

          {/* Filtros */}
          <div className="bg-white rounded-lg shadow mb-6">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800">Filtros</h2>
            </div>
            <div className="p-4">
              <form onSubmit={aplicarFiltros}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
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
                      <option value="ativo">Ativo</option>
                      <option value="pendente">Pendente</option>
                      <option value="vendido">Vendido</option>
                      <option value="expirado">Expirado</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tipo de Processo
                    </label>
                    <select
                      value={filtros.tipo}
                      onChange={(e) => setFiltros({ ...filtros, tipo: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Todos</option>
                      <option value="trabalhista">Trabalhista</option>
                      <option value="civel">Cível</option>
                      <option value="previdenciario">Previdenciário</option>
                      <option value="tributario">Tributário</option>
                      <option value="consumidor">Consumidor</option>
                    </select>
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
                  Exibindo {processos.length} de {paginacao.total} processos
                </p>
              </div>
              
              {processos.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {processos.map(processo => (
                    <ProcessCard
                      key={processo._id}
                      processo={processo}
                      isVendedor={true}
                    />
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow p-6 text-center">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Nenhum processo encontrado
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Você ainda não cadastrou nenhum processo ou os filtros aplicados não retornaram resultados.
                  </p>
                  <Link
                    to="/cadastrar-processo"
                    className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Cadastrar Novo Processo
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

export default MeusProcessos;