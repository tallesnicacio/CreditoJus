/**
 * Serviço de envio de emails
 * Centraliza a lógica de envio de emails para a aplicação
 */

const nodemailer = require('nodemailer');

// Configurar o transporter do Nodemailer
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.example.com',
  port: process.env.EMAIL_PORT || 587,
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER || 'user@example.com',
    pass: process.env.EMAIL_PASS || 'password'
  }
});

const emailService = {
  /**
   * Envia um email
   * @param {Object} options Opções do email
   * @param {String} options.para Email do destinatário
   * @param {String} options.assunto Assunto do email
   * @param {String} options.texto Conteúdo em texto plano
   * @param {String} options.html Conteúdo em HTML
   * @returns {Promise} Promessa com o resultado do envio
   */
  async enviar({ para, assunto, texto, html }) {
    const emailConfig = {
      from: process.env.EMAIL_FROM || 'CreditoJus <noreply@creditojus.com.br>',
      to: para,
      subject: assunto,
      text: texto,
      html: html || texto
    };

    try {
      const info = await transporter.sendMail(emailConfig);
      console.log('Email enviado:', info.messageId);
      return { sucesso: true, messageId: info.messageId };
    } catch (erro) {
      console.error('Erro ao enviar email:', erro);
      return { sucesso: false, erro };
    }
  },

  /**
   * Envia email de boas-vindas para novos usuários
   * @param {Object} usuario Dados do usuário
   * @returns {Promise} Promessa com o resultado do envio
   */
  async enviarBoasVindas(usuario) {
    const assunto = 'Bem-vindo à CreditoJus';
    const texto = `Olá ${usuario.nome},\n\nSeja bem-vindo à CreditoJus, a plataforma de negociação de créditos judiciais.\n\nAtenciosamente,\nEquipe CreditoJus`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px;">
        <h2>Bem-vindo à CreditoJus!</h2>
        <p>Olá <strong>${usuario.nome}</strong>,</p>
        <p>É com grande satisfação que recebemos você em nossa plataforma!</p>
        <p>Na CreditoJus, você pode ${usuario.tipo === 'vendedor' ? 'vender seus créditos judiciais e receber o valor antecipadamente' : 'encontrar oportunidades de investimento em créditos judiciais'}.</p>
        <p>Explore nosso site e aproveite todos os recursos disponíveis.</p>
        <p>Caso tenha dúvidas, entre em contato com nossa equipe de suporte.</p>
        <p>Atenciosamente,<br/>Equipe CreditoJus</p>
      </div>
    `;

    return await this.enviar({
      para: usuario.email,
      assunto,
      texto,
      html
    });
  },

  /**
   * Envia email de recuperação de senha
   * @param {Object} usuario Dados do usuário
   * @param {String} token Token de recuperação
   * @param {String} frontendUrl URL base do frontend
   * @returns {Promise} Promessa com o resultado do envio
   */
  async enviarRecuperacaoSenha(usuario, token, frontendUrl) {
    const resetUrl = `${frontendUrl}/reset-password?token=${token}`;
    const assunto = 'Recuperação de Senha';
    const texto = `Olá ${usuario.nome},\n\nVocê solicitou a recuperação de senha na CreditoJus. Clique no link a seguir para definir uma nova senha: ${resetUrl}\n\nEste link é válido por 1 hora.\n\nSe você não solicitou esta recuperação, ignore este email.\n\nAtenciosamente,\nEquipe CreditoJus`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px;">
        <h2>Recuperação de Senha</h2>
        <p>Olá <strong>${usuario.nome}</strong>,</p>
        <p>Você solicitou a recuperação de senha na CreditoJus.</p>
        <p>Clique no botão abaixo para definir uma nova senha:</p>
        <p style="text-align: center;">
          <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 5px;">Redefinir Senha</a>
        </p>
        <p><small>Este link é válido por 1 hora.</small></p>
        <p>Se você não solicitou esta recuperação, ignore este email.</p>
        <p>Atenciosamente,<br/>Equipe CreditoJus</p>
      </div>
    `;

    return await this.enviar({
      para: usuario.email,
      assunto,
      texto,
      html
    });
  },

  /**
   * Envia notificação de nova oferta
   * @param {Object} usuario Dados do vendedor
   * @param {Object} processo Dados do processo
   * @param {Object} oferta Dados da oferta
   * @returns {Promise} Promessa com o resultado do envio
   */
  async notificarNovaOferta(usuario, processo, oferta) {
    const assunto = 'Nova oferta recebida';
    const texto = `Olá ${usuario.nome},\n\nVocê recebeu uma nova oferta para o processo ${processo.numero} no valor de R$ ${oferta.valor.toFixed(2)}.\n\nAcesse a plataforma para visualizar os detalhes e responder à oferta.\n\nAtenciosamente,\nEquipe CreditoJus`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px;">
        <h2>Nova oferta recebida!</h2>
        <p>Olá <strong>${usuario.nome}</strong>,</p>
        <p>Você recebeu uma nova oferta para o processo <strong>${processo.numero}</strong>.</p>
        <p><strong>Valor da oferta:</strong> R$ ${oferta.valor.toFixed(2)}</p>
        <p>Acesse a plataforma para visualizar os detalhes e responder à oferta.</p>
        <p>Atenciosamente,<br/>Equipe CreditoJus</p>
      </div>
    `;

    return await this.enviar({
      para: usuario.email,
      assunto,
      texto,
      html
    });
  },

  /**
   * Envia notificação de resposta à oferta
   * @param {Object} usuario Dados do comprador
   * @param {Object} processo Dados do processo
   * @param {Object} oferta Dados da oferta
   * @param {String} status Status da oferta (aceita, rejeitada, contraproposta)
   * @returns {Promise} Promessa com o resultado do envio
   */
  async notificarRespostaOferta(usuario, processo, oferta, status) {
    const statusTexto = {
      aceita: 'aceita',
      rejeitada: 'rejeitada',
      emNegociacao: 'recebeu uma contraproposta'
    };

    const assunto = `Sua oferta foi ${statusTexto[status]}`;
    const texto = `Olá ${usuario.nome},\n\nSua oferta para o processo ${processo.numero} foi ${statusTexto[status]}.\n\nAcesse a plataforma para visualizar os detalhes.\n\nAtenciosamente,\nEquipe CreditoJus`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px;">
        <h2>Atualização da sua oferta</h2>
        <p>Olá <strong>${usuario.nome}</strong>,</p>
        <p>Sua oferta para o processo <strong>${processo.numero}</strong> foi <strong>${statusTexto[status]}</strong>.</p>
        <p>Acesse a plataforma para visualizar os detalhes e próximos passos.</p>
        <p>Atenciosamente,<br/>Equipe CreditoJus</p>
      </div>
    `;

    return await this.enviar({
      para: usuario.email,
      assunto,
      texto,
      html
    });
  }
};

module.exports = emailService;