import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Stepper from '../components/Stepper';
import { processoService } from '../services/api';
import { formatarMoeda } from '../utils/formatters';

const ProcessForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;
  
  // Etapas do formulário
  const steps = [
    { title: 'Dados do Processo' },
    { title: 'Documentos' },
    { title: 'Valores e Expectativas' },
    { title: 'Revisão' }
  ];
  
  // Estados para controle do formulário
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  // Estado para dados do processo
  const [processoData, setProcessoData] = useState({
    numero: '',
    tipo: '',
    tribunal: '',
    vara: '',
    cidade: '',
    estado: '',
    fase: '',
    valorCausa: '',
    valorEstimado: '',
    descricao: '',
    expectativaRecebimento: 'incerto',
    valorMinimo: '',
    isConfidencial: false
  });
  
  // Estado para documentos
  const [documentos, setDocumentos] = useState([]);
  const [uploadingDocuments, setUploadingDocuments] = useState(false);
  const [documentosProgress, setDocumentosProgress] = useState(0);
  
  // Carregar dados do processo se estiver editando
  useEffect(() => {
    if (isEditing) {
      const fetchProcesso = async () => {
        try {
          setLoading(true);
          setError(null);
          
          const response = await processoService.obterDetalhes(id);
          
          // Converter valores numéricos para string para o formulário
          const processo = response.processo;
          processo.valorCausa = processo.valorCausa?.toString() || '';
          processo.valorEstimado = processo.valorEstimado?.toString() || '';
          processo.valorMinimo = processo.valorMinimo?.toString() || '';
          
          setProcessoData(processo);
          setDocumentos(processo.documentos || []);
          
          // Definir a etapa inicial com base no status do processo
          if (processo.status === 'pendente' && processo.documentos?.length === 0) {
            setCurrentStep(1); // Ir para a etapa de documentos
          } else if (processo.status === 'pendente' && !processo.valorEstimado) {
            setCurrentStep(2); // Ir para a etapa de valores
          } else {
            setCurrentStep(0); // Começar na primeira etapa
          }
          
        } catch (err) {
          console.error('Erro ao buscar dados do processo:', err);
          setError('Não foi possível carregar os dados do processo. Tente novamente mais tarde.');
        } finally {
          setLoading(false);
        }
      };
      
      fetchProcesso();
    }
  }, [id, isEditing]);
  
  // Manipulador de mudança de campos do formulário
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProcessoData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  // Função para avançar para a próxima etapa
  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0);
    }
  };
  
  // Função para voltar para a etapa anterior
  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      window.scrollTo(0, 0);
    }
  };
  
  // Função para upload de documentos
  const handleDocumentUpload = async (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length === 0) return;
    
    try {
      setUploadingDocuments(true);
      setDocumentosProgress(0);
      setError(null);
      
      // Criar FormData para upload
      const formData = new FormData();
      files.forEach(file => {
        formData.append('documentos', file);
      });
      
      // Simular progresso (na API real, isso seria tratado por eventos de progresso)
      const progressInterval = setInterval(() => {
        setDocumentosProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 300);
      
      // Fazer upload
      const response = await processoService.uploadDocumentos(id || processoData._id, formData);
      
      clearInterval(progressInterval);
      setDocumentosProgress(100);
      
      // Atualizar lista de documentos
      setDocumentos(response.processo.documentos);
      setProcessoData(prev => ({
        ...prev,
        _id: prev._id || response.processo._id // Salvar ID se for novo processo
      }));
      
      setTimeout(() => {
        setDocumentosProgress(0);
      }, 1000);
      
    } catch (err) {
      console.error('Erro ao fazer upload de documentos:', err);
      setError('Falha ao enviar documentos. Verifique o tamanho e formato dos arquivos.');
    } finally {
      setUploadingDocuments(false);
    }
  };
  
  // Função para remover um documento
  const handleRemoveDocument = async (documentoId) => {
    if (!confirm('Tem certeza que deseja remover este documento?')) return;
    
    try {
      setError(null);
      
      await processoService.removerDocumento(id || processoData._id, documentoId);
      
      // Atualizar lista de documentos
      setDocumentos(prev => prev.filter(doc => doc._id !== documentoId));
      
    } catch (err) {
      console.error('Erro ao remover documento:', err);
      setError('Falha ao remover documento. Tente novamente mais tarde.');
    }
  };
  // Função para salvar dados do processo
  const saveProcessData = async (navigate = false) => {
    try {
      setSubmitting(true);
      setError(null);
      
      // Converter valores para número
      const dataToSend = {
        ...processoData,
        valorCausa: processoData.valorCausa ? parseFloat(processoData.valorCausa) : undefined,
        valorEstimado: processoData.valorEstimado ? parseFloat(processoData.valorEstimado) : undefined,
        valorMinimo: processoData.valorMinimo ? parseFloat(processoData.valorMinimo) : undefined
      };
      
      let response;
      
      if (isEditing) {
        response = await processoService.atualizar(id, dataToSend);
      } else {
        response = await processoService.cadastrar(dataToSend);
      }
      
      // Atualizar dados do processo
      setProcessoData(prev => ({
        ...prev,
        _id: prev._id || response.processo._id // Salvar ID se for novo processo
      }));
      
      setSuccess(true);
      
      // Navegar para próxima etapa ou página de detalhes
      if (navigate) {
        window.location.href = `/processos/${id || response.processo._id}`;
      }
      
      return response.processo;
      
    } catch (err) {
      console.error('Erro ao salvar dados do processo:', err);
      setError(err.response?.data?.error || 'Falha ao salvar dados do processo. Tente novamente mais tarde.');
      return null;
    } finally {
      setSubmitting(false);
    }
  };
  
  // Função para enviar o formulário
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (currentStep < steps.length - 1) {
      // Se não estiver na última etapa, salvar e avançar
      const saved = await saveProcessData();
      if (saved) {
        nextStep();
      }
    } else {
      // Na última etapa, salvar e navegar para a página de detalhes
      await saveProcessData(true);
    }
  };
  
  // Validar se pode avançar para a próxima etapa
  const canAdvance = () => {
    switch (currentStep) {
      case 0: // Dados do Processo
        return (
          processoData.numero &&
          processoData.tipo &&
          processoData.tribunal &&
          processoData.fase &&
          processoData.valorCausa &&
          processoData.descricao
        );
      case 1: // Documentos
        return documentos.length > 0;
      case 2: // Valores e Expectativas
        return (
          processoData.valorEstimado &&
          processoData.expectativaRecebimento
        );
      case 3: // Revisão
        return true;
      default:
        return false;
    }
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
  
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">
            {isEditing ? 'Editar Processo' : 'Cadastrar Novo Processo'}
          </h1>
          
          {/* Stepper */}
          <div className="mb-8">
            <Stepper steps={steps} currentStep={currentStep} />
          </div>
          
          {/* Mensagens de erro e sucesso */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              <p>{error}</p>
            </div>
          )}
          
          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              <p>Dados salvos com sucesso!</p>
            </div>
          )}
          
          {/* Formulário */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <form onSubmit={handleSubmit}>
              {/* Etapa 1: Dados do Processo */}
              {currentStep === 0 && (
                <div className="p-6">
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">Dados do Processo</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="numero" className="block text-gray-700 text-sm font-bold mb-2">
                        Número do Processo *
                      </label>
                      <input
                        type="text"
                        id="numero"
                        name="numero"
                        value={processoData.numero}
                        onChange={handleChange}
                        placeholder="0000000-00.0000.0.00.0000"
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        required
                      />
                      <p className="text-gray-500 text-xs mt-1">
                        Digite no formato CNJ (ex: 0000000-00.0000.0.00.0000)
                      </p>
                    </div>
                    
                    <div>
                      <label htmlFor="tipo" className="block text-gray-700 text-sm font-bold mb-2">
                        Tipo de Processo *
                      </label>
                      <select
                        id="tipo"
                        name="tipo"
                        value={processoData.tipo}
                        onChange={handleChange}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        required
                      >
                        <option value="" disabled>Selecione o tipo</option>
                        <option value="trabalhista">Trabalhista</option>
                        <option value="civel">Cível</option>
                        <option value="previdenciario">Previdenciário</option>
                        <option value="tributario">Tributário</option>
                        <option value="consumidor">Direito do Consumidor</option>
                        <option value="outro">Outro</option>
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="tribunal" className="block text-gray-700 text-sm font-bold mb-2">
                        Tribunal *
                      </label>
                      <select
                        id="tribunal"
                        name="tribunal"
                        value={processoData.tribunal}
                        onChange={handleChange}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        required
                      >
                        <option value="" disabled>Selecione o tribunal</option>
                        <option value="TJSP">TJSP - Tribunal de Justiça de São Paulo</option>
                        <option value="TJRJ">TJRJ - Tribunal de Justiça do Rio de Janeiro</option>
                        <option value="TJMG">TJMG - Tribunal de Justiça de Minas Gerais</option>
                        <option value="TRT2">TRT2 - Tribunal Regional do Trabalho 2ª Região</option>
                        <option value="TRT15">TRT15 - Tribunal Regional do Trabalho 15ª Região</option>
                        <option value="TRF3">TRF3 - Tribunal Regional Federal 3ª Região</option>
                        <option value="outro">Outro</option>
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="fase" className="block text-gray-700 text-sm font-bold mb-2">
                        Fase Processual *
                      </label>
                      <select
                        id="fase"
                        name="fase"
                        value={processoData.fase}
                        onChange={handleChange}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        required
                      >
                        <option value="" disabled>Selecione a fase</option>
                        <option value="conhecimento">Conhecimento</option>
                        <option value="sentenca">Sentença</option>
                        <option value="recursos">Recursos</option>
                        <option value="transitoJulgado">Trânsito em Julgado</option>
                        <option value="cumprimentoSentenca">Cumprimento de Sentença</option>
                        <option value="execucao">Execução</option>
                        <option value="precatorio">Precatório/RPV</option>
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="vara" className="block text-gray-700 text-sm font-bold mb-2">
                        Vara
                      </label>
                      <input
                        type="text"
                        id="vara"
                        name="vara"
                        value={processoData.vara}
                        onChange={handleChange}
                        placeholder="Ex: 3ª Vara Cível"
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="valorCausa" className="block text-gray-700 text-sm font-bold mb-2">
                        Valor da Causa *
                      </label>
                      <input
                        type="number"
                        id="valorCausa"
                        name="valorCausa"
                        value={processoData.valorCausa}
                        onChange={handleChange}
                        placeholder="R$ 0,00"
                        min="0"
                        step="0.01"
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="cidade" className="block text-gray-700 text-sm font-bold mb-2">
                        Cidade
                      </label>
                      <input
                        type="text"
                        id="cidade"
                        name="cidade"
                        value={processoData.cidade}
                        onChange={handleChange}
                        placeholder="Ex: São Paulo"
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="estado" className="block text-gray-700 text-sm font-bold mb-2">
                        Estado
                      </label>
                      <select
                        id="estado"
                        name="estado"
                        value={processoData.estado}
                        onChange={handleChange}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      >
                        <option value="">Selecione o estado</option>
                        <option value="AC">Acre</option>
                        <option value="AL">Alagoas</option>
                        <option value="AP">Amapá</option>
                        <option value="AM">Amazonas</option>
                        <option value="BA">Bahia</option>
                        <option value="CE">Ceará</option>
                        <option value="DF">Distrito Federal</option>
                        <option value="ES">Espírito Santo</option>
                        <option value="GO">Goiás</option>
                        <option value="MA">Maranhão</option>
                        <option value="MT">Mato Grosso</option>
                        <option value="MS">Mato Grosso do Sul</option>
                        <option value="MG">Minas Gerais</option>
                        <option value="PA">Pará</option>
                        <option value="PB">Paraíba</option>
                        <option value="PR">Paraná</option>
                        <option value="PE">Pernambuco</option>
                        <option value="PI">Piauí</option>
                        <option value="RJ">Rio de Janeiro</option>
                        <option value="RN">Rio Grande do Norte</option>
                        <option value="RS">Rio Grande do Sul</option>
                        <option value="RO">Rondônia</option>
                        <option value="RR">Roraima</option>
                        <option value="SC">Santa Catarina</option>
                        <option value="SP">São Paulo</option>
                        <option value="SE">Sergipe</option>
                        <option value="TO">Tocantins</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <label htmlFor="descricao" className="block text-gray-700 text-sm font-bold mb-2">
                      Descrição do Processo *
                    </label>
                    <textarea
                      id="descricao"
                      name="descricao"
                      value={processoData.descricao}
                      onChange={handleChange}
                      placeholder="Descreva o objeto do processo, seus principais pontos e qualquer informação relevante..."
                      rows="6"
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      required
                    />
                  </div>
                </div>
              )}
              
              {/* Etapa 2: Documentos */}
              {currentStep === 1 && (
                <div className="p-6">
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">Documentos do Processo</h2>
                  
                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-yellow-700">
                          Anexe documentos relevantes do processo (petições, decisões, laudos, etc). Formatos aceitos: PDF, DOC, DOCX, JPG, PNG.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Upload de documentos */}
                  <div className="mb-6">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Adicionar Documentos
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <input
                        type="file"
                        id="documentos"
                        multiple
                        onChange={handleDocumentUpload}
                        className="hidden"
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        disabled={uploadingDocuments || !processoData._id}
                      />
                      <label
                        htmlFor="documentos"
                        className={`flex flex-col items-center justify-center cursor-pointer ${
                          uploadingDocuments || !processoData._id ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                          <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4h-12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <span className="mt-2 block text-sm font-medium text-gray-900">
                          {uploadingDocuments 
                            ? 'Enviando documentos...' 
                            : !processoData._id 
                              ? 'Salve os dados do processo primeiro'
                              : 'Clique para selecionar arquivos'}
                        </span>
                        <span className="mt-1 block text-xs text-gray-500">
                          PNG, JPG, PDF, DOC até 10MB
                        </span>
                      </label>
                    </div>
                    
                    {/* Barra de progresso */}
                    {documentosProgress > 0 && (
                      <div className="mt-4">
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div 
                            className="bg-blue-600 h-2.5 rounded-full" 
                            style={{ width: `${documentosProgress}%` }}
                          ></div>
                        </div>
                        <p className="text-sm text-gray-500 mt-1 text-right">{documentosProgress}%</p>
                      </div>
                    )}
                  </div>
                  
                  {/* Lista de documentos */}
                  {documentos.length > 0 ? (
                    <div>
                      <h3 className="font-medium text-gray-700 mb-3">Documentos Adicionados</h3>
                      <div className="space-y-3">
                        {documentos.map((doc, index) => (
                          <div key={doc._id || index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border">
                            <div className="flex items-center">
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
                              <div>
                                <p className="text-sm font-medium text-gray-900">{doc.nome}</p>
                                <p className="text-xs text-gray-500">{(doc.tamanho / 1024).toFixed(2)} KB</p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveDocument(doc._id)}
                              className="text-red-600 hover:text-red-800"
                              disabled={uploadingDocuments}
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-gray-500">Nenhum documento adicionado ainda.</p>
                      <p className="text-sm text-gray-400 mt-1">Os documentos ajudam potenciais compradores a avaliarem seu processo.</p>
                    </div>
                  )}
                </div>
              )}
              
              {/* Etapa 3: Valores e Expectativas */}
              {currentStep === 2 && (
                <div className="p-6">
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">Valores e Expectativas</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="valorEstimado" className="block text-gray-700 text-sm font-bold mb-2">
                        Valor Estimado Atual *
                      </label>
                      <input
                        type="number"
                        id="valorEstimado"
                        name="valorEstimado"
                        value={processoData.valorEstimado}
                        onChange={handleChange}
                        placeholder="R$ 0,00"
                        min="0"
                        step="0.01"
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        required
                      />
                      <p className="text-gray-500 text-xs mt-1">
                        Valor atualizado com juros e correção monetária
                      </p>
                    </div>
                    
                    <div>
                      <label htmlFor="valorMinimo" className="block text-gray-700 text-sm font-bold mb-2">
                        Valor Mínimo Aceitável
                      </label>
                      <input
                        type="number"
                        id="valorMinimo"
                        name="valorMinimo"
                        value={processoData.valorMinimo}
                        onChange={handleChange}
                        placeholder="R$ 0,00"
                        min="0"
                        step="0.01"
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      />
                      {processoData.valorEstimado && processoData.valorMinimo && (
                        <p className="text-gray-500 text-xs mt-1">
                          Deságio de {((1 - parseFloat(processoData.valorMinimo) / parseFloat(processoData.valorEstimado)) * 100).toFixed(1)}%
                        </p>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="expectativaRecebimento" className="block text-gray-700 text-sm font-bold mb-2">
                        Expectativa de Recebimento *
                      </label>
                      <select
                        id="expectativaRecebimento"
                        name="expectativaRecebimento"
                        value={processoData.expectativaRecebimento}
                        onChange={handleChange}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        required
                      >
                        <option value="6">Menos de 6 meses</option>
                        <option value="12">6 a 12 meses</option>
                        <option value="24">12 a 24 meses</option>
                        <option value="36">24 a 36 meses</option>
                        <option value="48">Mais de 36 meses</option>
                        <option value="incerto">Incerto</option>
                      </select>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="isConfidencial"
                        name="isConfidencial"
                        checked={processoData.isConfidencial}
                        onChange={handleChange}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label htmlFor="isConfidencial" className="ml-2 block text-sm text-gray-900">
                        Manter informações confidenciais
                      </label>
                    </div>
                  </div>
                  
                  <div className="mt-6 bg-yellow-50 border-l-4 border-yellow-400 p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-yellow-700">
                          <strong>Dica:</strong> Definir um valor mínimo aceitável aumenta suas chances de receber ofertas. Se optar por manter informações confidenciais, certos detalhes do processo só serão revelados para compradores que fizerem ofertas.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Etapa 4: Revisão */}
              {currentStep === 3 && (
                <div className="p-6">
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">Revisão do Processo</h2>
                  
                  <div className="bg-gray-50 rounded-lg p-6 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Número do Processo</h3>
                        <p className="mt-1 text-gray-900">{processoData.numero}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Tipo de Processo</h3>
                        <p className="mt-1 text-gray-900">
                          {processoData.tipo === 'trabalhista' && 'Trabalhista'}
                          {processoData.tipo === 'civel' && 'Cível'}
                          {processoData.tipo === 'previdenciario' && 'Previdenciário'}
                          {processoData.tipo === 'tributario' && 'Tributário'}
                          {processoData.tipo === 'consumidor' && 'Direito do Consumidor'}
                          {processoData.tipo === 'outro' && 'Outro'}
                        </p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Tribunal</h3>
                        <p className="mt-1 text-gray-900">{processoData.tribunal}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Fase Processual</h3>
                        <p className="mt-1 text-gray-900">
                          {processoData.fase === 'conhecimento' && 'Conhecimento'}
                          {processoData.fase === 'sentenca' && 'Sentença'}
                          {processoData.fase === 'recursos' && 'Recursos'}
                          {processoData.fase === 'transitoJulgado' && 'Trânsito em Julgado'}
                          {processoData.fase === 'cumprimentoSentenca' && 'Cumprimento de Sentença'}
                          {processoData.fase === 'execucao' && 'Execução'}
                          {processoData.fase === 'precatorio' && 'Precatório/RPV'}
                        </p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Vara</h3>
                        <p className="mt-1 text-gray-900">{processoData.vara || 'Não informado'}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Cidade/Estado</h3>
                        <p className="mt-1 text-gray-900">
                          {processoData.cidade ? `${processoData.cidade}/${processoData.estado}` : 'Não informado'}
                        </p>
                      </div>
                      
                      <div className="md:col-span-2">
                        <h3 className="text-sm font-medium text-gray-500">Valor da Causa</h3>
                        <p className="mt-1 text-gray-900">{formatarMoeda(parseFloat(processoData.valorCausa) || 0)}</p>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Valor Estimado Atual</h3>
                        <p className="mt-1 text-gray-900 font-bold">{formatarMoeda(parseFloat(processoData.valorEstimado) || 0)}</p>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Valor Mínimo Aceitável</h3>
                        <p className="mt-1 text-gray-900">
                          {processoData.valorMinimo ? formatarMoeda(parseFloat(processoData.valorMinimo)) : 'Não definido'}
                        </p>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Expectativa de Recebimento</h3>
                        <p className="mt-1 text-gray-900">
                          {processoData.expectativaRecebimento === '6' && 'Menos de 6 meses'}
                          {processoData.expectativaRecebimento === '12' && '6 a 12 meses'}
                          {processoData.expectativaRecebimento === '24' && '12 a 24 meses'}
                          {processoData.expectativaRecebimento === '36' && '24 a 36 meses'}
                          {processoData.expectativaRecebimento === '48' && 'Mais de 36 meses'}
                          {processoData.expectativaRecebimento === 'incerto' && 'Incerto'}
                        </p>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Confidencialidade</h3>
                        <p className="mt-1 text-gray-900">
                          {processoData.isConfidencial ? 'Informações confidenciais' : 'Dados públicos'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-6">
                      <h3 className="text-sm font-medium text-gray-500">Descrição do Processo</h3>
                      <p className="mt-1 text-gray-900 whitespace-pre-line">{processoData.descricao}</p>
                    </div>
                    
                    <div className="mt-6">
                      <h3 className="text-sm font-medium text-gray-500">Documentos Anexados</h3>
                      <p className="mt-1 text-gray-900">{documentos.length} documento(s)</p>
                    </div>
                  </div>
                  
                  <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-6">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-green-700">
                          <strong>Quase pronto!</strong> Revise as informações acima antes de finalizar o cadastro do seu processo. Após a publicação, seu processo será avaliado e disponibilizado para receber ofertas.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Botões de navegação */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between">
                {currentStep > 0 ? (
                  <button
                    type="button"
                    onClick={prevStep}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                  >
                    Voltar
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                  >
                    Cancelar
                  </button>
                )}
                
                <button
                  type="submit"
                  disabled={submitting || !canAdvance()}
                  className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none ${
                    (submitting || !canAdvance()) ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {submitting ? 'Salvando...' : currentStep < steps.length - 1 ? 'Próximo' : 'Finalizar Cadastro'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProcessForm;