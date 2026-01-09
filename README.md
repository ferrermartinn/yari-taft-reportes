# 🎓 Yari Taft CRM - Sistema de Gestión de Estudiantes y Reportes Semanales

Sistema completo de gestión para seguimiento de estudiantes, envío automático de formularios semanales y análisis de progreso.

## 📋 Tabla de Contenidos

- [Características](#-características)
- [Tecnologías](#-tecnologías)
- [Instalación](#-instalación)
- [Configuración](#-configuración)
- [Uso](#-uso)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [API Endpoints](#-api-endpoints)
- [Deployment](#-deployment)

## ✨ Características

### Gestión de Estudiantes
- ✅ CRUD completo de estudiantes (crear, leer, actualizar, eliminar)
- ✅ Perfiles detallados con historial de reportes
- ✅ Seguimiento de estado: Activo, En Riesgo, Inactivo
- ✅ Métricas de cumplimiento de formularios (porcentaje de envíos)

### Sistema de Formularios Semanales
- ✅ Envío automático de formularios según día configurado
- ✅ Links únicos y seguros con expiración de 7 días (configurable)
- ✅ Formulario web responsive para estudiantes
- ✅ Métricas de seguimiento: procesos activos, entrevistas, challenges, etc.

### Dashboard y Análisis
- ✅ Dashboard principal con estadísticas en tiempo real
- ✅ Filtros por estado de estudiante (Activos, En Riesgo, Inactivos)
- ✅ Últimos reportes recibidos con nombres de estudiantes
- ✅ Gráficos y visualizaciones de progreso

### Automatización
- ✅ Envío automático semanal configurable (día de la semana)
- ✅ Marcado automático de estudiantes "En Riesgo" (14 días sin reporte)
- ✅ Marcado automático de estudiantes "Inactivos" (21 días sin reporte)
- ✅ Recordatorios automáticos (configurable)

### Sistema de Staff
- ✅ Autenticación con bcrypt
- ✅ Gestión de cuentas de staff desde el dashboard
- ✅ Sistema de permisos y roles

### Auditoría
- ✅ Registro completo de todos los links enviados
- ✅ Historial de reportes recibidos
- ✅ Seguimiento de reportes fallidos (no enviados a tiempo)
- ✅ Trazabilidad completa de acciones

### Integración de Emails
- ✅ Soporte para Postmark (recomendado) o ActiveCampaign/Wildmail
- ✅ Detección automática del proveedor configurado
- ✅ Envío rápido y confiable de emails
- ✅ Plantillas HTML profesionales

## 🛠 Tecnologías

### Backend
- **NestJS** - Framework Node.js
- **TypeScript** - Lenguaje de programación
- **Supabase** - Base de datos PostgreSQL
- **Postmark** o **ActiveCampaign** - Envío de emails transaccionales
- **bcrypt** - Hash de contraseñas
- **Cron Jobs** - Tareas programadas

### Frontend
- **Next.js 16** - Framework React
- **React 19** - Biblioteca UI
- **TypeScript** - Lenguaje de programación
- **Axios** - Cliente HTTP

## 🚀 Instalación

### Requisitos Previos
- Node.js 18+
- npm o yarn
- Cuenta de Supabase
- Cuenta de Postmark O ActiveCampaign/Wildmail

### 1. Clonar el Repositorio
```bash
git clone [url-del-repositorio]
cd yari-taft-reportes
```

### 2. Instalar Dependencias

**Backend:**
```bash
cd yari-crm-backend
npm install
```

**Frontend:**
```bash
cd yari-crm-frontend
npm install
```

## ⚙️ Configuración

### Variables de Entorno - Backend

Crea `yari-crm-backend/.env`:

```env
# Supabase
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_KEY=tu-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key

# Email Provider (elige uno - Postmark tiene prioridad si ambos están configurados):
# Opción 1: Postmark (recomendado)
POSTMARK_API_KEY=tu-postmark-api-key
POSTMARK_FROM_EMAIL=hola@yaritaft.com

# Opción 2: ActiveCampaign/Wildmail
WILDMAIL_API_URL=https://yaritaft.api-us1.com
WILDMAIL_API_KEY=tu-api-key-de-activecampaign
WILDMAIL_FROM_EMAIL=hola@yaritaft.com

# Frontend URL
FRONTEND_URL=http://localhost:3000

# Puerto del backend
PORT=3000

# Entorno
NODE_ENV=development
```

### Variables de Entorno - Frontend

Crea `yari-crm-frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### Configuración de Base de Datos

Ejecuta el SQL en Supabase (ver `EJECUTAR_EN_SUPABASE.sql`):

```sql
-- Tabla de estudiantes
CREATE TABLE IF NOT EXISTS students (
  id SERIAL PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  country TEXT,
  city TEXT,
  status TEXT DEFAULT 'active',
  last_interaction_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de magic links
CREATE TABLE IF NOT EXISTS magic_links (
  id SERIAL PRIMARY KEY,
  student_id INTEGER REFERENCES students(id),
  token TEXT NOT NULL UNIQUE,
  status TEXT DEFAULT 'pending',
  week_start_date TIMESTAMP,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de reportes semanales
CREATE TABLE IF NOT EXISTS weekly_reports (
  id SERIAL PRIMARY KEY,
  student_id INTEGER REFERENCES students(id),
  magic_link_id INTEGER REFERENCES magic_links(id),
  week_date DATE,
  submitted_at TIMESTAMP DEFAULT NOW(),
  answers JSONB,
  procesos_activos INTEGER DEFAULT 0,
  entrevistas_rrhh INTEGER DEFAULT 0,
  entrevistas_tecnicas INTEGER DEFAULT 0,
  challenges INTEGER DEFAULT 0,
  rechazos INTEGER DEFAULT 0,
  ghosting INTEGER DEFAULT 0,
  propuestas INTEGER DEFAULT 0,
  resumen TEXT,
  bloqueos TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de staff
CREATE TABLE IF NOT EXISTS staff (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  full_name TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  last_login_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de configuración del sistema
CREATE TABLE IF NOT EXISTS system_config (
  id SERIAL PRIMARY KEY,
  send_day TEXT DEFAULT 'monday',
  expiration_days INTEGER DEFAULT 7,
  risk_days INTEGER DEFAULT 14,
  inactive_days INTEGER DEFAULT 21,
  reminder_enabled BOOLEAN DEFAULT true,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Insertar configuración por defecto
INSERT INTO system_config (send_day, expiration_days, risk_days, inactive_days)
VALUES ('monday', 7, 14, 21)
ON CONFLICT DO NOTHING;

-- Crear usuario admin (genera el hash con: node scripts/generate-admin-sql.js)
INSERT INTO staff (email, password, full_name)
VALUES (
  'admin@yaritaft.com',
  '$2b$10$[hash-generado]',
  'Administrador'
);
```

## 🎯 Uso

### Iniciar el Sistema

**Terminal 1 - Backend:**
```bash
cd yari-crm-backend
npm run start:dev
```

**Terminal 2 - Frontend:**
```bash
cd yari-crm-frontend
npm run dev
```

### Acceder al Sistema

1. Abre: `http://localhost:3000` (o el puerto que muestre el frontend)
2. Login con:
   - Email: `admin@yaritaft.com`
   - Contraseña: `admin123`

### Funcionalidades Principales

#### Dashboard
- Ver estadísticas generales
- Últimos reportes recibidos
- Filtros por estado de estudiante
- Accesos rápidos

#### Gestión de Alumnos
- Agregar nuevos estudiantes
- Ver lista completa
- Editar información
- Enviar formularios manualmente
- Ver perfil completo con historial

#### Configuración
- Configurar día de envío semanal
- Días de expiración de links
- Días para marcar como "en riesgo" o "inactivo"
- Gestión de cuentas de staff

#### Auditoría
- Ver todos los links enviados
- Historial de reportes
- Reportes fallidos
- Seguimiento completo

## 📁 Estructura del Proyecto

```
yari-taft-reportes/
├── yari-crm-backend/          # Backend NestJS
│   ├── src/
│   │   ├── students/          # Módulo de estudiantes
│   │   ├── magic-links/       # Módulo de links únicos
│   │   ├── weekly-reports/    # Módulo de reportes
│   │   ├── staff/             # Módulo de staff
│   │   ├── config/            # Configuración del sistema
│   │   ├── audit/             # Módulo de auditoría
│   │   ├── sync/              # Tareas automáticas (cron)
│   │   ├── mail/              # Servicio de emails
│   │   └── supabase/          # Cliente Supabase
│   └── scripts/               # Scripts de utilidad
│
├── yari-crm-frontend/         # Frontend Next.js
│   ├── app/
│   │   ├── dashboard/        # Dashboard principal
│   │   ├── login/             # Página de login
│   │   └── report/            # Formulario para estudiantes
│   └── src/
│       └── lib/               # Utilidades
│
└── EJECUTAR_EN_SUPABASE.sql   # SQL para setup inicial
```

## 🔌 API Endpoints

### Estudiantes
- `GET /students` - Listar todos
- `GET /students/:id` - Obtener uno
- `POST /students` - Crear
- `PATCH /students/:id` - Actualizar
- `DELETE /students/:id` - Eliminar

### Magic Links
- `POST /magic-links/send-one/:id` - Enviar link a estudiante
- `GET /magic-links/validate?token=xxx` - Validar token

### Reportes
- `GET /weekly-reports` - Listar todos
- `GET /weekly-reports/student/:id` - Reportes de un estudiante
- `POST /weekly-reports` - Crear reporte

### Staff
- `POST /staff/login` - Login
- `GET /staff` - Listar staff
- `POST /staff` - Crear staff
- `PATCH /staff/:id` - Actualizar
- `DELETE /staff/:id` - Eliminar

### Configuración
- `GET /config` - Obtener configuración
- `POST /config` - Actualizar configuración

### Auditoría
- `GET /audit` - Obtener datos de auditoría

### Sync (Tareas Automáticas)
- `POST /sync/weekly-reports` - Forzar envío semanal
- `POST /sync/check-inactive` - Verificar inactivos
- `POST /sync/test-send/:studentId` - Enviar email de prueba

## 🚀 Deployment

### Backend
1. Configurar variables de entorno en el servidor
2. Build: `npm run build`
3. Iniciar: `npm run start:prod`

### Frontend
1. Configurar `NEXT_PUBLIC_API_URL` en variables de entorno
2. Build: `npm run build`
3. Iniciar: `npm run start`

### Configuración de Email

El sistema soporta **Postmark** (recomendado) o **ActiveCampaign/Wildmail**. Se detecta automáticamente según las variables de entorno configuradas.

**Opción 1: Postmark (Recomendado)**
```env
POSTMARK_API_KEY=tu-server-api-token
POSTMARK_FROM_EMAIL=hola@yaritaft.com
```
- Más simple: un solo endpoint
- Mejor para emails transaccionales
- Obtener API Key: [postmarkapp.com](https://postmarkapp.com) o desde ActiveCampaign si está integrado

**Opción 2: ActiveCampaign/Wildmail**
```env
WILDMAIL_API_URL=https://yaritaft.api-us1.com
WILDMAIL_API_KEY=tu-api-key
WILDMAIL_FROM_EMAIL=hola@yaritaft.com
```
- Requiere crear contacto → email → campaña
- Necesita dominio verificado para usar `hola@yaritaft.com`

**Nota:** Si ambas están configuradas, Postmark tiene prioridad.

**Resumen rápido:**
1. Acceder a ActiveCampaign → Settings → Sending Domain
2. Agregar dominio `yaritaft.com`
3. Copiar los 3 registros DNS (SPF, DKIM, DMARC) que ActiveCampaign genera
4. Agregar esos registros en el proveedor donde está registrado el dominio
5. Esperar propagación DNS (1-2 horas normalmente)
6. Verificar en ActiveCampaign que muestre "Verified"
7. Probar enviar un email desde la aplicación

## 📝 Scripts Útiles

### Generar Hash de Contraseña para Admin
```bash
cd yari-crm-backend
node scripts/generate-admin-sql.js
```

### Crear Usuario Admin Directamente
```bash
cd yari-crm-backend
node scripts/create-admin-simple.js
```

## 🔒 Seguridad

- Contraseñas hasheadas con bcrypt
- Tokens únicos para formularios
- Links con expiración automática
- Validación de datos en backend
- CORS configurado

## 📊 Estado del Proyecto

**Completado: ~95%**

✅ Sistema completo funcional
✅ Todas las funcionalidades principales implementadas
✅ Integración con ActiveCampaign
⚠️ Pendiente: Verificación de dominio para emails

## 🤝 Contribución

Este es un proyecto privado para Yari Taft.

## 📄 Licencia

Privado - Todos los derechos reservados

---

**Desarrollado para Yari Taft** 🎓
