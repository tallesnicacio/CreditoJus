import React from 'react';

const Stepper = ({ steps, currentStep }) => {
  return (
    <div className="w-full py-6">
      <div className="flex items-center">
        {steps.map((step, index) => (
          <React.Fragment key={index}>
            {/* Etapa (círculo com número) */}
            <div className="relative flex flex-col items-center">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full border-2 text-lg font-bold ${
                  index < currentStep
                    ? 'bg-green-500 border-green-500 text-white' // Etapa concluída
                    : index === currentStep
                    ? 'bg-blue-600 border-blue-600 text-white' // Etapa atual
                    : 'bg-white border-gray-300 text-gray-500' // Etapa futura
                }`}
              >
                {index < currentStep ? (
                  // Ícone de check para etapas concluídas
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    ></path>
                  </svg>
                ) : (
                  // Número para etapas atual e futuras
                  index + 1
                )}
              </div>
              
              {/* Título da etapa */}
              <div
                className={`absolute top-0 mt-16 text-center w-32 -ml-10 text-xs font-medium ${
                  index <= currentStep ? 'text-blue-600' : 'text-gray-500'
                }`}
              >
                {step.title}
              </div>
              
              {/* Descrição opcional da etapa */}
              {step.description && (
                <div className="absolute top-0 mt-24 text-center w-32 -ml-10 text-xs text-gray-500">
                  {step.description}
                </div>
              )}
            </div>

            {/* Linha conectora entre as etapas */}
            {index < steps.length - 1 && (
              <div
                className={`flex-auto border-t-2 transition duration-500 ease-in-out ${
                  index < currentStep ? 'border-green-500' : 'border-gray-300'
                }`}
              ></div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

// Versão vertical do stepper para layouts mobile ou processos com muitas etapas
export const VerticalStepper = ({ steps, currentStep }) => {
  return (
    <div className="w-full py-4">
      <div className="space-y-6">
        {steps.map((step, index) => (
          <div key={index} className="flex items-start">
            {/* Etapa (círculo com número) */}
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full border-2 text-sm font-bold flex-shrink-0 ${
                index < currentStep
                  ? 'bg-green-500 border-green-500 text-white' // Etapa concluída
                  : index === currentStep
                  ? 'bg-blue-600 border-blue-600 text-white' // Etapa atual
                  : 'bg-white border-gray-300 text-gray-500' // Etapa futura
              }`}
            >
              {index < currentStep ? (
                // Ícone de check para etapas concluídas
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  ></path>
                </svg>
              ) : (
                // Número para etapas atual e futuras
                index + 1
              )}
            </div>

            {/* Linha vertical conectora */}
            {index < steps.length - 1 && (
              <div
                className={`ml-4 h-12 w-0.5 ${
                  index < currentStep ? 'bg-green-500' : 'bg-gray-300'
                }`}
              ></div>
            )}

            {/* Conteúdo da etapa */}
            <div className="ml-4 flex flex-col">
              <span
                className={`font-medium ${
                  index <= currentStep ? 'text-blue-600' : 'text-gray-500'
                }`}
              >
                {step.title}
              </span>
              {step.description && (
                <span className="text-sm text-gray-500 mt-1">
                  {step.description}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Stepper;