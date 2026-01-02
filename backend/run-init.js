/**
 * Script para executar init.sql no banco de dados PostgreSQL
 * Execute com: node run-init.js
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Configuração do banco
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'canal_ouvidoria',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

async function runMigration() {
  console.log('🔄 Conectando ao banco de dados...');
  
  const client = await pool.connect();
  
  try {
    console.log('✅ Conectado!');
    console.log('📂 Lendo arquivo init.sql...');
    
    const sqlPath = path.join(__dirname, 'init.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('⚙️  Executando script SQL...');
    
    await client.query(sql);
    
    console.log('✅ Script executado com sucesso!');
    console.log('');
    console.log('📊 Verificando dados criados...');
    
    // Verificar tabelas
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    
    console.log(`\n✅ ${tablesResult.rows.length} tabelas criadas:`);
    tablesResult.rows.forEach(row => {
      console.log(`   - ${row.table_name}`);
    });
    
    // Verificar usuários
    const usersResult = await client.query('SELECT id, nome, email, tipo FROM usuarios;');
    
    console.log(`\n👤 ${usersResult.rows.length} usuário(s) criado(s):`);
    usersResult.rows.forEach(user => {
      console.log(`   - ${user.nome} (${user.email}) - Tipo: ${user.tipo}`);
    });
    
    // Verificar comitês
    const committeesResult = await client.query('SELECT id, nome FROM comites;');
    
    console.log(`\n📋 ${committeesResult.rows.length} comitê(s) criado(s):`);
    committeesResult.rows.forEach(comite => {
      console.log(`   - ${comite.nome}`);
    });
    
    console.log('\n🎉 Banco de dados inicializado com sucesso!');
    console.log('\n📝 Próximo passo:');
    console.log('   - Reinicie o backend: npm run dev');
    console.log('   - Faça login com: admin@ouvidoria.com');
    
  } catch (error) {
    console.error('❌ Erro ao executar script:', error.message);
    
    if (error.message.includes('already exists')) {
      console.log('\n⚠️  Parece que as tabelas já existem.');
      console.log('   Se quiser recriar o banco, execute:');
      console.log('   DROP DATABASE canal_ouvidoria; CREATE DATABASE canal_ouvidoria;');
    }
    
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

// Executar
runMigration().catch(error => {
  console.error('❌ Erro fatal:', error);
  process.exit(1);
});
