/**
 * Controller de autenticação
 * Gerencia registro, login, logout e gerenciamento de tokens
 */

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Usuario = require('../models/Usuario');
const authConfig = require('../config/auth');

// Função para gerar token JWT
const generateToken = (params = {}) => {
  return jwt.sign(params, authConfig.secret, {
    expiresIn: authConfig.expiresIn,
  });
};

// Função para gerar refresh token
const generateRefreshToken = (userId) => {
  return jwt.sign({ id: userId }, authConfig.secret, {
    expiresIn: authConfig.refreshExpiresIn,
  });
};

const authController = {
  /**
   * Registro de novo usuário
   */
  async register(req, res) {
    try {
      const { nome, email, senha, tipo, cpfCnpj, telefone } = req.body;

      // Verificar se o email já está em uso
      if (await Usuario.findOne({ email })) {
        return res.status(400).json({ error: 'Email já está em uso' });
      }

      // Verificar se o CPF/CNPJ já está em uso
      if (await Usuario.findOne({ cpfCnpj })) {
        return res.status(400).json({ error: 'CPF/CNPJ já está em uso' });
      }

      // Verificar requisitos de senha
      if (senha.length < authConfig.password.minLength) {
        return res.status(400).json({ 
          error: `A senha deve ter no mínimo ${authConfig.password.minLength} caracteres` 
        });
      }

      // Criar o usuário
      const usuario = await Usuario.create({
        nome,
        email,
        senha,
        tipo, // 'vendedor' ou 'comprador'
        cpfCnpj,
        telefone,
        verificado: false, // Usuário precisa ser verificado
        dataCadastro: new Date(),
      });

      // Remover a senha antes de retornar o objeto
      usuario.senha = undefined;

      // Retornar os dados do usuário e o token
      return res.status(201).json({
        usuario,
        token: generateToken({ id: usuario.id, tipo: usuario.tipo }),
        refreshToken: generateRefreshToken(usuario.id)
      });
    } catch (err) {
      console.error('Erro ao registrar usuário:', err);
      return res.status(500).json({ error: 'Falha ao registrar usuário' });
    }
  },

  /**
   * Login de usuário
   */
  async login(req, res) {
    try {
      const { email, senha } = req.body;
  
      // Validações iniciais
      if (!email || !senha) {
        return res.status(400).json({ error: 'Email e senha são obrigatórios' });
      }
  
      // Buscar usuário com email case-insensitive
      const usuario = await Usuario.findOne({ 
        email: { $regex: new RegExp(`^${email.trim()}$`, 'i') } 
      }).select('+senha +tentativasLogin +bloqueadoAte');
  
      if (!usuario) {
        return res.status(401).json({ error: 'Credenciais inválidas' });
      }
  
      // Verificar se a conta está bloqueada
      if (usuario.bloqueadoAte && usuario.bloqueadoAte > new Date()) {
        return res.status(403).json({ 
          error: 'Conta bloqueada temporariamente. Tente novamente mais tarde.',
          bloqueadoAte: usuario.bloqueadoAte
        });
      }
  
      // Verificar senha
      const senhaCorreta = await bcrypt.compare(senha, usuario.senha);
  
      if (!senhaCorreta) {
        // Incrementar tentativas de login
        usuario.tentativasLogin = (usuario.tentativasLogin || 0) + 1;
        
        // Bloquear conta se exceder máximo de tentativas
        if (usuario.tentativasLogin >= authConfig.password.maxAttempts) {
          const lockTime = new Date();
          lockTime.setMinutes(lockTime.getMinutes() + authConfig.password.lockTime);
          
          usuario.bloqueadoAte = lockTime;
          usuario.tentativasLogin = 0;
          
          await usuario.save();
          
          return res.status(403).json({ 
            error: 'Conta bloqueada temporariamente. Tente novamente mais tarde.',
            bloqueadoAte: lockTime
          });
        }
        
        await usuario.save();
        return res.status(401).json({ error: 'Credenciais inválidas' });
      }
  
      // Resetar tentativas de login
      usuario.tentativasLogin = 0;
      usuario.bloqueadoAte = null;
      usuario.ultimoAcesso = new Date();
      await usuario.save();
  
      // Preparar resposta sem dados sensíveis
      const usuarioResponse = usuario.toObject();
      delete usuarioResponse.senha;
      delete usuarioResponse.tentativasLogin;
      delete usuarioResponse.bloqueadoAte;
  
      // Gerar tokens
      return res.json({
        usuario: usuarioResponse,
        token: generateToken({ id: usuario.id, tipo: usuario.tipo }),
        refreshToken: generateRefreshToken(usuario.id)
      });
  
    } catch (err) {
      console.error('Erro no login:', err);
      return res.status(500).json({ error: 'Erro interno no servidor' });
    }
  },

  /**
   * Verificação de usuário
   */
  async verificarUsuario(req, res) {
    try {
      const { id } = req.params;
      const { codigo } = req.body;

      const usuario = await Usuario.findById(id);
      
      if (!usuario) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      // Aqui você implementaria a lógica para verificar o código
      // Isso poderia ser um código enviado por email ou SMS
      
      // Para simplificar, estamos apenas marcando o usuário como verificado
      usuario.verificado = true;
      await usuario.save();

      return res.json({ message: 'Usuário verificado com sucesso' });
    } catch (err) {
      console.error('Erro ao verificar usuário:', err);
      return res.status(500).json({ error: 'Falha ao verificar usuário' });
    }
  },

  /**
   * Renovação de token com refresh token
   */
  async refreshToken(req, res) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({ error: 'Refresh token não fornecido' });
      }

      // Verificar se o refresh token é válido
      const decoded = jwt.verify(refreshToken, authConfig.secret);
      const { id } = decoded;

      // Buscar o usuário
      const usuario = await Usuario.findById(id);
      
      if (!usuario) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      // Gerar novo token
      return res.json({
        token: generateToken({ id: usuario.id, tipo: usuario.tipo }),
        refreshToken: generateRefreshToken(usuario.id)
      });
    } catch (err) {
      console.error('Erro ao renovar token:', err);
      
      if (err instanceof jwt.TokenExpiredError) {
        return res.status(401).json({ error: 'Refresh token expirado' });
      }
      
      if (err instanceof jwt.JsonWebTokenError) {
        return res.status(401).json({ error: 'Refresh token inválido' });
      }
      
      return res.status(500).json({ error: 'Falha ao renovar token' });
    }
  },

  /**
   * Solicitar redefinição de senha
   */
  async forgotPassword(req, res) {
    try {
      const { email } = req.body;

      const usuario = await Usuario.findOne({ email });
      
      if (!usuario) {
        // Por segurança, não revelar se o email existe
        return res.json({ message: 'Se o email estiver cadastrado, você receberá instruções para redefinir sua senha.' });
      }

      // Gerar token de redefinição de senha
      const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + authConfig.passwordReset.tokenValidityTime);

      usuario.resetPasswordToken = token;
      usuario.resetPasswordExpires = expiresAt;
      await usuario.save();

      // Aqui você enviaria um email com o link para redefinir a senha
      // Ex: `${process.env.FRONTEND_URL}/reset-password?token=${token}`
      
      return res.json({ message: 'Se o email estiver cadastrado, você receberá instruções para redefinir sua senha.' });
    } catch (err) {
      console.error('Erro ao solicitar redefinição de senha:', err);
      return res.status(500).json({ error: 'Falha ao solicitar redefinição de senha' });
    }
  },

  /**
   * Redefinir senha
   */
  async resetPassword(req, res) {
    try {
      const { token, novaSenha } = req.body;

      if (!token || !novaSenha) {
        return res.status(400).json({ error: 'Token e nova senha são obrigatórios' });
      }

      // Verificar requisitos de senha
      if (novaSenha.length < authConfig.password.minLength) {
        return res.status(400).json({ 
          error: `A senha deve ter no mínimo ${authConfig.password.minLength} caracteres` 
        });
      }

      // Buscar usuário com o token e que não esteja expirado
      const usuario = await Usuario.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: new Date() }
      });

      if (!usuario) {
        return res.status(400).json({ error: 'Token inválido ou expirado' });
      }

      // Atualizar a senha
      usuario.senha = novaSenha;
      usuario.resetPasswordToken = undefined;
      usuario.resetPasswordExpires = undefined;
      await usuario.save();

      return res.json({ message: 'Senha redefinida com sucesso' });
    } catch (err) {
      console.error('Erro ao redefinir senha:', err);
      return res.status(500).json({ error: 'Falha ao redefinir senha' });
    }
  },

  /**
   * Obter dados do usuário atual
   */
  async me(req, res) {
    try {
      // O middleware de autenticação já adiciona o usuário na requisição
      const usuario = await Usuario.findById(req.userId);
      
      if (!usuario) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      return res.json({ usuario });
    } catch (err) {
      console.error('Erro ao obter dados do usuário:', err);
      return res.status(500).json({ error: 'Falha ao obter dados do usuário' });
    }
  },

  /**
   * Atualizar dados do usuário
   */
  async update(req, res) {
    try {
      const { nome, telefone } = req.body;

      const usuario = await Usuario.findById(req.userId);
      
      if (!usuario) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      // Atualizar apenas os campos permitidos
      if (nome) usuario.nome = nome;
      if (telefone) usuario.telefone = telefone;

      await usuario.save();

      return res.json({ usuario });
    } catch (err) {
      console.error('Erro ao atualizar usuário:', err);
      return res.status(500).json({ error: 'Falha ao atualizar usuário' });
    }
  }
};

module.exports = authController;