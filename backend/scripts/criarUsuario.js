const mongoose = require('mongoose');
const dbConfig = require('../src/config/database');
const Usuario = require('../src/models/Usuario');

async function criarUsuarioTeste() {
  try {
    console.log('Configuração de banco:', dbConfig);

    // Conectar ao banco de dados
    await mongoose.connect(dbConfig.uri, dbConfig.options);
    console.log('Conexão com MongoDB estabelecida');

    // Verificar se o usuário já existe
    const usuarioExistente = await Usuario.findOne({ 
      email: 'talles.nicacio@gmail.com' 
    });

    if (usuarioExistente) {
      console.log('Usuário já existe');
      await mongoose.connection.close();
      return;
    }

    // Criar novo usuário
    const novoUsuario = new Usuario({
      nome: 'Talles Nicacio',
      email: 'talles.nicacio@gmail.com',
      senha: '9YGhahaVKu21Rj',
      tipo: 'vendedor',
      cpfCnpj: '12345678900',
      telefone: '(11) 99999-9999',
      verificado: true,
      vendedor: {
        dataNascimento: new Date('1990-01-01'),
        endereco: {
          logradouro: 'Rua Exemplo',
          numero: '123',
          bairro: 'Centro',
          cidade: 'São Paulo',
          estado: 'SP',
          cep: '01000-000'
        }
      }
    });

    await novoUsuario.save();
    console.log('Usuário criado com sucesso!');

    await mongoose.connection.close();
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    if (mongoose.connection) {
      await mongoose.connection.close();
    }
    process.exit(1);
  }
}

criarUsuarioTeste();