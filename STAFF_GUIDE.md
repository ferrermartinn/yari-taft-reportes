# 👥 Guía de Gestión de Staff

## 📋 Configuración Inicial

### 1. Crear la Tabla en Supabase

Ejecuta este SQL en el SQL Editor de Supabase:

```sql
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
```

### 2. Crear el Primer Usuario Admin

**Opción A: Desde la Interfaz (Recomendado)**

1. Inicia el backend y frontend
2. Ve a `/dashboard/gestion/configuracion`
3. En la sección "Gestión de Staff", haz clic en "+ Agregar Staff"
4. Completa:
   - Nombre: Administrador
   - Email: admin@yaritaft.com (o el que prefieras)
   - Contraseña: admin123 (o la que prefieras)
5. Haz clic en "Guardar"

**Opción B: Script de Node.js**

Si prefieres crear el admin desde la terminal:

```bash
cd yari-crm-backend
npx ts-node scripts/create-admin.ts
```

Esto creará un usuario con:
- Email: `admin@yaritaft.com`
- Contraseña: `admin123`
- Nombre: `Administrador`

---

## 🔐 Login

Una vez creado el primer usuario:

1. Ve a `/login`
2. Ingresa el email y contraseña del staff
3. Haz clic en "Ingresar"
4. Serás redirigido al dashboard

---

## 👥 Gestión de Staff

### Agregar Nuevo Staff

1. Ve a **Configuración** → **Gestión de Staff**
2. Haz clic en **"+ Agregar Staff"**
3. Completa:
   - **Nombre Completo**: Nombre del miembro del staff
   - **Email**: Email único (será usado para login)
   - **Contraseña**: Contraseña elegida por el staff
4. Haz clic en **"Guardar"**

### Editar Staff

1. En la lista de staff, haz clic en **"Editar"**
2. Puedes modificar:
   - **Nombre Completo**
   - **Contraseña** (dejar vacío para mantener la actual)
3. Haz clic en **"Guardar Cambios"**

### Eliminar Staff

1. En la lista de staff, haz clic en **"Eliminar"**
2. Confirma la eliminación

---

## 🔒 Seguridad

- Las contraseñas se almacenan con hash bcrypt (no se pueden ver)
- Cada email debe ser único
- El sistema registra el último login de cada staff
- Las contraseñas tienen un mínimo de 6 caracteres (recomendado)

---

## 📝 Notas Importantes

- **Primer Usuario**: Debes crear al menos un usuario admin para poder acceder al sistema
- **Email Único**: No se pueden crear dos staff con el mismo email
- **Contraseñas**: No se pueden recuperar, solo cambiar desde la edición
- **Último Login**: Se actualiza automáticamente cada vez que un staff inicia sesión

---

## 🐛 Solución de Problemas

### Error: "Este email ya está registrado"
- El email ya existe en la base de datos
- Usa otro email o edita el staff existente

### Error: "Credenciales incorrectas" en login
- Verifica que el email y contraseña sean correctos
- Asegúrate de que el staff existe en la base de datos

### No puedo crear el primer usuario
- Verifica que la tabla `staff` existe en Supabase
- Verifica que el backend está corriendo
- Revisa los logs del backend para ver errores

---

## ✅ Checklist de Setup

- [ ] Tabla `staff` creada en Supabase
- [ ] Backend corriendo (`npm run start:dev`)
- [ ] Frontend corriendo (`npm run dev`)
- [ ] Primer usuario admin creado
- [ ] Login funcionando correctamente
- [ ] Puedes agregar nuevos staff desde la interfaz
