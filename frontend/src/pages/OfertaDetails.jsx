import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Sidebar from '../components/Sidebar';
import { ofertaService, transacaoService } from '../services/api';
import { formatarMoeda, formatarStatusOferta, formatarData } from '../utils/formatters';

const OfertaDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [oferta, setOferta] = useState(null);
  const [mensagens, setMensagens] = useState([]);
  const [novaMensagem, setNovaMensagem] = useState('');
  const [enviandoMensagem, setEnviandoMensagem] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTipo, setModalTipo] = useState(''); // 'aceitar', 'recusar', 'cancelar'
  const [motivo, setMotivo] = useState('');
  const [processandoAcao, setProcessandoAcao] = useState(false);

  useEffect(() => {
    carregarDados();
  }, [id]);

  const carregarDados = async () => {
    try {
      setLoading(true);
      // Carregar detalhes da oferta
      const ofertaDetalhes = await ofertaService.obterPorId(id);
      setOferta(ofertaDetalhes);
      
      // Carregar mensagens relacionadas à oferta
      const mensagensOferta = await mensagemService.listarPorOferta(id);
      setMensagens(mensagensOferta);
    } catch (error) {
      console.error('Erro ao carregar detalhes da oferta:', error);
    } finally {
      setLoading(false);
    }
  };

  const enviarMensagem = async (e) => {
    e.preventDefault();
    if (!novaMensagem.trim()) return;

    try {
      setEnviandoMensagem(true);
      await mensagemService.enviar({
        ofertaId: id,
        texto: novaMensagem
      });
      
      // Recarregar mensagens
      const mensagensAtualizadas = await mensagemService.listarPorOferta(id);
      setMensagens(mensagensAtualizadas);
      setNovaMensagem('');
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
    } finally {
      setEnviandoMensagem(false);
    }
  };

  const abrirModal = (tipo) => {
    setModalTipo(tipo);
    setModalVisible(true);
    setMotivo('');
  };

  const fecharModal = () => {
    setModalVisible(false);
    setModalTipo('');
    setMotivo('');
  };

  const aceitarOferta = async () => {
    try {
      setProcessandoAcao(true);
      await ofertaService.aceitar(id, { comentario: motivo });
      
      // Atualizar oferta
      const ofertaAtualizada = await ofertaService.obterPorId(id);
      setOferta(ofertaAtualizada);
      
      fecharModal();
      
      // Redirecionar para a página de transação se for criada
      if (ofertaAtualizada.transacao) {
        navigate(`/transacoes/${ofertaAtualizada.transacao}`);
      }
    } catch (error) {
      console.error('Erro ao aceitar oferta:', error);
    } finally {
      setProcessandoAcao(false);
    }
  };

  const recusarOferta = async () => {
    if (!motivo.trim()) {
      alert('Por favor, informe o motivo da recusa.');
      return;
    }
    
    try {
      setProcessandoAcao(true);
      await ofertaService.recusar(id, { motivo });
      
      // Atualizar oferta
      const ofertaAtualizada = await ofertaService.obterPorId(id);
      setOferta(ofertaAtualizada);
      
      fecharModal();
    } catch (error) {
      console.error('Erro ao recusar oferta:', error);
    } finally {
      setProcessandoAcao(false);
    }
  };

  const cancelarOferta = async () => {
    try {
      setProcessandoAcao(true);
      await ofertaService.cancelar(id, { motivo });
      
      // Atualizar oferta
      const ofertaAtualizada = await ofertaService.obterPorId(id);
      setOferta(ofertaAtualizada);
      
      fecharModal();
    } catch (error) {
      console.error('Erro ao cancelar oferta:', error);
    } finally {
      setProcessandoAcao(false);
    }
  };

  const isVendedor = user && oferta && user.tipo === 'vendedor';
  const isComprador = user && oferta && user.tipo === 'comprador';

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          <div className="flex items-center mb-6">
            <button 
              onClick={() => navigate(-1)} 
              className="mr-4 text-blue-600 hover:text-blue-800"
            >
              &larr; Voltar
            </button>
            <h1 className="text-2xl font-bold text-gray-800">Detalhes da Oferta</h1>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          ) : oferta ? (
            <div className="space-y-6">
              {/* Cabeçalho com status */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800 mb-2">
                      Oferta para o Processo {oferta.processo.numero}
                    </h2>
                    <p className="text-gray-600">
                      {oferta.processo.titulo}
                    </p>
                  </div>
                  <div className="text-right">
                    {formatarStatusOferta(oferta.status) && (
                      <span className={`px-3 py-1 inline-flex text-sm font-semibold rounded-full ${formatarStatusOferta(oferta.status).color} ${formatarStatusOferta(oferta.status).textColor}`}>
                        {formatarStatusOferta(oferta.status).label}
                      </span>
                    )}
                    <p className="text-gray-500 mt-2">
                      Enviada em {formatarData(oferta.dataCriacao)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Detalhes da oferta e do processo */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">
                    Informações da Oferta
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Valor Ofertado:</span>
                      <span className="font-semibold text-gray-900">{formatarMoeda(oferta.valor)}</span>
                    </div>
                    {oferta.processo.valorEstimado && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Valor Estimado do Processo:</span>
                        <span className="font-semibold text-gray-900">{formatarMoeda(oferta.processo.valorEstimado)}</span>
                      </div>
                    )}
                    {oferta.processo.valorEstimado && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Percentual da Oferta:</span>
                        <span className="font-semibold text-gray-900">
                          {Math.round((oferta.valor / oferta.processo.valorEstimado) * 100)}%
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-600">Data de Validade:</span>
                      <span className="font-semibold text-gray-900">{formatarData(oferta.dataValidade)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">{isVendedor ? 'Comprador:' : 'Vendedor:'}</span>
                      <span className="font-semibold text-gray-900">
                        {isVendedor ? oferta.comprador.nome : oferta.vendedor.nome}
                      </span>
                    </div>
                    {oferta.observacoes && (
                      <div className="mt-4">
                        <p className="text-gray-600 mb-1">Observações:</p>
                        <p className="text-gray-900 bg-gray-50 p-3 rounded">{oferta.observacoes}</p>
                      </div>
                    )}
                    {oferta.motivoRecusa && (
                      <div className="mt-4">
                        <p className="text-gray-600 mb-1">Motivo da Recusa:</p>
                        <p className="text-red-700 bg-red-50 p-3 rounded">{oferta.motivoRecusa}</p>
                      </div>
                    )}
                    {oferta.motivoCancelamento && (
                      <div className="mt-4">
                        <p className="text-gray-600 mb-1">Motivo do Cancelamento:</p>
                        <p className="text-orange-700 bg-orange-50 p-3 rounded">{oferta.motivoCancelamento}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">
                    Detalhes do Processo
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Número:</span>
                      <span className="font-semibold text-gray-900">{oferta.processo.numero}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tipo:</span>
                      <span className="font-semibold text-gray-900">{oferta.processo.tipo}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className="font-semibold text-gray-900">{oferta.processo.status}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tribunal:</span>
                      <span className="font-semibold text-gray-900">{oferta.processo.tribunal}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Vara:</span>
                      <span className="font-semibold text-gray-900">{oferta.processo.vara}</span>
                    </div>
                    <div className="mt-4">
                      <Link 
                        to={`/processos/${oferta.processo._id}`}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Ver detalhes completos do processo
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              {/* Ações */}
              {oferta.status === 'pendente' && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Ações
                  </h3>
                  <div className="flex space-x-4">
                    {isVendedor && (
                      <>
                        <button
                          onClick={() => abrirModal('aceitar')}
                          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                        >
                          Aceitar Oferta
                        </button>
                        <button
                          onClick={() => abrirModal('recusar')}
                          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                        >
                          Recusar Oferta
                        </button>
                      </>
                    )}
                    {isComprador && (
                      <button
                        onClick={() => abrirModal('cancelar')}
                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                      >
                        Cancelar Oferta
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Chat/Mensagens */}
              <div className="bg-white rounded-lg shadow">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Mensagens
                  </h3>
                </div>
                <div className="p-4">
                  <div className="h-64 overflow-y-auto mb-4 border rounded-lg p-3">
                    {mensagens.length > 0 ? (
                      <div className="space-y-3">
                        {mensagens.map((mensagem) => (
                          <div key={mensagem._id} className={`flex ${mensagem.autor._id === user._id ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-3/4 rounded-lg p-3 ${
                              mensagem.autor._id === user._id 
                                ? 'bg-blue-100 text-blue-900' 
                                : 'bg-gray-100 text-gray-900'
                            }`}>
                              <div className="text-sm mb-1">
                                <span className="font-semibold">{mensagem.autor.nome}</span>
                                <span className="text-xs text-gray-500 ml-2">
                                  {formatarData(mensagem.dataCriacao, true)}
                                </span>
                              </div>
                              <p>{mensagem.texto}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-500">
                        Nenhuma mensagem enviada ainda.
                      </div>
                    )}
                  </div>

                  {oferta.status === 'pendente' && (
                    <form onSubmit={enviarMensagem} className="flex items-end">
                      <div className="flex-grow mr-2">
                        <textarea
                          value={novaMensagem}
                          onChange={(e) => setNovaMensagem(e.target.value)}
                          placeholder="Digite sua mensagem aqui..."
                          className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                          rows={3}
                        ></textarea>
                      </div>
                      <button
                        type="submit"
                        disabled={enviandoMensagem || !novaMensagem.trim()}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {enviandoMensagem ? 'Enviando...' : 'Enviar'}
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Oferta não encontrada
              </h3>
              <p className="text-gray-500 mb-4">
                A oferta que você está procurando não existe ou você não tem permissão para visualizá-la.
              </p>
              <button
                onClick={() => navigate(-1)}
                className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Voltar
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Ação */}
      {modalVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              {modalTipo === 'aceitar' && 'Aceitar Oferta'}
              {modalTipo === 'recusar' && 'Recusar Oferta'}
              {modalTipo === 'cancelar' && 'Cancelar Oferta'}
            </h3>
            
            <div className="mb-4">
              {modalTipo === 'aceitar' && (
                <p className="text-gray-600">
                  Ao aceitar esta oferta, você estará iniciando uma transação com o comprador. Deseja continuar?
                </p>
              )}
              {modalTipo === 'recusar' && (
                <p className="text-gray-600">
                  Por favor, informe o motivo da recusa:
                </p>
              )}
              {modalTipo === 'cancelar' && (
                <p className="text-gray-600">
                  Tem certeza que deseja cancelar esta oferta? Se desejar, informe o motivo:
                </p>
              )}
              
              {(modalTipo === 'recusar' || modalTipo === 'cancelar') && (
                <textarea
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  placeholder="Informe o motivo..."
                  className="w-full p-2 border border-gray-300 rounded mt-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                  required={modalTipo === 'recusar'}
                ></textarea>
              )}
              
              {modalTipo === 'aceitar' && (
                <textarea
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  placeholder="Comentário adicional (opcional)..."
                  className="w-full p-2 border border-gray-300 rounded mt-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                ></textarea>
              )}
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={fecharModal}
                className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-100"
                disabled={processandoAcao}
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  if (modalTipo === 'aceitar') aceitarOferta();
                  if (modalTipo === 'recusar') recusarOferta();
                  if (modalTipo === 'cancelar') cancelarOferta();
                }}
                className={`px-4 py-2 rounded text-white ${
                  modalTipo === 'aceitar' 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-red-600 hover:bg-red-700'
                }`}
                disabled={processandoAcao || (modalTipo === 'recusar' && !motivo.trim())}
              >
                {processandoAcao ? 'Processando...' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OfertaDetails;