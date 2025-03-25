// listarBancos.js
require('dotenv').config();
const { MongoClient } = require('mongodb');

async function listarBancos() {
  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    await client.connect();
    
    // Listar todos os bancos de dados
    const dbs = await client.db().admin().listDatabases();
    console.log('Bancos de dados disponíveis:');
    dbs.databases.forEach(db => console.log(` - ${db.name}`));
    
    // Para cada banco, listar coleções
    for (const db of dbs.databases) {
      if (!['admin', 'local', 'config'].includes(db.name)) {
        const database = client.db(db.name);
        const collections = await database.listCollections().toArray();
        
        console.log(`\nColeções no banco ${db.name}:`);
        collections.forEach(coll => console.log(` - ${coll.name}`));
        
        // Verificar usuários em cada coleção que possa ter usuários
        for (const coll of collections) {
          if (['users', 'usuarios', 'user', 'usuario'].includes(coll.name.toLowerCase())) {
            const usuarios = await database.collection(coll.name).find({}).toArray();
            console.log(`\nUsuários na coleção ${coll.name}:`);
            console.log(`Total: ${usuarios.length}`);
            usuarios.forEach(u => console.log(` - ${u.email}`));
          }
        }
      }
    }
  } catch (error) {
    console.error('Erro ao listar bancos:', error);
  } finally {
    await client.close();
  }
}

listarBancos();