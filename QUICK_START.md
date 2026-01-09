# ⚡ Inicio Rápido - Yari Taft CRM

## 🚀 Inicio en 5 Minutos

### 1. Configurar Variables de Entorno

Crea `yari-crm-backend/.env`:

```env
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_KEY=tu-supabase-anon-key
GMAIL_USER=tu-email@gmail.com
GMAIL_APP_PASSWORD=tu-app-password
FRONTEND_URL=http://localhost:3000
```

### 2. Crear Tablas en Supabase

Ejecuta el SQL del archivo `SETUP_AND_TESTING.md` en el SQL Editor de Supabase.

### 3. Iniciar Backend

```bash
cd yari-crm-backend
npm install
npm run start:dev
```

Espera ver: `🚀 Backend corriendo en http://localhost:3000`

### 4. Iniciar Frontend (nueva terminal)

```bash
cd yari-crm-frontend
npm install
npm run dev
```

### 5. Abrir Navegador

Ve a: `http://localhost:3000`

**Login:**
- Email: `admin@yaritaft.com`
- Password: `admin123`

---

## 🧪 Testing Rápido

1. **Agregar Alumno:** Dashboard → Gestión de Alumnos → ➕ Agregar Alumno
2. **Enviar Formulario:** Click en "📧 Enviar Formulario"
3. **Revisar Email:** Abre el link del email
4. **Completar Formulario:** Llena y envía
5. **Verificar:** Dashboard debería mostrar el reporte

---

## 📚 Guía Completa

Para el procedimiento detallado, ver `SETUP_AND_TESTING.md`
