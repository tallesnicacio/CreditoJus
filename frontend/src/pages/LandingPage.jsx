// frontend/src/pages/LandingPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';

const LandingPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#363D66] text-white">
      <Header />

      <main className="flex-grow">
        {/* Hero Section */}
        <section
          className="py-20 bg-cover bg-center"
          style={{
            backgroundImage:
              'url(https://maisjus.com.br/wp-content/uploads/2024/07/A-BMS-E-A-EMPRESA-CERTA-PARA-TE-TIRAR-DESSE-SUFOCO.-5.png)'
          }}
        >
          <div className="container mx-auto px-4 text-center bg-white py-10 rounded-xl">
            <img
              src="https://maisjus.com.br/wp-content/uploads/2024/07/logo.png"
              alt="Logo CreditoJus"
              className="mx-auto mb-8 w-40"
            />
            <h1 className="text-4xl text-[#363D66] md:text-5xl font-bold mb-6">
              Transforme Seus Créditos Judiciais em Dinheiro Agora
            </h1>
            <p className="text-xl text-[#363D66]/90 md:text-2xl mb-8 max-w-3xl mx-auto">
              Uma plataforma segura para vender seus direitos creditórios de processos judiciais ou adquirir créditos com potencial de retorno.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/cadastro"
                className="px-8 py-3 bg-[#EF623A] text-white rounded-md font-semibold hover:bg-[#e85c36] transition"
              >
                Cadastre-se Grátis
              </Link>
              <Link
                to="/como-funciona"
                className="px-8 py-3 border-2 border-white text-white rounded-md font-semibold hover:bg-white/10 transition"
              >
                Como Funciona
              </Link>
            </div>
          </div>
        </section>

        {/* Benefícios */}
        <section className="py-16 bg-white text-gray-800">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12 text-[#363D66]">
              Por que escolher a CreditoJus?
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  emoji: '💰',
                  title: 'Liquidez Imediata',
                  desc: 'Receba o valor do seu processo judicial em até 7 dias úteis, sem esperar anos pela conclusão.'
                },
                {
                  emoji: '⚖️',
                  title: 'Segurança Jurídica',
                  desc: 'Todas as transações são realizadas com contratos de cessão de crédito formalizados conforme a legislação.'
                },
                {
                  emoji: '🔍',
                  title: 'Validação de Processos',
                  desc: 'Verificamos a autenticidade e status dos processos para garantir a segurança nas negociações.'
                },
                {
                  emoji: '📊',
                  title: 'Marketplace Transparente',
                  desc: 'Preços e condições claras, sem custos ocultos ou surpresas desagradáveis.'
                },
                {
                  emoji: '👥',
                  title: 'Rede de Compradores',
                  desc: 'Acesso a uma ampla rede de escritórios de advocacia e investidores interessados em seus créditos.'
                },
                {
                  emoji: '🔒',
                  title: 'Pagamento Garantido',
                  desc: 'Sistema de escrow que garante a segurança do pagamento para todas as partes envolvidas.'
                }
              ].map((item, index) => (
                <div key={index} className="bg-gray-50 p-6 rounded-lg shadow">
                  <div className="text-4xl mb-4 text-[#EF623A]">{item.emoji}</div>
                  <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                  <p className="text-gray-600">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-16 bg-white text-black text-center">
          <div className="container mx-auto px-4">
            <img
              src="https://maisjus.com.br/wp-content/uploads/2024/07/logo.png"
              alt="Logo CreditoJus V2"
              className="mx-auto mb-6 w-32"
            />
            <h2 className="text-3xl font-bold mb-6 text-[#363D66]">
              Pronto para transformar seu crédito judicial em dinheiro?
            </h2>
            <p className="text-xl mb-8">
              Cadastre-se gratuitamente e comece a receber ofertas pelos seus processos em até 48 horas.
            </p>
            <Link
              to="/cadastro"
              className="px-8 py-3 bg-[#EF623A] text-white rounded-md font-semibold hover:bg-gray-100 transition inline-block"
            >
              Cadastrar Agora
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#363D66] text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <img
                src="https://maisjus.com.br/wp-content/uploads/2024/07/logo2.png"
                alt="Logo Footer"
                className="w-28 mb-4"
              />
              <ul className="space-y-2">
                <li><Link to="/" className="hover:text-[#EF623A]">Home</Link></li>
                <li><Link to="/como-funciona" className="hover:text-[#EF623A]">Como Funciona</Link></li>
                <li><Link to="/contato" className="hover:text-[#EF623A]">Contato</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-4">Para Vendedores</h3>
              <ul className="space-y-2">
                <li><Link to="/cadastro" className="hover:text-[#EF623A]">Cadastrar Processo</Link></li>
                <li><Link to="/como-funciona" className="hover:text-[#EF623A]">Como Vender</Link></li>
                <li><a href="#" className="hover:text-[#EF623A]">Perguntas Frequentes</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-4">Para Compradores</h3>
              <ul className="space-y-2">
                <li><Link to="/cadastro" className="hover:text-[#EF623A]">Acessar Marketplace</Link></li>
                <li><Link to="/como-funciona" className="hover:text-[#EF623A]">Como Comprar</Link></li>
                <li><a href="#" className="hover:text-[#EF623A]">Oportunidades</a></li>
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

          <div className="border-t border-white/20 mt-8 pt-8 text-center">
            <p>&copy; 2025 CreditoJus. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;