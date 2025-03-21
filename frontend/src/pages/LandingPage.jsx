// frontend/src/pages/LandingPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';

const LandingPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Transforme Seus Créditos Judiciais em Dinheiro Agora
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
              Uma plataforma segura para vender seus direitos creditórios de processos judiciais ou adquirir créditos com potencial de retorno.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/cadastro" 
                className="px-8 py-3 bg-white text-blue-600 rounded-md font-semibold hover:bg-gray-100 transition"
              >
                Cadastre-se Grátis
              </Link>
              <Link 
                to="/como-funciona" 
                className="px-8 py-3 bg-transparent border-2 border-white text-white rounded-md font-semibold hover:bg-white/10 transition"
              >
                Como Funciona
              </Link>
            </div>
          </div>
        </section>
        
        {/* Benefícios */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Por que escolher a CreditoJus?</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
                <div className="text-4xl mb-4 text-blue-600">💰</div>
                <h3 className="text-xl font-semibold mb-2">Liquidez Imediata</h3>
                <p className="text-gray-600">
                  Receba o valor do seu processo judicial em até 7 dias úteis, sem esperar anos pela conclusão.
                </p>
              </div>
              
              <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
                <div className="text-4xl mb-4 text-blue-600">⚖️</div>
                <h3 className="text-xl font-semibold mb-2">Segurança Jurídica</h3>
                <p className="text-gray-600">
                  Todas as transações são realizadas com contratos de cessão de crédito formalizados conforme a legislação.
                </p>
              </div>
              
              <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
                <div className="text-4xl mb-4 text-blue-600">🔍</div>
                <h3 className="text-xl font-semibold mb-2">Validação de Processos</h3>
                <p className="text-gray-600">
                  Verificamos a autenticidade e status dos processos para garantir a segurança nas negociações.
                </p>
              </div>
              
              <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
                <div className="text-4xl mb-4 text-blue-600">📊</div>
                <h3 className="text-xl font-semibold mb-2">Marketplace Transparente</h3>
                <p className="text-gray-600">
                  Preços e condições claras, sem custos ocultos ou surpresas desagradáveis.
                </p>
              </div>
              
              <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
                <div className="text-4xl mb-4 text-blue-600">👥</div>
                <h3 className="text-xl font-semibold mb-2">Rede de Compradores</h3>
                <p className="text-gray-600">
                  Acesso a uma ampla rede de escritórios de advocacia e investidores interessados em seus créditos.
                </p>
              </div>
              
              <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
                <div className="text-4xl mb-4 text-blue-600">🔒</div>
                <h3 className="text-xl font-semibold mb-2">Pagamento Garantido</h3>
                <p className="text-gray-600">
                  Sistema de escrow que garante a segurança do pagamento para todas as partes envolvidas.
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* Call to Action */}
        <section className="py-16 bg-blue-600 text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-6">Pronto para transformar seu crédito judicial em dinheiro?</h2>
            <p className="text-xl mb-8">
              Cadastre-se gratuitamente e comece a receber ofertas pelos seus processos em até 48 horas.
            </p>
            <Link
              to="/cadastro"
              className="px-8 py-3 bg-white text-blue-600 rounded-md font-semibold hover:bg-gray-100 transition inline-block"
            >
              Cadastrar Agora
            </Link>
          </div>
        </section>
      </main>
      
      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">CreditoJus</h3>
              <ul className="space-y-2">
                <li><Link to="/" className="hover:text-blue-300">Home</Link></li>
                <li><Link to="/como-funciona" className="hover:text-blue-300">Como Funciona</Link></li>
                <li><Link to="/contato" className="hover:text-blue-300">Contato</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-xl font-bold mb-4">Para Vendedores</h3>
              <ul className="space-y-2">
                <li><Link to="/cadastro" className="hover:text-blue-300">Cadastrar Processo</Link></li>
                <li><Link to="/como-funciona" className="hover:text-blue-300">Como Vender</Link></li>
                <li><a href="#" className="hover:text-blue-300">Perguntas Frequentes</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-xl font-bold mb-4">Para Compradores</h3>
              <ul className="space-y-2">
                <li><Link to="/cadastro" className="hover:text-blue-300">Acessar Marketplace</Link></li>
                <li><Link to="/como-funciona" className="hover:text-blue-300">Como Comprar</Link></li>
                <li><a href="#" className="hover:text-blue-300">Oportunidades</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-xl font-bold mb-4">Contato</h3>
              <ul className="space-y-2">
                <li>contato@creditojus.com.br</li>
                <li>(11) 3456-7890</li>
                <li>São Paulo, SP</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-8 pt-8 text-center">
            <p>&copy; 2025 CreditoJus. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;