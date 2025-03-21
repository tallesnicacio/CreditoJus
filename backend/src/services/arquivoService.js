/**
 * Serviço de manipulação de arquivos
 * Centraliza a lógica de manipulação de arquivos
 */

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const unlinkAsync = promisify(fs.unlink);
const crypto = require('crypto');

// Diretório base para upload de arquivos
const uploadDir = path.resolve(__dirname, '../../uploads');

// Tipos de arquivo permitidos
const mimeTypesPermitidos = {
  'application/pdf': 'pdf',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'application/msword': 'doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'application/vnd.ms-excel': 'xls',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx'
};

// Tamanho máximo do arquivo em bytes (10MB)
const tamanhoMaximo = 10 * 1024 * 1024;

const arquivoService = {
  /**
   * Verifica se o diretório de uploads existe e cria se necessário
   */
  inicializarDiretorios() {
    // Diretórios para cada tipo de documento
    const diretorios = [
      uploadDir,
      path.join(uploadDir, 'processos'),
      path.join(uploadDir, 'transacoes'),
      path.join(uploadDir, 'usuarios')
    ];

    diretorios.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`Diretório criado: ${dir}`);
      }
    });
  },

  /**
   * Valida um arquivo antes do upload
   * @param {Object} arquivo Objeto do arquivo
   * @returns {Object} Resultado da validação
   */
  validarArquivo(arquivo) {
    // Verificar se o tipo de arquivo é permitido
    const extensao = mimeTypesPermitidos[arquivo.mimetype];
    if (!extensao) {
      return {
        valido: false,
        erro: `Tipo de arquivo não permitido: ${arquivo.mimetype}`
      };
    }

    // Verificar tamanho do arquivo
    if (arquivo.size > tamanhoMaximo) {
      return {
        valido: false,
        erro: `Arquivo muito grande. Tamanho máximo: ${tamanhoMaximo / (1024 * 1024)}MB`
      };
    }

    return { valido: true };
  },

  /**
   * Gera um nome único para o arquivo
   * @param {String} nomeOriginal Nome original do arquivo
   * @param {String} tipo Tipo do arquivo (extensão)
   * @returns {String} Nome único gerado
   */
  gerarNomeUnico(nomeOriginal, tipo) {
    const timestamp = Date.now();
    const hash = crypto.randomBytes(8).toString('hex');
    const extensao = tipo || path.extname(nomeOriginal).toLowerCase();
    const nomeBase = path.basename(nomeOriginal, path.extname(nomeOriginal))
      .replace(/[^a-z0-9]/gi, '_')
      .toLowerCase();

    return `${nomeBase}_${timestamp}_${hash}${extensao}`;
  },

  /**
   * Salva um arquivo no sistema de arquivos
   * @param {Object} arquivo Objeto do arquivo
   * @param {String} categoria Categoria do arquivo (processos, transacoes, usuarios)
   * @param {String} subdiretorio Subdiretório opcional
   * @returns {Promise<Object>} Informações do arquivo salvo
   */
  async salvarArquivo(arquivo, categoria, subdiretorio = '') {
    try {
      // Garantir que os diretórios existam
      this.inicializarDiretorios();

      // Validar arquivo
      const validacao = this.validarArquivo(arquivo);
      if (!validacao.valido) {
        throw new Error(validacao.erro);
      }

      // Determinar a extensão
      const extensao = mimeTypesPermitidos[arquivo.mimetype];

      // Gerar nome único para o arquivo
      const nomeArquivo = this.gerarNomeUnico(arquivo.originalname, `.${extensao}`);

      // Determinar o diretório de destino
      let diretorioDestino = path.join(uploadDir, categoria);
      if (subdiretorio) {
        diretorioDestino = path.join(diretorioDestino, subdiretorio);
        if (!fs.existsSync(diretorioDestino)) {
          fs.mkdirSync(diretorioDestino, { recursive: true });
        }
      }

      // Caminho completo do arquivo
      const caminhoArquivo = path.join(diretorioDestino, nomeArquivo);

      // Mover o arquivo
      await fs.promises.rename(arquivo.path, caminhoArquivo);

      return {
        nome: arquivo.originalname,
        nomeGerado: nomeArquivo,
        tipo: arquivo.mimetype,
        extensao,
        tamanho: arquivo.size,
        caminho: caminhoArquivo,
        categoriaUpload: categoria,
        subdiretorio
      };
    } catch (erro) {
      // Se algo der errado, tentar excluir o arquivo temporário
      try {
        if (arquivo.path && fs.existsSync(arquivo.path)) {
          await unlinkAsync(arquivo.path);
        }
      } catch (erroLimpeza) {
        console.error('Erro ao limpar arquivo temporário:', erroLimpeza);
      }

      throw erro;
    }
  },

  /**
   * Remove um arquivo do sistema de arquivos
   * @param {String} caminho Caminho do arquivo
   * @returns {Promise<Boolean>} Resultado da operação
   */
  async removerArquivo(caminho) {
    try {
      if (fs.existsSync(caminho)) {
        await unlinkAsync(caminho);
        return true;
      }
      return false;
    } catch (erro) {
      console.error('Erro ao remover arquivo:', erro);
      throw erro;
    }
  }
};

module.exports = arquivoService;