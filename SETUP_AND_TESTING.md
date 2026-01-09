# 🚀 Guía de Setup y Testing - Yari Taft CRM

## 📋 Tabla de Contenidos
1. [Requisitos Previos](#requisitos-previos)
2. [Configuración Inicial](#configuración-inicial)
3. [Setup del Backend](#setup-del-backend)
4. [Setup del Frontend](#setup-del-frontend)
5. [Configuración de Supabase](#configuración-de-supabase)
6. [Procedimiento de Testing Completo](#procedimiento-de-testing-completo)

---

## 📦 Requisitos Previos

- Node.js 18+ instalado
- npm o yarn
- Cuenta de Supabase (gratis)
- Cuenta de Gmail con "App Password" configurada

---

## ⚙️ Configuración Inicial

### 1. Variables de Entorno del Backend

Crea un archivo `.env` en `yari-crm-backend/`:

```env
# Supabase
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_KEY=tu-supabase-anon-key

# Gmail (para envío de emails)
GMAIL_USER=tu-email@gmail.com
GMAIL_APP_PASSWORD=tu-app-password-de-gmail

# Frontend URL (opcional, default: http://localhost:3001)
FRONTEND_URL=http://localhost:3000

# Puerto del backend (opcional, default: 3000)
PORT=3000
```

**Cómo obtener App Password de Gmail:**
1. Ve a tu cuenta de Google
2. Seguridad → Verificación en 2 pasos (debe estar activada)
3. Contraseñas de aplicaciones → Generar nueva
4. Copia la contraseña generada

---

## 🗄️ Configuración de Supabase

### 1. Crear las Tablas Necesarias

Ejecuta estos SQL en el SQL Editor de Supabase:

```sql
-- Tabla de estudiantes
CREATE TABLE IF NOT EXISTS students (
  id SERIAL PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  country TEXT,
  city TEXT,
  telegram_id TEXT,
  status TEXT DEFAULT 'active',
  last_interaction_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de magic links
CREATE TABLE IF NOT EXISTS magic_links (
  id SERIAL PRIMARY KEY,
  student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  status TEXT DEFAULT 'pending', -- pending, completed, expired
  week_start_date TIMESTAMP,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de reportes semanales
CREATE TABLE IF NOT EXISTS weekly_reports (
  id SERIAL PRIMARY KEY,
  student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
  answers JSONB NOT NULL,
  week_start TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de configuración del sistema
CREATE TABLE IF NOT EXISTS system_config (
  id INTEGER PRIMARY KEY DEFAULT 1,
  send_day TEXT DEFAULT 'monday',
  send_time TEXT DEFAULT '09:00',
  frequency TEXT DEFAULT 'weekly',
  expiration_days INTEGER DEFAULT 7,
  reminder_enabled BOOLEAN DEFAULT true,
  reminder_days INTEGER DEFAULT 3,
  inactive_days INTEGER DEFAULT 21,
  risk_days INTEGER DEFAULT 14,
  updated_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT single_config CHECK (id = 1)
);

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

-- Índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_students_status ON students(status);
CREATE INDEX IF NOT EXISTS idx_magic_links_token ON magic_links(token);
CREATE INDEX IF NOT EXISTS idx_magic_links_student ON magic_links(student_id);
CREATE INDEX IF NOT EXISTS idx_weekly_reports_student ON weekly_reports(student_id);
CREATE INDEX IF NOT EXISTS idx_students_email ON students(email);
```

### 2. Verificar que las tablas se crearon

En Supabase, ve a Table Editor y verifica que existan:
- `students`
- `magic_links`
- `weekly_reports`
- `system_config`

---

## 🔧 Setup del Backend

### 1. Instalar dependencias

```bash
cd yari-crm-backend
npm install
```

### 2. Verificar que el archivo .env existe

```bash
# En Windows PowerShell
Test-Path .env

# En Linux/Mac
ls -la .env
```

### 3. Iniciar el backend

```bash
npm run start:dev
```

Deberías ver:
```
🚀 Backend corriendo en http://localhost:3000
```

**Mantén esta terminal abierta** - el backend debe estar corriendo mientras pruebas.

---

## 🎨 Setup del Frontend

### 1. Instalar dependencias

Abre una **nueva terminal**:

```bash
cd yari-crm-frontend
npm install
```

### 2. Iniciar el frontend

```bash
npm run dev
```

Deberías ver:
```
  ▲ Next.js 16.1.1
  - Local:        http://localhost:3000
```

**Nota:** Si el puerto 3000 está ocupado, Next.js usará 3001 automáticamente.

---

## 🧪 Procedimiento de Testing Completo

### **PASO 1: Login y Acceso Inicial**

1. Abre el navegador en `http://localhost:3000` (o el puerto que indique Next.js)
2. Deberías ser redirigido automáticamente a `/login`
3. Usa las credenciales:
   - **Email:** `admin@yaritaft.com`
   - **Contraseña:** `admin123`
4. Haz clic en "Ingresar"
5. ✅ Deberías ver el Dashboard principal

---

### **PASO 2: Configuración del Sistema**

1. En el Dashboard, haz clic en **"Configuración"** (o ve a `/dashboard/gestion/configuracion`)
2. Verifica que se carguen los valores por defecto:
   - Día de envío: Lunes
   - Hora: 09:00
   - Días de expiración: 7
   - Días para En Riesgo: 14
   - Días para Inactivo: 21
3. Modifica algún valor (ej: cambia "Días para Inactivo" a 25)
4. Haz clic en **"💾 Guardar Configuración"**
5. ✅ Deberías ver un mensaje de éxito
6. Recarga la página y verifica que el valor se guardó

---

### **PASO 3: Agregar Alumnos**

1. Ve a **"Gestión de Alumnos"** (o `/dashboard/gestion/alumnos`)
2. Haz clic en **"➕ Agregar Alumno"**
3. Completa el formulario:
   - **Nombre:** Juan Pérez
   - **Email:** juan.perez@test.com
   - **Teléfono:** +54 11 1234-5678 (opcional)
4. Haz clic en **"Guardar"**
5. ✅ El alumno debería aparecer en la lista
6. Repite para agregar 2-3 alumnos más con diferentes emails

---

### **PASO 4: Ver Ficha de Alumno**

1. En la lista de alumnos, haz clic en **"👁️ Ver Ficha"** de cualquier alumno
2. ✅ Deberías ver:
   - Información del estudiante
   - Estado actual
   - Historial de reportes (vacío por ahora)
   - Métricas (todas en 0)

---

### **PASO 5: Envío Manual de Formulario**

1. En la lista de alumnos, haz clic en **"📧 Enviar Formulario"** de un alumno
2. Confirma el envío
3. ✅ Deberías ver un mensaje de éxito
4. Revisa el email del alumno (o tu bandeja de spam)
5. ✅ Deberías recibir un email con un link único

---

### **PASO 6: Completar Formulario como Estudiante**

1. Abre el email recibido
2. Haz clic en el link del formulario
3. ✅ Deberías ver el formulario de reporte semanal
4. Completa el formulario:
   - Incrementa algunos contadores (Procesos Activos, Entrevistas, etc.)
   - Escribe un resumen de la semana
   - Escribe algún bloqueo o necesidad
5. Haz clic en **"Enviar Reporte"**
6. ✅ Deberías ver un mensaje de éxito "¡Reporte Enviado!"

---

### **PASO 7: Verificar Reporte en el Dashboard**

1. Vuelve al Dashboard (`/dashboard`)
2. ✅ Deberías ver:
   - El contador de "Total Alumnos" actualizado
   - El contador de "Activos" actualizado
   - Un nuevo reporte en "Últimos Reportes Recibidos"
   - El alumno en "Alumnos Activos"

---

### **PASO 8: Verificar Ficha del Alumno Actualizada**

1. Ve a la ficha del alumno que completó el reporte
2. ✅ Deberías ver:
   - Estado cambiado a "Activo"
   - Un nuevo reporte en el historial
   - Métricas actualizadas (Procesos Activos, etc.)
   - Fecha de última interacción actualizada

---

### **PASO 9: Probar Auditoría**

1. Ve a **"Auditoría de Envíos"** (o `/dashboard/gestion/auditoria`)
2. ✅ Deberías ver 3 pestañas:
   - **Links Enviados:** Lista de todos los magic links
   - **Reportes:** Lista de todos los reportes recibidos
   - **Alumnos:** Lista completa de alumnos
3. Verifica las estadísticas en la parte superior
4. Navega entre las pestañas
5. ✅ Verifica que los datos se muestren correctamente

---

### **PASO 10: Probar Filtros y Búsqueda**

1. En la página de Alumnos, prueba:
   - **Búsqueda:** Escribe el nombre de un alumno
   - **Filtros:** Cambia entre "Todos", "Activos", "En Riesgo", "Inactivos"
2. ✅ Verifica que los filtros funcionen correctamente

---

### **PASO 11: Probar Envío Automático (Manual)**

Los cron jobs están configurados pero puedes ejecutarlos manualmente:

1. Abre Postman, Insomnia, o usa curl:
   
   ```bash
   # Verificar cuántos estudiantes se procesarían
   curl http://localhost:3000/sync/check-before-send
   
   # Ejecutar envío semanal manualmente
   curl -X POST http://localhost:3000/sync/weekly-reports
   
   # Verificar inactividad manualmente
   curl -X POST http://localhost:3000/sync/check-inactive
   ```

2. ✅ Verifica los logs en la terminal del backend
3. ✅ Verifica que se envíen emails a los estudiantes activos

---

### **PASO 12: Probar Expiración de Links**

1. En la página de Auditoría, pestaña "Links Enviados"
2. ✅ Verifica que los links expirados se marquen correctamente
3. Intenta usar un link expirado (si tienes uno)
4. ✅ Deberías ver un mensaje de error

---

### **PASO 13: Probar Estados Automáticos**

Para probar el cambio de estados automático:

1. **Simular estudiante "En Riesgo":**
   - En Supabase, actualiza manualmente `last_interaction_at` de un estudiante a hace 15 días:
   ```sql
   UPDATE students 
   SET last_interaction_at = NOW() - INTERVAL '15 days'
   WHERE email = 'juan.perez@test.com';
   ```
   - Ejecuta manualmente: `curl -X POST http://localhost:3000/sync/check-inactive`
   - ✅ El estudiante debería cambiar a "En Riesgo"

2. **Simular estudiante "Inactivo":**
   - Actualiza a hace 22 días:
   ```sql
   UPDATE students 
   SET last_interaction_at = NOW() - INTERVAL '22 days'
   WHERE email = 'juan.perez@test.com';
   ```
   - Ejecuta: `curl -X POST http://localhost:3000/sync/check-inactive`
   - ✅ El estudiante debería cambiar a "Inactivo"

3. **Volver a Activo:**
   - Envía un formulario manualmente al estudiante
   - Completa el reporte
   - ✅ El estudiante debería volver a "Activo"

---

## 🔍 Verificación de Funcionalidades

### ✅ Checklist Completo

- [ ] Login funciona
- [ ] Dashboard carga correctamente
- [ ] Configuración se guarda y carga
- [ ] Se pueden agregar alumnos
- [ ] Se pueden ver fichas de alumnos
- [ ] Envío manual de formularios funciona
- [ ] Los emails llegan correctamente
- [ ] Los links únicos funcionan
- [ ] Los formularios se pueden completar
- [ ] Los reportes se guardan correctamente
- [ ] El dashboard muestra estadísticas actualizadas
- [ ] La auditoría muestra todos los datos
- [ ] Los filtros y búsqueda funcionan
- [ ] Los estados se actualizan correctamente
- [ ] Los links expiran según la configuración

---

## 🐛 Troubleshooting

### Error: "Cannot connect to database"
- Verifica que las variables `SUPABASE_URL` y `SUPABASE_KEY` estén correctas
- Verifica que las tablas existan en Supabase

### Error: "Email not sent"
- Verifica `GMAIL_USER` y `GMAIL_APP_PASSWORD`
- Asegúrate de usar una "App Password", no tu contraseña normal
- Verifica que la verificación en 2 pasos esté activada en Gmail

### Error: "CORS error"
- Verifica que el frontend esté en el puerto correcto
- Verifica la configuración de CORS en `main.ts`

### Los cron jobs no se ejecutan
- Los cron jobs están activos pero solo se ejecutan en los horarios configurados
- Usa los endpoints manuales para probar: `/sync/weekly-reports` y `/sync/check-inactive`

### El frontend no se conecta al backend
- Verifica que el backend esté corriendo en `http://localhost:3000`
- Verifica que el frontend use la URL correcta (debería ser `http://localhost:3000`)

---

## 📝 Notas Importantes

1. **Cron Jobs:** Los cron jobs están activos pero:
   - Envío semanal: Se ejecuta cada lunes a las 9:00 AM
   - Verificación de inactividad: Se ejecuta cada día a medianoche
   - Para testing, usa los endpoints manuales

2. **Links Únicos:** Cada link es único y caduca según la configuración (default: 7 días)

3. **Estados:** Los estados se calculan automáticamente basándose en `last_interaction_at`

4. **Configuración:** Todos los parámetros son configurables desde la interfaz

---

## 🎉 ¡Listo para Usar!

Si todos los pasos funcionan correctamente, el sistema está listo para producción. 

**Próximos pasos recomendados:**
- Agregar más estudiantes
- Configurar los horarios de envío según tus necesidades
- Monitorear la auditoría regularmente
- Ajustar los días de inactividad según tu criterio
