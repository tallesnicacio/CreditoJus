import React from 'react';
import { Link } from 'react-router-dom';
import { 
  formatarMoeda, 
  formatarData, 
  formatarStatusProcesso, 
  formatarTipoProcesso, 
  formatarFaseProcessual,
  calcularDesagio,
  limitarTexto
} from '../utils/formatters';

const ProcessCard = ({ processo, showActions = true, isVendedor = false }) => {
  // Extrair os dados do processo
  const {
    _id,
    numero,
    tipo,
    tribunal,
    fase,
    valorEstimado,
    valorMinimo,
    expectativaRecebimento,
    temOfertas,
    ofertasAtivas,
    status,
    dataCadastro,
    descricao,
    isConfidencial
  } = processo;

  // Formatar o status com cores
  const statusFormatado = formatarStatusProcesso(status);

  // Calcular o deságio se houver valor mínimo
  const desagio = valorMinimo ? calcularDesagio(valorEstimado, valorMinimo) : null;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow">
      {/* Cabeçalho do card */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex justify-between items-start">
          <div>
            <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${statusFormatado.color} ${statusFormatado.textColor} mb-2`}>
              {statusFormatado.label}
            </span>
            <h3 className="text-lg font-semibold text-gray-800">
              {isConfidencial && !isVendedor ? 
                numero.replace(/\d{4}$/, 'XXXX') : 
                numero
              }
            </h3>
            <p className="text-sm text-gray-600">
              {formatarTipoProcesso(tipo)} • {tribunal}
            </p>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-blue-600">
              {formatarMoeda(valorEstimado)}
            </p>
            {valorMinimo && (
              <p className="text-sm text-gray-600">
                Mínimo: {formatarMoeda(valorMinimo)}
                {desagio && <span className="ml-1 text-red-500">(-{desagio.toFixed(1)}%)</span>}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Corpo do card */}
      <div className="p-4">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-xs text-gray-500">Fase Processual</p>
            <p className="text-sm font-medium">{formatarFaseProcessual(fase)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Expectativa de Recebimento</p>
            <p className="text-sm font-medium">
              {expectativaRecebimento === '6' && 'Menos de 6 meses'}
              {expectativaRecebimento === '12' && '6 a 12 meses'}
              {expectativaRecebimento === '24' && '12 a 24 meses'}
              {expectativaRecebimento === '36' && '24 a 36 meses'}
              {expectativaRecebimento === '48' && 'Mais de 36 meses'}
              {expectativaRecebimento === 'incerto' && 'Incerto'}
            </p>
          </div>
        </div>

        <p className="text-sm text-gray-700 mb-4">
          {limitarTexto(descricao, 150)}
        </p>

        <div className="flex justify-between items-center text-xs text-gray-500">
          <span>Cadastrado em {formatarData(dataCadastro)}</span>
          {isVendedor && temOfertas && (
            <span className="text-green-600 font-medium">
              {ofertasAtivas} {ofertasAtivas === 1 ? 'oferta ativa' : 'ofertas ativas'}
            </span>
          )}
          {!isVendedor && processo.temMinhaOferta && (
            <span className="text-blue-600 font-medium">Você já fez uma oferta</span>
          )}
        </div>
      </div>

      {/* Rodapé do card com ações */}
      {showActions && (
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex justify-between">
          <Link 
            to={`/processos/${_id}`} 
            className="text-blue-600 hover:text-blue-800 font-medium text-sm"
          >
            Ver detalhes
          </Link>
          
          {status === 'ativo' && !isVendedor && !processo.temMinhaOferta && (
            <Link 
              to={`/processos/${_id}/fazer-oferta`} 
              className="text-white bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-sm font-medium"
            >
              Fazer oferta
            </Link>
          )}
          
          {isVendedor && status === 'pendente' && (
            <Link 
              to={`/processos/${_id}/editar`} 
              className="text-white bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-sm font-medium"
            >
              Continuar cadastro
            </Link>
          )}
          
          {isVendedor && temOfertas && (
            <Link 
              to={`/processos/${_id}/ofertas`} 
              className="text-white bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-sm font-medium"
            >
              Ver ofertas
            </Link>
          )}
        </div>
      )}
    </div>
  );
};

export default ProcessCard;