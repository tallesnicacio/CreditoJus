import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    confirmarSenha: '',
    tipo: 'vendedor', // Default para vendedor
    cpfCnpj: '',
    telefone: ''
  });

  const [vendedorFields, setVendedorFields] = useState({
    dataNascimento: '',
    endereco: {
      logradouro: '',
      numero: '',
      complemento: '',
      bairro: '',
      cidade: '',
      estado: '',
      cep: ''
    }
  });

  const [compradorFields, setCompradorFields] = useState({
    razaoSocial: '',
    inscricaoOAB: '',
    areasAtuacao: []
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleVendedorChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setVendedorFields(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setVendedorFields(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleCompradorChange = (e) => {
    const { name, value } = e.target;
    setCompradorFields(prev => ({ ...prev, [name]: value }));
  };

  const handleAreasChange = (e) => {
    const { value, checked } = e.target;
    if (checked) {
      setCompradorFields(prev => ({
        ...prev,
        areasAtuacao: [...prev.areasAtuacao, value]
      }));
    } else {
      setCompradorFields(prev => ({
        ...prev,
        areasAtuacao: prev.areasAtuacao.filter(area => area !== value)
      }));
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validação básica
    if (formData.senha !== formData.confirmarSenha) {
      setError('As senhas não coincidem');
      return;
    }
    
    try {
      setError('');
      setLoading(true);
      
      // Montar dados do usuário
      const userData = {
        nome: formData.nome,
        email: formData.email,
        senha: formData.senha,
        tipo: formData.tipo,
        cpfCnpj: formData.cpfCnpj,
        telefone: formData.telefone
      };
      
      // Adicionar campos específicos
      if (formData.tipo === 'vendedor') {
        userData.vendedor = vendedorFields;
      } else {
        userData.comprador = compradorFields;
      }
      
      await register(userData);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Falha ao registrar conta. Verifique seus dados e tente novamente.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-gray-900">
            Crie sua conta na CreditoJus
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Ou{' '}
            <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
              acesse sua conta existente
            </Link>
          </p>
        </div>

        <div className="bg-white shadow rounded-lg p-6 sm:p-8">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              <p>{error}</p>
            </div>
          )}
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Tipo de usuário (switch) */}
            <div className="flex justify-center space-x-8">
              <label className={`
                inline-flex items-center p-3 cursor-pointer rounded-lg
                ${formData.tipo === 'vendedor' ? 'bg-blue-100 border-2 border-blue-500' : 'bg-gray-100 border border-gray-300'}
              `}>
                <input
                  type="radio"
                  name="tipo"
                  value="vendedor"
                  checked={formData.tipo === 'vendedor'}
                  onChange={handleChange}
                  className="hidden"
                />
                <span className="text-lg font-medium">Sou Vendedor</span>
                <span className="ml-2 text-sm text-gray-500">(Tenho um processo)</span>
              </label>
              
              <label className={`
                inline-flex items-center p-3 cursor-pointer rounded-lg
                ${formData.tipo === 'comprador' ? 'bg-blue-100 border-2 border-blue-500' : 'bg-gray-100 border border-gray-300'}
              `}>
                <input
                  type="radio"
                  name="tipo"
                  value="comprador"
                  checked={formData.tipo === 'comprador'}
                  onChange={handleChange}
                  className="hidden"
                />
                <span className="text-lg font-medium">Sou Comprador</span>
                <span className="ml-2 text-sm text-gray-500">(Sou advogado/escritório)</span>
              </label>
            </div>
            
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
              {/* Campos comuns */}
              <div>
                <label htmlFor="nome" className="block text-sm font-medium text-gray-700">
                  {formData.tipo === 'vendedor' ? 'Nome completo' : 'Nome do responsável'}*
                </label>
                <input
                  id="nome"
                  name="nome"
                  type="text"
                  required
                  value={formData.nome}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email*
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              
              <div>
                <label htmlFor="senha" className="block text-sm font-medium text-gray-700">
                  Senha*
                </label>
                <input
                  id="senha"
                  name="senha"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={formData.senha}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
                <p className="mt-1 text-xs text-gray-500">Mínimo de 8 caracteres, incluindo letras e números</p>
              </div>
              
              <div>
                <label htmlFor="confirmarSenha" className="block text-sm font-medium text-gray-700">
                  Confirmar senha*
                </label>
                <input
                  id="confirmarSenha"
                  name="confirmarSenha"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={formData.confirmarSenha}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              
              <div>
                <label htmlFor="cpfCnpj" className="block text-sm font-medium text-gray-700">
                  {formData.tipo === 'vendedor' ? 'CPF' : 'CNPJ'}*
                </label>
                <input
                  id="cpfCnpj"
                  name="cpfCnpj"
                  type="text"
                  required
                  value={formData.cpfCnpj}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder={formData.tipo === 'vendedor' ? '000.000.000-00' : '00.000.000/0000-00'}
                />
              </div>
              
              <div>
                <label htmlFor="telefone" className="block text-sm font-medium text-gray-700">
                  Telefone*
                </label>
                <input
                  id="telefone"
                  name="telefone"
                  type="tel"
                  required
                  value={formData.telefone}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="(00) 00000-0000"
                />
              </div>
              
              {/* Campos para vendedor */}
              {formData.tipo === 'vendedor' && (
                <>
                  <div>
                    <label htmlFor="dataNascimento" className="block text-sm font-medium text-gray-700">
                      Data de nascimento
                    </label>
                    <input
                      id="dataNascimento"
                      name="dataNascimento"
                      type="date"
                      value={vendedorFields.dataNascimento}
                      onChange={handleVendedorChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                  
                  <div className="sm:col-span-2">
                    <div className="text-sm font-medium text-gray-700 mb-2">Endereço</div>
                    <div className="grid grid-cols-1 gap-y-3 gap-x-4 sm:grid-cols-6">
                      <div className="sm:col-span-4">
                        <label htmlFor="endereco.logradouro" className="block text-xs text-gray-700">
                          Logradouro
                        </label>
                        <input
                          id="endereco.logradouro"
                          name="endereco.logradouro"
                          type="text"
                          value={vendedorFields.endereco.logradouro}
                          onChange={handleVendedorChange}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                      </div>
                      
                      <div className="sm:col-span-2">
                        <label htmlFor="endereco.numero" className="block text-xs text-gray-700">
                          Número
                        </label>
                        <input
                          id="endereco.numero"
                          name="endereco.numero"
                          type="text"
                          value={vendedorFields.endereco.numero}
                          onChange={handleVendedorChange}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                      </div>
                      
                      <div className="sm:col-span-3">
                        <label htmlFor="endereco.complemento" className="block text-xs text-gray-700">
                          Complemento
                        </label>
                        <input
                          id="endereco.complemento"
                          name="endereco.complemento"
                          type="text"
                          value={vendedorFields.endereco.complemento}
                          onChange={handleVendedorChange}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                      </div>
                      
                      <div className="sm:col-span-3">
                        <label htmlFor="endereco.bairro" className="block text-xs text-gray-700">
                          Bairro
                        </label>
                        <input
                          id="endereco.bairro"
                          name="endereco.bairro"
                          type="text"
                          value={vendedorFields.endereco.bairro}
                          onChange={handleVendedorChange}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                      </div>
                      
                      <div className="sm:col-span-2">
                        <label htmlFor="endereco.cidade" className="block text-xs text-gray-700">
                          Cidade
                        </label>
                        <input
                          id="endereco.cidade"
                          name="endereco.cidade"
                          type="text"
                          value={vendedorFields.endereco.cidade}
                          onChange={handleVendedorChange}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                      </div>
                      
                      <div className="sm:col-span-2">
                        <label htmlFor="endereco.estado" className="block text-xs text-gray-700">
                          Estado
                        </label>
                        <select
                          id="endereco.estado"
                          name="endereco.estado"
                          value={vendedorFields.endereco.estado}
                          onChange={handleVendedorChange}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        >
                          <option value="">Selecione</option>
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
                      
                      <div className="sm:col-span-2">
                        <label htmlFor="endereco.cep" className="block text-xs text-gray-700">
                          CEP
                        </label>
                        <input
                          id="endereco.cep"
                          name="endereco.cep"
                          type="text"
                          value={vendedorFields.endereco.cep}
                          onChange={handleVendedorChange}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          placeholder="00000-000"
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}
              
              {/* Campos para comprador */}
              {formData.tipo === 'comprador' && (
                <>
                  <div>
                    <label htmlFor="razaoSocial" className="block text-sm font-medium text-gray-700">
                      Razão Social*
                    </label>
                    <input
                      id="razaoSocial"
                      name="razaoSocial"
                      type="text"
                      required={formData.tipo === 'comprador'}
                      value={compradorFields.razaoSocial}
                      onChange={handleCompradorChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="inscricaoOAB" className="block text-sm font-medium text-gray-700">
                      Número de inscrição na OAB
                    </label>
                    <input
                      id="inscricaoOAB"
                      name="inscricaoOAB"
                      type="text"
                      value={compradorFields.inscricaoOAB}
                      onChange={handleCompradorChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                  
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Áreas de atuação
                    </label>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      {[
                        { id: 'trabalhista', label: 'Trabalhista' },
                        { id: 'civel', label: 'Cível' },
                        { id: 'previdenciario', label: 'Previdenciário' },
                        { id: 'tributario', label: 'Tributário' },
                        { id: 'consumidor', label: 'Direito do Consumidor' },
                        { id: 'outro', label: 'Outro' }
                      ].map(area => (
                        <div key={area.id} className="flex items-start">
                          <div className="flex items-center h-5">
                            <input
                              id={`area-${area.id}`}
                              name={`area-${area.id}`}
                              type="checkbox"
                              value={area.id}
                              checked={compradorFields.areasAtuacao.includes(area.id)}
                              onChange={handleAreasChange}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                          </div>
                          <div className="ml-3 text-sm">
                            <label htmlFor={`area-${area.id}`} className="text-gray-700">
                              {area.label}
                            </label>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="flex items-center">
              <input
                id="termos"
                name="termos"
                type="checkbox"
                required
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="termos" className="ml-2 block text-sm text-gray-900">
                Concordo com os{' '}
                <a href="#" className="text-blue-600 hover:text-blue-500">
                  Termos de Serviço
                </a>{' '}
                e a{' '}
                <a href="#" className="text-blue-600 hover:text-blue-500">
                  Política de Privacidade
                </a>
              </label>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  loading ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {loading ? 'Criando conta...' : 'Criar conta'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;