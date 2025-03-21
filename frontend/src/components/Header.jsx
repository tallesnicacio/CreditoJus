import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Header = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  // Fechar dropdowns quando a rota mudar
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsProfileDropdownOpen(false);
  }, [location.pathname]);

  // Alternar menu mobile
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    if (isProfileDropdownOpen) setIsProfileDropdownOpen(false);
  };

  // Alternar dropdown de perfil
  const toggleProfileDropdown = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
    if (isMobileMenuOpen) setIsMobileMenuOpen(false);
  };

  // Fazer logout
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-3 md:flex md:justify-between md:items-center">
        {/* Logo e Botão Mobile */}
        <div className="flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold text-blue-600">
            CreditoJus
          </Link>
          
          {/* Botão Mobile */}
          <div className="md:hidden">
            <button
              type="button"
              className="text-gray-500 hover:text-gray-700 focus:outline-none focus:text-gray-700"
              onClick={toggleMobileMenu}
              aria-label="toggle menu"
            >
              <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current">
                {isMobileMenuOpen ? (
                  <path fillRule="evenodd" clipRule="evenodd" d="M18.278 16.864a1 1 0 0 1-1.414 1.414l-4.829-4.828-4.828 4.828a1 1 0 0 1-1.414-1.414l4.828-4.829-4.828-4.828a1 1 0 0 1 1.414-1.414l4.829 4.828 4.828-4.828a1 1 0 1 1 1.414 1.414l-4.828 4.829 4.828 4.828z" />
                ) : (
                  <path fillRule="evenodd" d="M4 5h16a1 1 0 0 1 0 2H4a1 1 0 1 1 0-2zm0 6h16a1 1 0 0 1 0 2H4a1 1 0 0 1 0-2zm0 6h16a1 1 0 0 1 0 2H4a1 1 0 0 1 0-2z" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Menu de navegação */}
        <nav
          className={`${
            isMobileMenuOpen ? 'block' : 'hidden'
          } md:flex md:items-center md:space-x-4`}
        >
          <ul className="mt-3 space-y-2 md:mt-0 md:space-y-0 md:flex md:space-x-6">
            <li>
              <Link to="/" className="block text-gray-700 hover:text-blue-600">
                Início
              </Link>
            </li>
            <li>
              <Link to="/como-funciona" className="block text-gray-700 hover:text-blue-600">
                Como Funciona
              </Link>
            </li>
            {isAuthenticated && user?.tipo === 'comprador' && (
              <li>
                <Link to="/marketplace" className="block text-gray-700 hover:text-blue-600">
                  Marketplace
                </Link>
              </li>
            )}
            <li>
              <Link to="/contato" className="block text-gray-700 hover:text-blue-600">
                Contato
              </Link>
            </li>
          </ul>

          {/* Botões de autenticação */}
          <div className="mt-4 space-y-2 md:mt-0 md:space-y-0 md:flex md:space-x-2 md:ml-6">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={toggleProfileDropdown}
                  className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 focus:outline-none"
                >
                  <span className="hidden md:inline">{user.nome}</span>
                  <span className="inline-block h-8 w-8 rounded-full bg-blue-600 text-white text-center leading-8">
                    {user.nome.charAt(0)}
                  </span>
                  <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                    <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                  </svg>
                </button>

                {/* Dropdown de perfil */}
                {isProfileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 py-2 bg-white rounded-md shadow-lg z-10">
                    <Link
                      to="/dashboard"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Dashboard
                    </Link>
                    <Link
                      to="/perfil"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Meu Perfil
                    </Link>
                    {user.tipo === 'vendedor' && (
                      <Link
                        to="/meus-processos"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Meus Processos
                      </Link>
                    )}
                    {user.tipo === 'comprador' && (
                      <Link
                        to="/minhas-ofertas"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Minhas Ofertas
                      </Link>
                    )}
                    <Link
                      to="/transacoes"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Transações
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    >
                      Sair
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="block px-4 py-2 text-gray-700 border border-gray-300 rounded hover:bg-gray-100 md:inline-block"
                >
                  Entrar
                </Link>
                <Link
                  to="/cadastro"
                  className="block px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700 md:inline-block"
                >
                  Cadastrar
                </Link>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;