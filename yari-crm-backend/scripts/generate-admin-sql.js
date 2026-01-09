// Script para generar el SQL del usuario admin
// Ejecutar: node scripts/generate-admin-sql.js

const bcrypt = require('bcrypt');

async function generateSQL() {
  console.log('🔐 Generando hash de contraseña...\n');
  
  const hash = await bcrypt.hash('admin123', 10);
  
  console.log('✅ Hash generado exitosamente\n');
  console.log('='.repeat(60));
  console.log('📋 COPIA Y EJECUTA ESTE SQL EN SUPABASE:');
  console.log('='.repeat(60));
  console.log('\n');
  
  const sql = `INSERT INTO staff (email, password, full_name)
VALUES (
  'admin@yaritaft.com',
  '${hash}',
  'Administrador'
);`;
  
  console.log(sql);
  console.log('\n');
  console.log('='.repeat(60));
  console.log('✅ Después de ejecutar el SQL, podrás hacer login con:');
  console.log('   Email: admin@yaritaft.com');
  console.log('   Contraseña: admin123');
  console.log('='.repeat(60));
}

generateSQL().catch(console.error);
