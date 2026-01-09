/**
 * Script para crear el primer usuario admin
 * Ejecutar: npx ts-node scripts/create-admin.ts
 */

import * as bcrypt from 'bcrypt';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Cargar variables de entorno
dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: SUPABASE_URL y SUPABASE_KEY deben estar en .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createAdmin() {
  const email = 'admin@yaritaft.com';
  const password = 'admin123';
  const fullName = 'Administrador';

  // Verificar si ya existe
  const { data: existing } = await supabase
    .from('staff')
    .select('id')
    .eq('email', email)
    .single();

  if (existing) {
    console.log('⚠️  El usuario admin ya existe');
    return;
  }

  // Hash de la contraseña
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  // Crear admin
  const { data, error } = await supabase
    .from('staff')
    .insert({
      email,
      password: hashedPassword,
      full_name: fullName,
    })
    .select()
    .single();

  if (error) {
    console.error('❌ Error creando admin:', error.message);
    process.exit(1);
  }

  console.log('✅ Usuario admin creado exitosamente:');
  console.log(`   Email: ${email}`);
  console.log(`   Contraseña: ${password}`);
  console.log(`   Nombre: ${fullName}`);
}

createAdmin()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
