import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Componentes de páginas
import Dashboard from './pages/Dashboard';
import Marketplace from './pages/Marketplace';
import ProcessDetails from './pages/ProcessDetails';
import ProcessForm from './pages/ProcessForm';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import MeusProcessos from './pages/MeusProcessos';
import OfertasRecebidas from './pages/OfertasRecebidas';
import OfertasEnviadas from './pages/OfertasEnviadas';
import OfertaDetails from './pages/OfertaDetails';
import Transacoes from './pages/Transacoes';
import TransacaoDetails from './pages/TransacaoDetails';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';
import LandingPage from './pages/LandingPage';
import ComoFunciona from './pages/ComoFunciona';
import Contato from './pages/Contato';

// Import de estilos
import './styles/global.css';

// Componente para rotas privadas que requerem autenticação
const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  // Mostrar um loader enquanto verifica a autenticação
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }

  // Redirecionar para login se não estiver autenticado
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Componente para rotas restritas a vendedores
const VendedorRoute = ({ children }) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user.tipo !== 'vendedor') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Componente para rotas restritas a compradores
const CompradorRoute = ({ children }) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user.tipo !== 'comprador') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Componente para rotas públicas (acessíveis apenas quando não autenticado)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Rotas públicas */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/como-funciona" element={<ComoFunciona />} />
          <Route path="/contato" element={<Contato />} />
          
          {/* Rotas de autenticação */}
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/cadastro" element={<PublicRoute><Register /></PublicRoute>} />
          <Route path="/esqueci-senha" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
          <Route path="/redefinir-senha" element={<PublicRoute><ResetPassword /></PublicRoute>} />
          
          {/* Rotas privadas comuns */}
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/perfil" element={<PrivateRoute><Profile /></PrivateRoute>} />
          <Route path="/transacoes" element={<PrivateRoute><Transacoes /></PrivateRoute>} />
          <Route path="/transacoes/:id" element={<PrivateRoute><TransacaoDetails /></PrivateRoute>} />
          <Route path="/processos/:id" element={<PrivateRoute><ProcessDetails /></PrivateRoute>} />
          
          {/* Rotas para vendedores */}
          <Route path="/meus-processos" element={<VendedorRoute><MeusProcessos /></VendedorRoute>} />
          <Route path="/cadastrar-processo" element={<VendedorRoute><ProcessForm /></VendedorRoute>} />
          <Route path="/processos/:id/editar" element={<VendedorRoute><ProcessForm /></VendedorRoute>} />
          <Route path="/ofertas-recebidas" element={<VendedorRoute><OfertasRecebidas /></VendedorRoute>} />
          <Route path="/processos/:id/ofertas" element={<VendedorRoute><OfertasRecebidas /></VendedorRoute>} />
          
          {/* Rotas para compradores */}
          <Route path="/marketplace" element={<CompradorRoute><Marketplace /></CompradorRoute>} />
          <Route path="/ofertas-enviadas" element={<CompradorRoute><OfertasEnviadas /></CompradorRoute>} />
          <Route path="/processos/:id/fazer-oferta" element={<CompradorRoute><ProcessDetails /></CompradorRoute>} />
          
          {/* Rota para detalhes da oferta (acessível para ambos os tipos de usuário) */}
          <Route path="/ofertas/:id" element={<PrivateRoute><OfertaDetails /></PrivateRoute>} />
          
          {/* Rota 404 para caminhos inexistentes */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;