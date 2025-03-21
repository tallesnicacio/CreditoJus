import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { processoService, ofertaService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import Sidebar from '../components/Sidebar';
import { 
  formatarMoeda, 
  formatarData, 
  formatarStatusProcesso, 
  formatarTipoProcesso, 
  formatarFaseProcessual,
  formatarExpectativaRecebimento,
  calcularDesagio 
} from '../utils/formatters';

const ProcessDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [processo, setProcesso] = useState(null);
  const [minhasOfertas, setMinhasOfertas] = useState([]);
  const [totalOfertas, setTotalOfertas] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estado para o modal de nova oferta
  const [showOfertaModal, setShowOfertaModal] = useState(false);
  const [novaOferta, setNovaOferta] = useState({
    valor: '',
    mensagem: '',
    condicoesEspeciais: '',
  });
  const [submittingOferta, setSubmittingOferta] = useState(false);
  const [ofertaError, setOfertaError] = useState(null);
  
  // Estado para visualização de documento
  const [selectedDoc, setSelectedDoc] = useState(null);
  
  // Determinar se o usuário é o dono do processo
  const isOwner = processo?.usuario?._id === user?.id;
  
  // Determinar se o usuário é comprador
  const isComprador = user?.tipo === 'comprador';
  
  // Verificar se o usuário já fez alguma oferta para este processo
  const hasUserOffer = minhasOfertas.length > 0;

  // Carregar dados do processo
  useEffect(() => {
    const fetchProcesso = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await processoService.obterDetalhes(id);
        setProcesso(response.processo);
        setMinhasOfertas(response.minhasOfertas || []);
        setTotalOfertas(response.totalOfertas || 0);
      } catch (err) {
        console.error('Erro ao buscar detalhes do processo:', err);
        setError('Não foi possível carregar os detalhes do processo. Tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProcesso();
  }, [id]);

  // Função para fazer uma nova oferta
  const handleSubmitOferta = async (e) => {
    e.preventDefault();
    
    if (!novaOferta.valor || parseFloat(novaOferta.valor) <= 0) {
      setOfertaError('O valor da oferta deve ser maior que zero.');
      return;
    }
    
    try {
      setSubmittingOferta(true);
      setOfertaError(null);
      
      const ofertaData = {
        processoId: id,
        valor: parseFloat(novaOferta.valor),
        mensagem: novaOferta.mensagem,
        condicoesEspeciais: novaOferta.condicoesEspeciais,
      };
      
      await ofertaService.criarOferta(ofertaData);
      
      // Fechar modal e recarregar dados
      setShowOfertaModal(false);
      setNovaOferta({ valor: '', mensagem: '', condicoesEspeciais: '' });
      
      // Recarregar dados do processo para atualizar ofertas
      const response = await processoService.obterDetalhes(id);
      setProcesso(response.processo);
      setMinhasOfertas(response.minhasOfertas || []);
      setTotalOfertas(response.totalOfertas || 0);
      
    } catch (err) {
      console.error('Erro ao enviar oferta:', err);
      setOfertaError(err.response?.data?.error || 'Erro ao enviar oferta. Tente novamente.');
    } finally {
      setSubmittingOferta(false);
    }
  };

  // Função para visualizar documento
  const handleViewDocument = (doc) => {
    setSelectedDoc(doc);
  };

  // Função para voltar da visualização de documento
  const handleCloseDocViewer = () => {
    setSelectedDoc(null);
  };

  // Renderizar estado de carregamento
  if (loading) {
    return (
      <div className="flex h-screen bg-gray-100">
        <Sidebar />
        <div className="flex-1 overflow-auto">
          <div className="p-6">
            <div className="flex justify-center items-center h-64">
              <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Renderizar estado de erro
  if (error) {
    return (
      <div className="flex h-screen bg-gray-100">
        <Sidebar />
        <div className="flex-1 overflow-auto">
          <div className="p-6">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              <p>{error}</p>
            </div>
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
            >
              Voltar
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Verificar se o processo existe
  if (!processo) {
    return (
      <div className="flex h-screen bg-gray-100">
        <Sidebar />
        <div className="flex-1 overflow-auto">
          <div className="p-6">
            <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
              <p>Processo não encontrado.</p>
            </div>
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
            >
              Voltar
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Calcular deságio se houver valor mínimo
  const desagio = processo.valorMinimo ? calcularDesagio(processo.valorEstimado, processo.valorMinimo) : null;
  
  // Formatação de status
  const statusFormatado = formatarStatusProcesso(processo.status);

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        {/* Visualizador de documento */}
        {selectedDoc && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-6xl max-h-screen flex flex-col">
              <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-lg font-semibold">{selectedDoc.nome}</h3>
                <button
                  onClick={handleCloseDocViewer}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="flex-1 overflow-auto p-4">
                {selectedDoc.tipo.startsWith('image/') ? (
                  <img
                    src={`/uploads/${selectedDoc.caminho.split('/').pop()}`}
                    alt={selectedDoc.nome}
                    className="max-w-full h-auto mx-auto"
                  />
                ) : selectedDoc.tipo === 'application/pdf' ? (
                  <iframe
                    src={`/uploads/${selectedDoc.caminho.split('/').pop()}`}
                    className="w-full h-full min-h-[500px]"
                    title={selectedDoc.nome}
                  />
                ) : (
                  <div className="text-center py-10">
                    <p>Este tipo de arquivo não pode ser visualizado diretamente.</p>
                    <a
                      href={`/uploads/${selectedDoc.caminho.split('/').pop()}`}
                      download={selectedDoc.nome}
                      className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Baixar Arquivo
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Modal de nova oferta */}
        {showOfertaModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
              <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-lg font-semibold">Fazer Oferta</h3>
                <button
                  onClick={() => setShowOfertaModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <form onSubmit={handleSubmitOferta}>
                <div className="p-4">
                  {ofertaError && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                      <p>{ofertaError}</p>
                    </div>
                  )}
                  
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Valor da Oferta (R$) *
                    </label>
                    <input
                      type="number"
                      value={novaOferta.valor}
                      onChange={(e) => setNovaOferta({...novaOferta, valor: e.target.value})}
                      placeholder="Digite o valor da sua oferta"
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      required
                      min="1"
                      step="0.01"
                    />
                    <p className="text-gray-500 text-xs mt-1">
                      Valor do processo: {formatarMoeda(processo.valorEstimado)}
                      {processo.valorMinimo && (
                        <span> / Valor mínimo: {formatarMoeda(processo.valorMinimo)}</span>
                      )}
                    </p>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Mensagem (opcional)
                    </label>
                    <textarea
                      value={novaOferta.mensagem}
                      onChange={(e) => setNovaOferta({...novaOferta, mensagem: e.target.value})}
                      placeholder="Digite uma mensagem para o vendedor"
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      rows="3"
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Condições Especiais (opcional)
                    </label>
                    <textarea
                      value={novaOferta.condicoesEspeciais}
                      onChange={(e) => setNovaOferta({...novaOferta, condicoesEspeciais: e.target.value})}
                      placeholder="Condições especiais para sua oferta"
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      rows="3"
                    />
                  </div>
                </div>
                
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    disabled={submittingOferta}
                    className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm ${
                      submittingOferta ? 'opacity-75 cursor-not-allowed' : ''
                    }`}
                  >
                    {submittingOferta ? 'Enviando...' : 'Enviar Oferta'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowOfertaModal(false)}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:w-auto sm:text-sm"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="p-6">
          {/* Cabeçalho */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <button
                onClick={() => navigate(-1)}
                className="text-blue-600 hover:text-blue-800 flex items-center mb-2"
              >
                <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Voltar
              </button>
              <h1 className="text-2xl font-bold text-gray-800">{processo.numero}</h1>
              <div className="flex items-center mt-2">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${statusFormatado.color} ${statusFormatado.textColor} mr-2`}>
                  {statusFormatado.label}
                </span>
                <span className="text-gray-600">
                  {formatarTipoProcesso(processo.tipo)} • {processo.tribunal}
                </span>
              </div>
            </div>
            
            <div>
              {/* Ações disponíveis baseadas no tipo de usuário e status do processo */}
              {isComprador && processo.status === 'ativo' && !hasUserOffer && (
                <button
                  onClick={() => setShowOfertaModal(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 shadow-sm"
                >
                  Fazer Oferta
                </button>
              )}
              
              {isComprador && hasUserOffer && (
                <Link
                  to={`/ofertas/${minhasOfertas[0]._id}`}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 shadow-sm"
                >
                  Ver Minha Oferta
                </Link>
              )}
              
              {isOwner && processo.status === 'ativo' && totalOfertas > 0 && (
                <Link
                  to={`/processos/${processo._id}/ofertas`}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 shadow-sm"
                >
                  Ver Ofertas ({totalOfertas})
                </Link>
              )}
              
              {isOwner && ['pendente', 'emAnalise', 'rejeitado'].includes(processo.status) && (
                <Link
                  to={`/processos/${processo._id}/editar`}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 shadow-sm"
                >
                  Editar Processo
                </Link>
              )}
            </div>
          </div>

          {/* Grid de informações */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Coluna principal */}
            <div className="md:col-span-2 space-y-6">
              {/* Card de informações gerais */}
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-800">Informações do Processo</h2>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Número do Processo</h3>
                      <p className="mt-1 text-gray-900">{processo.numero}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Tipo de Processo</h3>
                      <p className="mt-1 text-gray-900">{formatarTipoProcesso(processo.tipo)}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Tribunal</h3>
                      <p className="mt-1 text-gray-900">{processo.tribunal}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Fase Processual</h3>
                      <p className="mt-1 text-gray-900">{formatarFaseProcessual(processo.fase)}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Vara</h3>
                      <p className="mt-1 text-gray-900">{processo.vara || 'Não informado'}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Cidade/Estado</h3>
                      <p className="mt-1 text-gray-900">
                        {processo.cidade ? `${processo.cidade}/${processo.estado}` : 'Não informado'}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Data de Cadastro</h3>
                      <p className="mt-1 text-gray-900">{formatarData(processo.dataCadastro)}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Expectativa de Recebimento</h3>
                      <p className="mt-1 text-gray-900">{formatarExpectativaRecebimento(processo.expectativaRecebimento)}</p>
                    </div>
                    {processo.dataAtualizacao && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Última Atualização</h3>
                        <p className="mt-1 text-gray-900">{formatarData(processo.dataAtualizacao)}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Card de descrição */}
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-800">Descrição do Processo</h2>
                </div>
                <div className="p-6">
                  <p className="text-gray-700 whitespace-pre-line">{processo.descricao}</p>
                </div>
              </div>

              {/* Card de documentos - visível apenas para o dono ou se não for confidencial */}
              {(isOwner || !processo.isConfidencial || hasUserOffer) && processo.documentos && processo.documentos.length > 0 && (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-800">Documentos</h2>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {processo.documentos.map((doc, index) => (
                        <div key={doc._id || index} className="border rounded-lg p-3 flex items-center">
                          <div className="bg-gray-100 rounded-full p-2 mr-3">
                            {doc.tipo.startsWith('image/') ? (
                              <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            ) : doc.tipo === 'application/pdf' ? (
                              <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                              </svg>
                            ) : (
                              <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{doc.nome}</p>
                            <p className="text-xs text-gray-500">{(doc.tamanho / 1024).toFixed(2)} KB • {formatarData(doc.dataUpload)}</p>
                          </div>
                          <button
                            onClick={() => handleViewDocument(doc)}
                            className="ml-2 px-3 py-1 text-sm text-blue-600 hover:text-blue-800"
                          >
                            Visualizar
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              
              {/* Card de histórico - visível apenas para o dono */}
              {isOwner && processo.historicoStatus && processo.historicoStatus.length > 0 && (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-800">Histórico do Processo</h2>
                  </div>
                  <div className="p-6">
                    <ul className="space-y-4">
                      {processo.historicoStatus.map((item, index) => (
                        <li key={index} className="relative pl-6 pb-4 border-l-2 border-gray-200 last:border-0 last:pb-0">
                          <div className="absolute -left-[9px] bg-gray-200 rounded-full w-4 h-4 border-2 border-white"></div>
                          <div className="flex justify-between">
                            <p className="font-medium">{formatarStatusProcesso(item.status).label}</p>
                            <p className="text-gray-500 text-sm">{formatarData(item.data, { formato: 'dataHora' })}</p>
                          </div>
                          {item.observacao && (
                            <p className="text-gray-600 mt-1">{item.observacao}</p>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>

            {/* Coluna lateral */}
            <div className="space-y-6">
              {/* Card de valores */}
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-800">Valores</h2>
                </div>
                <div className="p-6">
                  <div className="mb-4">
                    <h3 className="text-sm font-medium text-gray-500">Valor da Causa</h3>
                    <p className="mt-1 text-xl font-semibold text-gray-900">{formatarMoeda(processo.valorCausa)}</p>
                  </div>
                  <div className="mb-4">
                    <h3 className="text-sm font-medium text-gray-500">Valor Estimado Atual</h3>
                    <p className="mt-1 text-2xl font-bold text-blue-600">{formatarMoeda(processo.valorEstimado)}</p>
                  </div>
                  {processo.valorMinimo && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Valor Mínimo Aceitável</h3>
                      <p className="mt-1 text-xl font-semibold text-green-600">
                        {formatarMoeda(processo.valorMinimo)}
                        {desagio && (
                          <span className="ml-2 text-sm text-red-500">
                            (Deságio de {desagio.toFixed(1)}%)
                          </span>
                        )}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Card do vendedor */}
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-800">Vendedor</h2>
                </div>
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="h-12 w-12 rounded-full bg-blue-600 text-white flex items-center justify-center text-xl font-semibold">
                      {processo.usuario?.nome?.charAt(0) || '?'}
                    </div>
                    <div className="ml-4">
                      <h3 className="font-medium text-gray-900">{processo.usuario?.nome || 'Nome não disponível'}</h3>
                      {!processo.isConfidencial && processo.usuario?.email && (
                        <p className="text-gray-600 text-sm">{processo.usuario.email}</p>
                      )}
                    </div>
                  </div>
                  
                  {/* Se não for o dono e não for confidencial, mostrar contato */}
                  {!isOwner && !processo.isConfidencial && processo.usuario?.telefone && (
                    <div className="mt-4">
                      <h3 className="text-sm font-medium text-gray-500">Contato</h3>
                      <p className="mt-1 text-gray-900">{processo.usuario.telefone}</p>
                    </div>
                  )}
                  
                  {/* Mensagem de confidencialidade */}
                  {!isOwner && processo.isConfidencial && (
                    <div className="mt-4 bg-yellow-50 p-3 rounded-md">
                      <p className="text-sm text-yellow-700">
                        <svg className="w-5 h-5 inline-block mr-1 -mt-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        Informações detalhadas do vendedor ficarão disponíveis após fazer uma oferta aceita.
                      </p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Card de ofertas recebidas - apenas para o dono */}
              {isOwner && totalOfertas > 0 && (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-800">Ofertas Recebidas</h2>
                  </div>
                  <div className="p-6">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">{totalOfertas}</p>
                      <p className="text-gray-600">{totalOfertas === 1 ? 'oferta ativa' : 'ofertas ativas'}</p>
                      <Link
                        to={`/processos/${processo._id}/ofertas`}
                        className="mt-4 inline-block px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                      >
                        Visualizar Ofertas
                      </Link>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Card de minha oferta - apenas para compradores que já fizeram oferta */}
              {isComprador && hasUserOffer && (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-800">Minha Oferta</h2>
                  </div>
                  <div className="p-6">
                    <div className="mb-4">
                      <h3 className="text-sm font-medium text-gray-500">Valor Oferecido</h3>
                      <p className="mt-1 text-xl font-semibold text-blue-600">
                        {formatarMoeda(minhasOfertas[0].valor)}
                      </p>
                      {processo.valorEstimado && (
                        <p className="text-sm text-gray-500">
                          {calcularDesagio(processo.valorEstimado, minhasOfertas[0].valor).toFixed(1)}% de deságio
                        </p>
                      )}
                    </div>
                    <div className="mb-4">
                      <h3 className="text-sm font-medium text-gray-500">Status</h3>
                      <p className="mt-1">
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${formatarStatusOferta(minhasOfertas[0].status).color} ${formatarStatusOferta(minhasOfertas[0].status).textColor}`}>
                          {formatarStatusOferta(minhasOfertas[0].status).label}
                        </span>
                      </p>
                    </div>
                    <div className="mt-4">
                      <Link
                        to={`/ofertas/${minhasOfertas[0]._id}`}
                        className="w-full inline-block text-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        Ver Detalhes da Oferta
                      </Link>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Card de ações adicionais */}
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-800">Ações</h2>
                </div>
                <div className="p-6 space-y-3">
                  {isComprador && processo.status === 'ativo' && !hasUserOffer && (
                    <button
                      onClick={() => setShowOfertaModal(true)}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 shadow-sm"
                    >
                      Fazer Oferta
                    </button>
                  )}
                  
                  {isOwner && ['pendente', 'emAnalise', 'rejeitado'].includes(processo.status) && (
                    <>
                      <Link
                        to={`/processos/${processo._id}/editar`}
                        className="w-full inline-block text-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 shadow-sm"
                      >
                        Editar Processo
                      </Link>
                      
                      {/* Apenas processos pendentes ou rejeitados podem ser excluídos */}
                      {['pendente', 'rejeitado'].includes(processo.status) && (
                        <button
                          onClick={() => {
                            if (window.confirm('Tem certeza que deseja excluir este processo? Esta ação não pode ser desfeita.')) {
                              processoService.excluir(processo._id)
                                .then(() => navigate('/meus-processos'))
                                .catch(err => alert('Erro ao excluir processo: ' + err.response?.data?.error || 'Tente novamente mais tarde.'));
                            }
                          }}
                          className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 shadow-sm"
                        >
                          Excluir Processo
                        </button>
                      )}
                    </>
                  )}
                  
                  {/* Reportar problema - para todos os usuários */}
                  <button
                    onClick={() => alert('Funcionalidade de reportar problema será implementada em breve.')}
                    className="w-full px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 shadow-sm"
                  >
                    Reportar Problema
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProcessDetails;