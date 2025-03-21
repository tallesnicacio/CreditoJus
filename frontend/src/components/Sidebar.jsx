import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Sidebar = () => {
  const { user } = useAuth();
  const location = useLocation();

  // Verifica se a rota atual está ativa
  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  // Classes para link ativo/inativo
  const getLinkClasses = (path) => {
    return `flex items-center px-4 py-3 mb-2 rounded transition-colors ${
      isActive(path)
        ? 'bg-blue-600 text-white'
        : 'text-gray-700 hover:bg-gray-100'
    }`;
  };

  // Links comuns para todos os tipos de usuário
  const commonLinks = [
    { to: '/dashboard', icon: '📊', label: 'Dashboard' },
    { to: '/transacoes', icon: '💵', label: 'Transações' },
    { to: '/perfil', icon: '👤', label: 'Meu Perfil' }
  ];

  // Links específicos para vendedores
  const vendedorLinks = [
    { to: '/meus-processos', icon: '📄', label: 'Meus Processos' },
    { to: '/cadastrar-processo', icon: '➕', label: 'Cadastrar Processo' },
    { to: '/ofertas-recebidas', icon: '📬', label: 'Ofertas Recebidas' }
  ];

  // Links específicos para compradores
  const compradorLinks = [
    { to: '/marketplace', icon: '🏪', label: 'Marketplace' },
    { to: '/ofertas-enviadas', icon: '📤', label: 'Ofertas Enviadas' },
    { to: '/processos-favoritos', icon: '⭐', label: 'Favoritos' }
  ];

  // Links específicos para administradores
  const adminLinks = [
    { to: '/admin/usuarios', icon: '👥', label: 'Usuários' },
    { to: '/admin/processos', icon: '📋', label: 'Processos' },
    { to: '/admin/transacoes', icon: '💰', label: 'Transações' },
    { to: '/admin/relatorios', icon: '📈', label: 'Relatórios' }
  ];

  // Determinar quais links exibir com base no tipo de usuário
  const userTypeLinks = user?.tipo === 'vendedor'
    ? vendedorLinks
    : user?.tipo === 'comprador'
      ? compradorLinks
      : user?.tipo === 'admin'
        ? adminLinks
        : [];

  // Combinar links comuns com específicos
  const links = [...commonLinks, ...userTypeLinks];

  return (
    <div className="w-64 h-full bg-white shadow-md flex flex-col">
      {/* Cabeçalho da Sidebar */}
      <div className="p-4 border-b border-gray-200">
        <h1 className="text-xl font-bold text-blue-600">CreditoJus</h1>
        <p className="text-sm text-gray-600 mt-1">
          {user?.tipo === 'vendedor' ? 'Painel do Vendedor' : 
           user?.tipo === 'comprador' ? 'Painel do Comprador' : 
           user?.tipo === 'admin' ? 'Painel Admin' : 'Painel'}
        </p>
      </div>

      {/* Links de navegação */}
      <nav className="flex-1 overflow-y-auto p-4">
        <ul>
          {links.map((link) => (
            <li key={link.to}>
              <NavLink to={link.to} className={getLinkClasses(link.to)}>
                <span className="mr-3">{link.icon}</span>
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Rodapé da Sidebar */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center">
            {user?.nome?.charAt(0) || '?'}
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-700 truncate">
              {user?.nome || 'Usuário'}
            </p>
            <p className="text-xs text-gray-500">
              {user?.email || 'email@exemplo.com'}
            </p>
          </div>
        </div>
        <NavLink 
          to="/ajuda"
          className="flex items-center text-gray-700 hover:text-blue-600 mt-4"
        >
          <span className="mr-2">❓</span>
          Ajuda e Suporte
        </NavLink>
      </div>
    </div>
  );
};

export default Sidebar;