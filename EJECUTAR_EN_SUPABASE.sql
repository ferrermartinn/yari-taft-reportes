-- ============================================
-- SQL PARA EJECUTAR EN SUPABASE
-- ============================================
-- Copia TODO este contenido y pégalo en el SQL Editor de Supabase
-- Luego haz click en "Run" o presiona Ctrl+Enter
-- ============================================

-- 1. Crear la tabla staff
CREATE TABLE IF NOT EXISTS staff (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  full_name TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  last_login_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. Crear índice para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_staff_email ON staff(email);

-- ============================================
-- 3. CREAR USUARIO ADMIN
-- ============================================
-- ⚠️ IMPORTANTE: Necesitas generar el hash primero
-- 
-- OPCIÓN A: Usar el script (Recomendado)
-- Ejecuta: cd yari-crm-backend && node scripts/generate-admin-sql.js
-- Copia el INSERT que genera y ejecútalo aquí
--
-- OPCIÓN B: Usar el script que crea directamente
-- Ejecuta: cd yari-crm-backend && node scripts/create-admin-simple.js
-- (Este script crea el usuario automáticamente, no necesitas SQL)
--
-- OPCIÓN C: Generar hash manualmente
-- Ejecuta en Node.js:
-- const bcrypt = require('bcrypt');
-- bcrypt.hash('admin123', 10).then(hash => console.log(hash));
-- Luego pega el hash en el INSERT de abajo

-- 3. Insertar usuario admin (descomenta y ejecuta)
INSERT INTO staff (email, password, full_name)
VALUES (
  'admin@yaritaft.com',
  '$2b$10$hbMUPQbKk3xjGA8.F45NaOizGPnfow2V8KNV4Rz9pi248NJwDlWYW',
  'Administrador'
);

-- ============================================
-- VERIFICACIÓN
-- ============================================
-- Después de ejecutar, verifica que la tabla existe:
-- SELECT * FROM staff;
