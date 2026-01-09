# 🔧 Solución Detallada al Error 404

## Problema
Al hacer clic en el link del email, aparece:
```
{"message":"Cannot GET /report?token=...","error":"Not Found","statusCode":404}
```

Y notas que el puerto cambia de 3001 a 3000.

## Causa Raíz
El error viene del **backend de NestJS**, lo que significa que el navegador está intentando acceder a:
- `http://localhost:3000/report?token=...` (backend) ❌

En lugar de:
- `http://localhost:3000/report?token=...` (frontend) ✅

El problema es que **ambos están en el puerto 3000**, pero el backend no tiene la ruta `/report` (esa ruta está en el frontend de Next.js).

## Solución

### Paso 1: Verificar en qué puerto está el Frontend

Abre la terminal donde corre el frontend y verifica el mensaje:
```
▲ Next.js 16.1.1
- Local:        http://localhost:3000
```

O puede ser:
```
- Local:        http://localhost:3001
```

### Paso 2: Configurar FRONTEND_URL en el Backend

Abre `yari-crm-backend/.env` y agrega/verifica:

**Si el frontend está en puerto 3000:**
```env
FRONTEND_URL=http://localhost:3000
```

**Si el frontend está en puerto 3001:**
```env
FRONTEND_URL=http://localhost:3001
```

### Paso 3: Reiniciar el Backend

**IMPORTANTE:** Después de cambiar el `.env`, debes **reiniciar el backend** para que tome los nuevos valores.

1. Detén el backend (Ctrl+C)
2. Vuelve a iniciarlo: `npm run start:dev`

### Paso 4: Generar un Nuevo Link

Los links viejos que se generaron antes de cambiar la configuración seguirán teniendo el puerto incorrecto. 

**Solución:** Envía un nuevo formulario al estudiante para generar un link nuevo con la configuración correcta.

### Paso 5: Verificar el Link

Cuando recibas el email, el link debería ser:
- `http://localhost:3000/report?token=...` (si frontend está en 3000)
- `http://localhost:3001/report?token=...` (si frontend está en 3001)

**NO debería ser:**
- `http://localhost:3000/report?token=...` cuando el backend está en 3000 (eso causaría el 404)

---

## Verificación Rápida

1. **Frontend corriendo:** ✅
   ```bash
   cd yari-crm-frontend
   npm run dev
   ```

2. **Backend corriendo:** ✅
   ```bash
   cd yari-crm-backend
   npm run start:dev
   ```

3. **`.env` configurado:** ✅
   ```env
   FRONTEND_URL=http://localhost:3000  # o 3001 según tu caso
   ```

4. **Backend reiniciado después de cambiar `.env`:** ✅

5. **Link nuevo generado:** ✅ (envía un nuevo formulario)

---

## Si el Problema Persiste

### Opción 1: Verificar manualmente el link generado

1. Envía un formulario manualmente
2. Revisa los logs del backend - debería mostrar el link generado
3. Copia ese link y ábrelo manualmente en el navegador
4. Si funciona manualmente, el problema es solo la configuración del puerto

### Opción 2: Usar el puerto correcto en el navegador

Si el link dice `http://localhost:3001/report?token=...` pero tu frontend está en 3000:
- Cambia manualmente en el navegador a `http://localhost:3000/report?token=...`

### Opción 3: Verificar que Next.js esté sirviendo la ruta

Abre directamente en el navegador:
- `http://localhost:3000/report` (sin token)

Deberías ver la página del formulario (aunque diga error de token, eso está bien - significa que la ruta existe).

---

## Nota Importante

El código ya está actualizado para usar `localhost:3000` por defecto, pero si tu frontend corre en otro puerto, **debes configurarlo en el `.env` del backend**.
