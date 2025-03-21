import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { processoService } from '../services/api';
import Sidebar from '../components/Sidebar';
import ProcessCard from '../components/ProcessCard';
import { formatarMoeda } from '../utils/formatters';

const Marketplace = () => {
  // Estados para processos e filtros
  const [processos, setProcessos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paginacao, setPaginacao] = useState({
    total: 0,
    pagina: 1,
    limite: 9,
    totalPaginas: 0
  });

  // Estados para filtros
  const [filtros, setFiltros] = useState({
    tipo: '',
    tribunal: '',
    fase: '',
    valorMinimo: '',
    valorMaximo: '',
    expectativaRecebimento: '',
    pesquisa: '',
    ordenar: 'recentes'
  });

  // Estados para opções de filtro
  const [filtrosAbertos, setFiltrosAbertos] = useState(false);
  const [filtrando, setFiltrando] = useState(false);

  // Opções para filtros
  const opcoesTipo = [
    { value: 'trabalhista', label: 'Trabalhista' },
    { value: 'civel', label: 'Cível' },
    { value: 'previdenciario', label: 'Previdenciário' },
    { value: 'tributario', label: 'Tributário' },
    { value: 'consumidor', label: 'Direito do Consumidor' },
    { value: 'outro', label: 'Outro' }
  ];

  const opcoesTribunal = [
    { value: 'TJSP', label: 'TJSP - Tribunal de Justiça de São Paulo' },
    { value: 'TJRJ', label: 'TJRJ - Tribunal de Justiça do Rio de Janeiro' },
    { value: 'TJMG', label: 'TJMG - Tribunal de Justiça de Minas Gerais' },
    { value: 'TRT2', label: 'TRT2 - Tribunal Regional do Trabalho 2ª Região' },
    { value: 'TRT15', label: 'TRT15 - Tribunal Regional do Trabalho 15ª Região' },
    { value: 'TRF3', label: 'TRF3 - Tribunal Regional Federal 3ª Região' },
    { value: 'outro', label: 'Outro' }
  ];

  const opcoesFase = [
    { value: 'conhecimento', label: 'Conhecimento' },
    { value: 'sentenca', label: 'Sentença' },
    { value: 'recursos', label: 'Recursos' },
    { value: 'transitoJulgado', label: 'Trânsito em Julgado' },
    { value: 'cumprimentoSentenca', label: 'Cumprimento de Sentença' },
    { value: 'execucao', label: 'Execução' },
    { value: 'precatorio', label: 'Precatório/RPV' }
  ];

  const opcoesExpectativa = [
    { value: '6', label: 'Menos de 6 meses' },
    { value: '12', label: '6 a 12 meses' },
    { value: '24', label: '12 a 24 meses' },
    { value: '36', label: '24 a 36 meses' },
    { value: '48', label: 'Mais de 36 meses' },
    { value: 'incerto', label: 'Incerto' }
  ];

  const opcoesOrdenacao = [
    { value: 'recentes', label: 'Mais recentes' },
    { value: 'antigos', label: 'Mais antigos' },
    { value: 'valorDesc', label: 'Maior valor' },
    { value: 'valorAsc', label: 'Menor valor' }
  ];

  // Função para buscar processos
  const buscarProcessos = async () => {
    try {
      setLoading(true);
      setError(null);

      // Preparar parâmetros de consulta
      const params = {
        pagina: paginacao.pagina,
        limite: paginacao.limite,
        ...filtros
      };

      // Remover parâmetros vazios
      Object.keys(params).forEach(key => {
        if (params[key] === '' || params[key] === null || params[key] === undefined) {
          delete params[key];
        }
      });

      const response = await processoService.listarMarketplace(params);
      setProcessos(response.processos);
      setPaginacao({
        total: response.paginacao.total,
        pagina: response.paginacao.pagina,
        limite: response.paginacao.limite,
        totalPaginas: response.paginacao.totalPaginas
      });
    } catch (err) {
      console.error('Erro ao buscar processos:', err);
      setError('Não foi possível carregar os processos. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
      setFiltrando(false);
    }
  };

  // Buscar processos ao montar o componente e quando mudar a página
  useEffect(() => {
    buscarProcessos();
  }, [paginacao.pagina]);

  // Função para alterar página
  const mudarPagina = (pagina) => {
    setPaginacao(prev => ({ ...prev, pagina }));
  };

  // Função para aplicar filtros
  const aplicarFiltros = (e) => {
    e.preventDefault();
    setFiltrando(true);
    setPaginacao(prev => ({ ...prev, pagina: 1 })); // Voltar para a primeira página
    buscarProcessos();
  };

  // Função para limpar filtros
  const limparFiltros = () => {
    setFiltros({
      tipo: '',
      tribunal: '',
      fase: '',
      valorMinimo: '',
      valorMaximo: '',
      expectativaRecebimento: '',
      pesquisa: '',
      ordenar: 'recentes'
    });
    setFiltrando(true);
    setPaginacao(prev => ({ ...prev, pagina: 1 }));
    setTimeout(() => buscarProcessos(), 0); // Buscar no próximo ciclo
  };

  // Função para lidar com alterações de filtro
  const handleFiltroChange = (e) => {
    const { name, value } = e.target;
    setFiltros(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Marketplace de Processos</h1>
            <button
              onClick={() => setFiltrosAbertos(!filtrosAbertos)}
              className="px-4 py-2 bg-white border border-gray-300 rounded shadow-sm text-gray-700 hover:bg-gray-50 flex items-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                />
              </svg>
              Filtros
            </button>
          </div>

          {/* Painel de filtros */}
          {filtrosAbertos && (
            <div className="bg-white rounded-lg shadow mb-6 p-4">
              <form onSubmit={aplicarFiltros}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Filtro de pesquisa */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pesquisar
                    </label>
                    <input
                      type="text"
                      name="pesquisa"
                      value={filtros.pesquisa}
                      onChange={handleFiltroChange}
                      placeholder="Número ou descrição do processo"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  {/* Filtro de tipo */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tipo de Processo
                    </label>
                    <select
                      name="tipo"
                      value={filtros.tipo}
                      onChange={handleFiltroChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Todos os tipos</option>
                      {opcoesTipo.map(opcao => (
                        <option key={opcao.value} value={opcao.value}>
                          {opcao.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Filtro de tribunal */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tribunal
                    </label>
                    <select
                      name="tribunal"
                      value={filtros.tribunal}
                      onChange={handleFiltroChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Todos os tribunais</option>
                      {opcoesTribunal.map(opcao => (
                        <option key={opcao.value} value={opcao.value}>
                          {opcao.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Filtro de fase */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fase Processual
                    </label>
                    <select
                      name="fase"
                      value={filtros.fase}
                      onChange={handleFiltroChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Todas as fases</option>
                      {opcoesFase.map(opcao => (
                        <option key={opcao.value} value={opcao.value}>
                          {opcao.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Filtro de expectativa de recebimento */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Expectativa de Recebimento
                    </label>
                    <select
                      name="expectativaRecebimento"
                      value={filtros.expectativaRecebimento}
                      onChange={handleFiltroChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Todas</option>
                      {opcoesExpectativa.map(opcao => (
                        <option key={opcao.value} value={opcao.value}>
                          {opcao.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Filtro de ordenação */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ordenar por
                    </label>
                    <select
                      name="ordenar"
                      value={filtros.ordenar}
                      onChange={handleFiltroChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      {opcoesOrdenacao.map(opcao => (
                        <option key={opcao.value} value={opcao.value}>
                          {opcao.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Filtro de valor */}
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Faixa de Valor
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <input
                        type="number"
                        name="valorMinimo"
                        value={filtros.valorMinimo}
                        onChange={handleFiltroChange}
                        placeholder="Valor mínimo"
                        min="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <input
                        type="number"
                        name="valorMaximo"
                        value={filtros.valorMaximo}
                        onChange={handleFiltroChange}
                        placeholder="Valor máximo"
                        min="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Botões de ação */}
                <div className="mt-6 flex justify-end">
                  <button
                    type="button"
                    onClick={limparFiltros}
                    className="mr-3 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                  >
                    Limpar Filtros
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
                  >
                    Aplicar Filtros
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Status da busca */}
          <div className="flex justify-between items-center mb-4">
            <p className="text-gray-600">
              {paginacao.total} {paginacao.total === 1 ? 'processo encontrado' : 'processos encontrados'}
            </p>
            <div className="text-sm text-gray-500">
              Página {paginacao.pagina} de {paginacao.totalPaginas || 1}
            </div>
          </div>

          {/* Mensagem de carregamento */}
          {loading && (
            <div className="flex justify-center items-center h-64">
              <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          )}

          {/* Mensagem de erro */}
          {error && !loading && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              <p>{error}</p>
            </div>
          )}

          {/* Lista de processos */}
          {!loading && !error && processos.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {processos.map(processo => (
                <ProcessCard
                  key={processo._id}
                  processo={processo}
                  isVendedor={false}
                />
              ))}
            </div>
          )}

          {/* Mensagem de nenhum processo encontrado */}
          {!loading && !error && processos.length === 0 && (
            <div className="text-center py-16 bg-white rounded-lg shadow">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
              <h3 className="mt-2 text-lg font-medium text-gray-900">Nenhum processo encontrado</h3>
              <p className="mt-1 text-gray-500">
                Tente ajustar seus filtros para encontrar mais resultados.
              </p>
              <div className="mt-6">
                <button
                  onClick={limparFiltros}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
                >
                  Limpar Filtros
                </button>
              </div>
            </div>
          )}

          {/* Paginação */}
          {!loading && !error && paginacao.totalPaginas > 1 && (
            <div className="mt-8 flex justify-center">
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Paginação">
                {/* Botão Anterior */}
                <button
                  onClick={() => mudarPagina(Math.max(1, paginacao.pagina - 1))}
                  disabled={paginacao.pagina === 1}
                  className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                    paginacao.pagina === 1
                      ? 'text-gray-300 cursor-not-allowed'
                      : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <span className="sr-only">Anterior</span>
                  <svg
                    className="h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>

                {/* Números de página */}
                {[...Array(paginacao.totalPaginas).keys()].map(num => {
                  const pagina = num + 1;

                  // Se tivermos muitas páginas, vamos limitar quais exibir
                  if (
                    paginacao.totalPaginas <= 7 ||
                    pagina === 1 ||
                    pagina === paginacao.totalPaginas ||
                    (pagina >= paginacao.pagina - 1 && pagina <= paginacao.pagina + 1)
                  ) {
                    return (
                      <button
                        key={pagina}
                        onClick={() => mudarPagina(pagina)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          pagina === paginacao.pagina
                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {pagina}
                      </button>
                    );
                  }

                  // Adicionar elipses para indicar páginas omitidas
                  if (
                    pagina === 2 ||
                    pagina === paginacao.totalPaginas - 1
                  ) {
                    return (
                      <span
                        key={`ellipsis-${pagina}`}
                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
                      >
                        ...
                      </span>
                    );
                  }

                  return null;
                })}

                {/* Botão Próximo */}
                <button
                  onClick={() => mudarPagina(Math.min(paginacao.totalPaginas, paginacao.pagina + 1))}
                  disabled={paginacao.pagina === paginacao.totalPaginas}
                  className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                    paginacao.pagina === paginacao.totalPaginas
                      ? 'text-gray-300 cursor-not-allowed'
                      : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <span className="sr-only">Próximo</span>
                  <svg
                    className="h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </nav>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Marketplace;