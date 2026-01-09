-- Tabla de Staff (Personal autorizado)
CREATE TABLE IF NOT EXISTS staff (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  full_name TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  last_login_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Índice para búsquedas rápidas por email
CREATE INDEX IF NOT EXISTS idx_staff_email ON staff(email);

-- Insertar usuario admin inicial (password: admin123)
-- La contraseña debe ser hasheada con bcrypt antes de insertar
-- Por ahora, inserta manualmente después de crear el primer staff desde la UI
-- O ejecuta este código en Node.js para generar el hash:
-- const bcrypt = require('bcrypt');
-- bcrypt.hash('admin123', 10).then(hash => console.log(hash));

-- Nota: Para crear el primer usuario admin, puedes:
-- 1. Usar la interfaz de gestión de staff (recomendado)
-- 2. O insertar manualmente con un hash generado
