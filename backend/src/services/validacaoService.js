/**
 * Serviço de validação
 * Centraliza as lógicas de validação reutilizáveis na aplicação
 */

const validacaoService = {
    /**
     * Valida formato de CPF
     * @param {String} cpf Número do CPF
     * @returns {Boolean} Resultado da validação
     */
    validarCPF(cpf) {
      // Remove caracteres não numéricos
      cpf = cpf.replace(/\D/g, '');
  
      // Verifica se tem 11 dígitos
      if (cpf.length !== 11) {
        return false;
      }
  
      // Verifica se todos os dígitos são iguais
      if (/^(\d)\1+$/.test(cpf)) {
        return false;
      }
  
      // Validação dos dígitos verificadores
      let soma = 0;
      let resto;
  
      // Primeiro dígito verificador
      for (let i = 1; i <= 9; i++) {
        soma += parseInt(cpf.substring(i - 1, i)) * (11 - i);
      }
      resto = (soma * 10) % 11;
      if (resto === 10 || resto === 11) resto = 0;
      if (resto !== parseInt(cpf.substring(9, 10))) {
        return false;
      }
  
      // Segundo dígito verificador
      soma = 0;
      for (let i = 1; i <= 10; i++) {
        soma += parseInt(cpf.substring(i - 1, i)) * (12 - i);
      }
      resto = (soma * 10) % 11;
      if (resto === 10 || resto === 11) resto = 0;
      if (resto !== parseInt(cpf.substring(10, 11))) {
        return false;
      }
  
      return true;
    },
  
    /**
     * Valida formato de CNPJ
     * @param {String} cnpj Número do CNPJ
     * @returns {Boolean} Resultado da validação
     */
    validarCNPJ(cnpj) {
      // Remove caracteres não numéricos
      cnpj = cnpj.replace(/\D/g, '');
  
      // Verifica se tem 14 dígitos
      if (cnpj.length !== 14) {
        return false;
      }
  
      // Verifica se todos os dígitos são iguais
      if (/^(\d)\1+$/.test(cnpj)) {
        return false;
      }
  
      // Validação dos dígitos verificadores
      let tamanho = cnpj.length - 2;
      let numeros = cnpj.substring(0, tamanho);
      const digitos = cnpj.substring(tamanho);
      let soma = 0;
      let pos = tamanho - 7;
  
      // Primeiro dígito verificador
      for (let i = tamanho; i >= 1; i--) {
        soma += numeros.charAt(tamanho - i) * pos--;
        if (pos < 2) pos = 9;
      }
      let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
      if (resultado !== parseInt(digitos.charAt(0))) {
        return false;
      }
  
      // Segundo dígito verificador
      tamanho = tamanho + 1;
      numeros = cnpj.substring(0, tamanho);
      soma = 0;
      pos = tamanho - 7;
      for (let i = tamanho; i >= 1; i--) {
        soma += numeros.charAt(tamanho - i) * pos--;
        if (pos < 2) pos = 9;
      }
      resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
      if (resultado !== parseInt(digitos.charAt(1))) {
        return false;
      }
  
      return true;
    },
  
    /**
     * Verifica se é CPF ou CNPJ e valida
     * @param {String} documento Número do CPF ou CNPJ
     * @returns {Object} Resultado da validação
     */
    validarCPFouCNPJ(documento) {
      // Remove caracteres não numéricos
      const numeroLimpo = documento.replace(/\D/g, '');
  
      // Verifica se é CPF ou CNPJ com base no número de dígitos
      if (numeroLimpo.length === 11) {
        const valido = this.validarCPF(numeroLimpo);
        return {
          tipo: 'CPF',
          valido,
          mensagem: valido ? 'CPF válido' : 'CPF inválido'
        };
      } else if (numeroLimpo.length === 14) {
        const valido = this.validarCNPJ(numeroLimpo);
        return {
          tipo: 'CNPJ',
          valido,
          mensagem: valido ? 'CNPJ válido' : 'CNPJ inválido'
        };
      } else {
        return {
          tipo: 'Desconhecido',
          valido: false,
          mensagem: 'Documento deve ser um CPF (11 dígitos) ou CNPJ (14 dígitos)'
        };
      }
    },
  
    /**
     * Valida formato do número do processo no padrão CNJ
     * @param {String} numero Número do processo
     * @returns {Boolean} Resultado da validação
     */
    validarNumeroCNJ(numero) {
      // Formato CNJ: NNNNNNN-DD.AAAA.J.TR.OOOO
      const regexCNJ = /^\d{7}-\d{2}\.\d{4}\.\d\.\d{2}\.\d{4}$/;
      return regexCNJ.test(numero);
    },
  
    /**
     * Valida formato de email
     * @param {String} email Endereço de email
     * @returns {Boolean} Resultado da validação
     */
    validarEmail(email) {
      const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      return regex.test(email);
    },
  
    /**
     * Valida força da senha
     * @param {String} senha Senha a ser validada
     * @param {Object} options Opções de validação
     * @returns {Object} Resultado da validação
     */
    validarSenha(senha, options = {}) {
      const config = {
        minLength: options.minLength || 8,
        requireUppercase: options.requireUppercase !== false,
        requireLowercase: options.requireLowercase !== false,
        requireNumbers: options.requireNumbers !== false,
        requireSpecialChars: options.requireSpecialChars !== false
      };
  
      const resultado = {
        valido: true,
        erros: []
      };
  
      // Verificar comprimento mínimo
      if (senha.length < config.minLength) {
        resultado.valido = false;
        resultado.erros.push(`A senha deve ter pelo menos ${config.minLength} caracteres`);
      }
  
      // Verificar letras maiúsculas
      if (config.requireUppercase && !/[A-Z]/.test(senha)) {
        resultado.valido = false;
        resultado.erros.push('A senha deve conter pelo menos uma letra maiúscula');
      }
  
      // Verificar letras minúsculas
      if (config.requireLowercase && !/[a-z]/.test(senha)) {
        resultado.valido = false;
        resultado.erros.push('A senha deve conter pelo menos uma letra minúscula');
      }
  
      // Verificar números
      if (config.requireNumbers && !/[0-9]/.test(senha)) {
        resultado.valido = false;
        resultado.erros.push('A senha deve conter pelo menos um número');
      }
  
      // Verificar caracteres especiais
      if (config.requireSpecialChars && !/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(senha)) {
        resultado.valido = false;
        resultado.erros.push('A senha deve conter pelo menos um caractere especial');
      }
  
      return resultado;
    }
  };
  
  module.exports = validacaoService;