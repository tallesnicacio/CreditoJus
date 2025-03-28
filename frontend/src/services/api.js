import axios from 'axios';

// Criar uma instância do axios com configurações base
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // Adiciona timeout de 10 segundos
});

// Função para limpar dados de autenticação
const limparDadosAutenticacao = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
  window.location.href = '/login';
};

// Interceptador para adicionar o token de autenticação em todas as requisições
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptador para tratamento de erros de resposta
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Tratamento de erro 401 (não autorizado)
    if (error.response && error.response.status === 401) {
      // Evitar loop infinito de refresh
      if (originalRequest._retry) {
        limparDadosAutenticacao();
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        
        if (!refreshToken) {
          throw new Error('Refresh token não encontrado');
        }
        
        // Fazer requisição para renovar o token
        const response = await axios.post(
          `${api.defaults.baseURL}/auth/refresh-token`,
          { refreshToken }
        );
        
        // Armazenar os novos tokens
        const { token, refreshToken: newRefreshToken } = response.data;
        localStorage.setItem('token', token);
        localStorage.setItem('refreshToken', newRefreshToken);
        
        // Atualizar o token no cabeçalho da requisição original
        originalRequest.headers.Authorization = `Bearer ${token}`;
        
        // Repetir a requisição original
        return api(originalRequest);
      } catch (refreshError) {
        // Se falhar ao renovar o token, desloga o usuário
        limparDadosAutenticacao();
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

// Serviços de autenticação
export const authService = {
  async login(email, senha) {
    try {
      const response = await api.post('/auth/login', { email, senha });
      
      // Armazenar dados de autenticação
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      localStorage.setItem('user', JSON.stringify(response.data.usuario));
      
      return response.data;
    } catch (error) {
      console.error('Erro de login:', error.response?.data || error.message);
      throw error;
    }
  },
  
  async register(userData) {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
  
  async forgotPassword(email) {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },
  
  async resetPassword(token, novaSenha) {
    const response = await api.post('/auth/reset-password', { token, novaSenha });
    return response.data;
  },
  
  async getProfile() {
    const response = await api.get('/auth/me');
    return response.data;
  },
  
  async updateProfile(userData) {
    const response = await api.put('/auth/me', userData);
    return response.data;
  }
};

// Serviços de processos
export const datajudService = {
  async buscarProcessoPorNumero(numeroProcesso) {
    try {
      const response = await api.get(`/datajud/processo/${numeroProcesso}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar processo:', error);
      throw error;
    }
  },
  
  async buscarProcessosPorCPF(cpf) {
    try {
      const response = await api.get(`/datajud/processos-cpf/${cpf}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar processos por CPF:', error);
      throw error;
    }
  }
};

export const processoService = {
  async listarMeusProcessos(params) {
    const response = await api.get('/processos', { params });
    return response.data;
  },
  
  async listarMarketplace(params) {
    const response = await api.get('/processos/marketplace', { params });
    return response.data;
  },
  
  async obterDetalhes(id) {
    const response = await api.get(`/processos/${id}`);
    return response.data;
  },
  
  async cadastrar(processoData) {
    const response = await api.post('/processos', processoData);
    return response.data;
  },
  
  async atualizar(id, processoData) {
    const response = await api.put(`/processos/${id}`, processoData);
    return response.data;
  },
  
  async excluir(id) {
    const response = await api.delete(`/processos/${id}`);
    return response.data;
  },
  
  async uploadDocumentos(id, formData) {
    const response = await api.post(`/processos/${id}/documentos`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },
  
  async removerDocumento(processoId, documentoId) {
    const response = await api.delete(`/processos/${processoId}/documentos/${documentoId}`);
    return response.data;
  }
};

// Serviços de ofertas
export const ofertaService = {
  async criarOferta(ofertaData) {
    const response = await api.post('/ofertas', ofertaData);
    return response.data;
  },
  
  async listarRecebidas(params) {
    const response = await api.get('/ofertas/recebidas', { params });
    return response.data;
  },
  
  async listarEnviadas(params) {
    const response = await api.get('/ofertas/enviadas', { params });
    return response.data;
  },
  
  async obterDetalhes(id) {
    const response = await api.get(`/ofertas/${id}`);
    return response.data;
  },
  
  async aceitar(id, observacao) {
    const response = await api.post(`/ofertas/${id}/aceitar`, { observacao });
    return response.data;
  },
  
  async rejeitar(id, motivo) {
    const response = await api.post(`/ofertas/${id}/rejeitar`, { motivo });
    return response.data;
  },
  
  async cancelar(id, motivo) {
    const response = await api.post(`/ofertas/${id}/cancelar`, { motivo });
    return response.data;
  },
  
  async contraproposta(id, contrapropostaData) {
    const response = await api.post(`/ofertas/${id}/contraproposta`, contrapropostaData);
    return response.data;
  },
  
  async responderContraproposta(id, respostaData) {
    const response = await api.post(`/ofertas/${id}/responder-contraproposta`, respostaData);
    return response.data;
  }
};

// Serviços de transações
export const transacaoService = {
  async iniciar(ofertaId) {
    const response = await api.post('/transacoes', { ofertaId });
    return response.data;
  },
  
  async listar(params) {
    const response = await api.get('/transacoes', { params });
    return response.data;
  },
  
  async obterDetalhes(id) {
    const response = await api.get(`/transacoes/${id}`);
    return response.data;
  },
  
  async enviarContrato(id, formData) {
    const response = await api.post(`/transacoes/${id}/contrato`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },
  
  async registrarPagamento(id, pagamentoData) {
    const response = await api.post(`/transacoes/${id}/pagamento`, pagamentoData);
    return response.data;
  },
  
  async confirmarRecebimento(id, observacao) {
    const response = await api.post(`/transacoes/${id}/confirmar`, { observacao });
    return response.data;
  },
  
  async cancelar(id, motivo) {
    const response = await api.post(`/transacoes/${id}/cancelar`, { motivo });
    return response.data;
  }
};

export default api;