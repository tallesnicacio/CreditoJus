// frontend/src/pages/ComoFunciona.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';

const ComoFunciona = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">Como Funciona o CreditoJus</h1>
          
          <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">Para Vendedores</h2>
              
              <div className="space-y-8 mb-12">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-600 text-white">
                      1
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">Cadastre seu processo</h3>
                    <p className="mt-2 text-gray-600">
                      Registre-se na plataforma e cadastre os detalhes do seu processo judicial, 
                      incluindo documentos, valores e expectativas de recebimento.
                    </p>
                  </div>
                </div>
                
                <div className="flex">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-600 text-white">
                      2
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">Receba ofertas</h3>
                    <p className="mt-2 text-gray-600">
                      Escritórios de advocacia e investidores farão ofertas para comprar seu 
                      crédito judicial, oferecendo liquidez imediata.
                    </p>
                  </div>
                </div>
                
                <div className="flex">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-600 text-white">
                      3
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">Escolha a melhor oferta</h3>
                    <p className="mt-2 text-gray-600">
                      Compare as diferentes propostas e selecione a que melhor atende às suas 
                      necessidades financeiras.
                    </p>
                  </div>
                </div>
                
                <div className="flex">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-600 text-white">
                      4
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">Receba o pagamento</h3>
                    <p className="mt-2 text-gray-600">
                      Após a formalização da cessão de crédito, você recebe o valor acordado 
                      diretamente em sua conta em até 7 dias úteis.
                    </p>
                  </div>
                </div>
              </div>
              
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">Para Compradores</h2>
              
              <div className="space-y-8">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-600 text-white">
                      1
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">Acesse o marketplace</h3>
                    <p className="mt-2 text-gray-600">
                      Registre-se como comprador e acesse nosso marketplace para visualizar 
                      os processos disponíveis.
                    </p>
                  </div>
                </div>
                
                <div className="flex">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-600 text-white">
                      2
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">Analise os processos</h3>
                    <p className="mt-2 text-gray-600">
                      Avalie os documentos, valores e histórico dos processos disponíveis 
                      para encontrar as melhores oportunidades.
                    </p>
                  </div>
                </div>
                
                <div className="flex">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-600 text-white">
                      3
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">Faça uma oferta</h3>
                    <p className="mt-2 text-gray-600">
                      Envie ofertas competitivas para os processos que lhe interessam, 
                      podendo negociar condições com o vendedor.
                    </p>
                  </div>
                </div>
                
                <div className="flex">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-600 text-white">
                      4
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">Formalize a transação</h3>
                    <p className="mt-2 text-gray-600">
                      Após a aceitação da oferta, formalize a cessão de crédito e realize o 
                      pagamento de forma segura através da plataforma.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 p-8">
              <div className="text-center">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Pronto para começar?</h2>
                <p className="text-gray-600 mb-6">
                  Crie sua conta gratuitamente e comece a explorar o CreditoJus
                </p>
                <Link 
                  to="/cadastro" 
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                >
                  Cadastrar agora
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2025 CreditoJus. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default ComoFunciona;