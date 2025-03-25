import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Sidebar from '../components/Sidebar';
import { authService as userService } from '../services/api';
import { formatarCPFCNPJ } from '../utils/formatters';

const Profile = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    cpfCnpj: '',
    chavePix: '',
    banco: '',
    agencia: '',
    conta: '',
    tipo: ''
  });
  const [senhaForm, setSenhaForm] = useState({
    senhaAtual: '',
    novaSenha: '',
    confirmacaoSenha: ''
  });

  // Carregar dados do usuário ao montar o componente
  useEffect(() => {
    if (user) {
      carregarDadosUsuario();
    }
  }, [user]);

  const carregarDadosUsuario = async () => {
    try {
      const dadosCompletos = await userService.getProfile();
      setFormData({
        nome: dadosCompletos.nome || '',
        email: dadosCompletos.email || '',
        telefone: dadosCompletos.telefone || '',
        cpfCnpj: dadosCompletos.cpfCnpj || '',
        chavePix: dadosCompletos.chavePix || '',
        banco: dadosCompletos.banco || '',
        agencia: dadosCompletos.agencia || '',
        conta: dadosCompletos.conta || '',
        tipo: dadosCompletos.tipo || ''
      });
    } catch (error) {
      console.error('Erro ao carregar dados do perfil:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSenhaInputChange = (e) => {
    const { name, value } = e.target;
    setSenhaForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const atualizarPerfil = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await userService.atualizarPerfil(formData);
      setEditMode(false);
      // Recarregar dados após atualização
      await carregarDadosUsuario();
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
    } finally {
      setLoading(false);
    }
  };

  const alterarSenha = async (e) => {
    e.preventDefault();
    
    // Validação básica de senha
    if (senhaForm.novaSenha !== senhaForm.confirmacaoSenha) {
      alert('As senhas não coincidem');
      return;
    }

    setLoading(true);
    try {
      await userService.alterarSenha({
        senhaAtual: senhaForm.senhaAtual,
        novaSenha: senhaForm.novaSenha
      });
      
      // Limpar campos após sucesso
      setSenhaForm({
        senhaAtual: '',
        novaSenha: '',
        confirmacaoSenha: ''
      });
      
      alert('Senha alterada com sucesso');
    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      alert('Erro ao alterar senha. Verifique seus dados.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) {
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">
              Meu Perfil
            </h1>
            <div className="space-x-2">
              {!editMode ? (
                <button
                  onClick={() => setEditMode(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Editar Perfil
                </button>
              ) : (
                <button
                  onClick={() => setEditMode(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                >
                  Cancelar
                </button>
              )}
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Sair
              </button>
            </div>
          </div>

          {/* Informações Principais do Perfil */}
          <div className="bg-white rounded-lg shadow mb-6">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800">
                Dados Pessoais
              </h2>
            </div>
            <form onSubmit={atualizarPerfil} className="p-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome Completo
                  </label>
                  <input
                    type="text"
                    name="nome"
                    value={formData.nome}
                    onChange={handleInputChange}
                    disabled={!editMode}
                    className={`w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 
                      ${!editMode ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    E-mail
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={!editMode}
                    className={`w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 
                      ${!editMode ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    CPF/CNPJ
                  </label>
                  <input
                    type="text"
                    name="cpfCnpj"
                    value={formatarCPFCNPJ(formData.cpfCnpj)}
                    onChange={handleInputChange}
                    disabled
                    className="w-full p-2 border border-gray-300 rounded bg-gray-100 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Telefone
                  </label>
                  <input
                    type="tel"
                    name="telefone"
                    value={formData.telefone}
                    onChange={handleInputChange}
                    disabled={!editMode}
                    className={`w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 
                      ${!editMode ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                  />
                </div>
              </div>
              
              {editMode && (
                <div className="mt-6 text-right">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? 'Salvando...' : 'Salvar Alterações'}
                  </button>
                </div>
              )}
            </form>
          </div>

          {/* Informações Bancárias */}
          <div className="bg-white rounded-lg shadow mb-6">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800">
                Dados Bancários
              </h2>
            </div>
            <div className="p-6 grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Chave Pix
                </label>
                <input
                  type="text"
                  name="chavePix"
                  value={formData.chavePix}
                  onChange={handleInputChange}
                  disabled={!editMode}
                  className={`w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 
                    ${!editMode ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Banco
                </label>
                <input
                  type="text"
                  name="banco"
                  value={formData.banco}
                  onChange={handleInputChange}
                  disabled={!editMode}
                  className={`w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 
                    ${!editMode ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Agência
                </label>
                <input
                  type="text"
                  name="agencia"
                  value={formData.agencia}
                  onChange={handleInputChange}
                  disabled={!editMode}
                  className={`w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 
                    ${!editMode ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Conta
                </label>
                <input
                  type="text"
                  name="conta"
                  value={formData.conta}
                  onChange={handleInputChange}
                  disabled={!editMode}
                  className={`w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 
                    ${!editMode ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                />
              </div>
            </div>
          </div>

          {/* Alterar Senha */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800">
                Alterar Senha
              </h2>
            </div>
            <form onSubmit={alterarSenha} className="p-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Senha Atual
                  </label>
                  <input
                    type="password"
                    name="senhaAtual"
                    value={senhaForm.senhaAtual}
                    onChange={handleSenhaInputChange}
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nova Senha
                  </label>
                  <input
                    type="password"
                    name="novaSenha"
                    value={senhaForm.novaSenha}
                    onChange={handleSenhaInputChange}
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    minLength="8"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirmar Nova Senha
                  </label>
                  <input
                    type="password"
                    name="confirmacaoSenha"
                    value={senhaForm.confirmacaoSenha}
                    onChange={handleSenhaInputChange}
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    minLength="8"
                  />
                </div>
              </div>
              <div className="mt-6 text-right">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Alterando...' : 'Alterar Senha'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;