import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Sidebar from '../components/Sidebar';
import ProcessCard from '../components/ProcessCard';
import { processoService, ofertaService, transacaoService } from '../services/api';
import { formatarMoeda, formatarStatusProcesso, formatarStatusOferta } from '../utils/formatters';

const Dashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    processos: [],
    ofertas: [],
    transacoes: [],
    estatisticas: {
      totalProcessos: 0,
      totalOfertas: 0,
      totalTransacoes: 0,
      valorProcessos: 0,
      valorTransacoes: 0
    }
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const data = {
          processos: [],
          ofertas: [],
          transacoes: [],
          estatisticas: {
            totalProcessos: 0,
            totalOfertas: 0,
            totalTransacoes: 0,
            valorProcessos: 0,
            valorTransacoes: 0
          }
        };

        // Buscar dados baseados no tipo de usuário
        if (user.tipo === 'vendedor') {
          // Processos
          const processosResponse = await processoService.listarMeusProcessos({
            limite: 3,
            ordenar: 'recentes'
          });
          data.processos = processosResponse.processos;
          data.estatisticas.totalProcessos = processosResponse.paginacao.total;
          data.estatisticas.valorProcessos = data.processos.reduce(
            (total, processo) => total + processo.valorEstimado,
            0
          );

          // Ofertas recebidas
          const ofertasResponse = await ofertaService.listarRecebidas({
            limite: 3,
            ordenar: 'recentes'
          });
          data.ofertas = ofertasResponse.ofertas;
          data.estatisticas.totalOfertas = ofertasResponse.ofertas.length;
        } else if (user.tipo === 'comprador') {
          // Processos no marketplace (ativos)
          const processosResponse = await processoService.listarMarketplace({
            limite: 3,
            ordenar: 'recentes'
          });
          data.processos = processosResponse.processos;
          data.estatisticas.totalProcessos = processosResponse.paginacao.total;

          // Ofertas enviadas
          const ofertasResponse = await ofertaService.listarEnviadas({
            limite: 3,
            ordenar: 'recentes'
          });
          data.ofertas = ofertasResponse.ofertas;
          data.estatisticas.totalOfertas = ofertasResponse.ofertas.length;
          data.estatisticas.valorOfertas = data.ofertas.reduce(
            (total, oferta) => total + oferta.valor,
            0
          );
        }

        // Transações (comum para ambos os tipos)
        const transacoesResponse = await transacaoService.listar({
          limite: 3,
          ordenar: 'recentes'
        });
        data.transacoes = transacoesResponse.transacoes;
        data.estatisticas.totalTransacoes = transacoesResponse.paginacao.total;
        data.estatisticas.valorTransacoes = data.transacoes.reduce(
          (total, transacao) => total + transacao.valor,
            0
        );

        setDashboardData(data);
      } catch (error) {
        console.error('Erro ao carregar dados do dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  // Componente de card de estatística
  const StatCard = ({ title, value, icon, color }) => (
    <div className={`bg-white rounded-lg shadow p-5 border-l-4 ${color}`}>
      <div className="flex justify-between items-center">
        <div>
          <p className="text-gray-500 text-sm">{title}</p>
          <h3 className="text-2xl font-bold mt-1">{value}</h3>
        </div>
        <div className={`text-3xl opacity-50 ${color.replace('border-', 'text-')}`}>
          {icon}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Cartões de estatísticas */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {user.tipo === 'vendedor' && (
                  <>
                    <StatCard
                      title="Processos Ativos"
                      value={dashboardData.estatisticas.totalProcessos}
                      icon="📄"
                      color="border-blue-500"
                    />
                    <StatCard
                      title="Valor Total dos Processos"
                      value={formatarMoeda(dashboardData.estatisticas.valorProcessos)}
                      icon="💰"
                      color="border-green-500"
                    />
                  </>
                )}
                {user.tipo === 'comprador' && (
                  <>
                    <StatCard
                      title="Processos Disponíveis"
                      value={dashboardData.estatisticas.totalProcessos}
                      icon="🏪"
                      color="border-blue-500"
                    />
                    <StatCard
                      title="Ofertas Enviadas"
                      value={dashboardData.estatisticas.totalOfertas}
                      icon="📤"
                      color="border-purple-500"
                    />
                  </>
                )}
                <StatCard
                  title="Transações em Andamento"
                  value={dashboardData.estatisticas.totalTransacoes}
                  icon="🔄"
                  color="border-yellow-500"
                />
                <StatCard
                  title="Valor em Transações"
                  value={formatarMoeda(dashboardData.estatisticas.valorTransacoes)}
                  icon="💵"
                  color="border-indigo-500"
                />
              </div>

              {/* Processos */}
              <div className="bg-white rounded-lg shadow">
                <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-gray-800">
                    {user.tipo === 'vendedor' ? 'Meus Processos Recentes' : 'Processos Disponíveis'}
                  </h2>
                  <Link
                    to={user.tipo === 'vendedor' ? '/meus-processos' : '/marketplace'}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Ver todos
                  </Link>
                </div>
                <div className="p-4">
                  {dashboardData.processos.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {dashboardData.processos.map(processo => (
                        <ProcessCard
                          key={processo._id}
                          processo={processo}
                          isVendedor={user.tipo === 'vendedor'}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-gray-500">Nenhum processo encontrado</p>
                      {user.tipo === 'vendedor' && (
                        <Link
                          to="/cadastrar-processo"
                          className="mt-3 inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                          Cadastrar novo processo
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Ofertas */}
              <div className="bg-white rounded-lg shadow">
                <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-gray-800">
                    {user.tipo === 'vendedor' ? 'Ofertas Recebidas' : 'Ofertas Enviadas'}
                  </h2>
                  <Link
                    to={user.tipo === 'vendedor' ? '/ofertas-recebidas' : '/ofertas-enviadas'}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Ver todas
                  </Link>
                </div>
                <div className="p-4">
                  {dashboardData.ofertas.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead>
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Processo
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Valor
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Data
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Ações
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {dashboardData.ofertas.map(oferta => {
                            const statusFormatado = formatarStatusOferta(oferta.status);
                            
                            return (
                              <tr key={oferta._id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm font-medium text-gray-900">
                                    {oferta.processo.numero}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {oferta.processo.tipo}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm text-gray-900 font-medium">
                                    {formatarMoeda(oferta.valor)}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusFormatado.color} ${statusFormatado.textColor}`}>
                                    {statusFormatado.label}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {new Date(oferta.dataCriacao).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                  <Link
                                    to={`/ofertas/${oferta._id}`}
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
                    <div className="text-center py-6">
                      <p className="text-gray-500">
                        {user.tipo === 'vendedor'
                          ? 'Você ainda não recebeu ofertas'
                          : 'Você ainda não enviou ofertas'}
                      </p>
                      {user.tipo === 'comprador' && (
                        <Link
                          to="/marketplace"
                          className="mt-3 inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                          Explorar marketplace
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Transações Recentes */}
              <div className="bg-white rounded-lg shadow">
                <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-gray-800">Transações Recentes</h2>
                  <Link
                    to="/transacoes"
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Ver todas
                  </Link>
                </div>
                <div className="p-4">
                  {dashboardData.transacoes.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead>
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Processo
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Valor
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              {user.tipo === 'vendedor' ? 'Comprador' : 'Vendedor'}
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Ações
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {dashboardData.transacoes.map(transacao => (
                            <tr key={transacao._id}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">
                                  {transacao.processo.numero}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900 font-medium">
                                  {formatarMoeda(transacao.valor)}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  {user.tipo === 'vendedor'
                                    ? transacao.comprador.nome
                                    : transacao.vendedor.nome}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                  {transacao.status}
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
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-gray-500">Nenhuma transação em andamento</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;