# 🚀 Configurar Postmark - Guía Rápida

## ✅ ¿Qué es Postmark y por qué usarlo?

**Postmark** es un servicio especializado en **emails transaccionales** (confirmaciones, notificaciones, links únicos, etc.). Es mucho más simple y rápido que usar la API completa de ActiveCampaign.

### Ventajas de Postmark:
- ✅ **Más simple**: Un solo endpoint, no necesitas crear contactos/campañas
- ✅ **Más rápido**: Envío inmediato
- ✅ **Mejor entregabilidad**: Diseñado específicamente para emails transaccionales
- ✅ **Menos código**: Solo necesitas API Key y ya funciona

---

## 📋 Lo que Necesitas de tu Jefe

### Opción 1: Si ActiveCampaign tiene Postmark integrado
1. **Acceso al panel de ActiveCampaign**
2. **API Key de Postmark** (puede estar en Configuración → Desarrollador → Postmark)

### Opción 2: Si necesitas crear cuenta de Postmark
1. **Crear cuenta en [Postmark](https://postmarkapp.com)** (gratis hasta 100 emails/mes)
2. **Server API Token** (lo obtienes al crear un "Server" en Postmark)

---

## ⚙️ Configuración Rápida

### 1. Obtener API Key de Postmark

**Si tienes ActiveCampaign:**
- Ve a ActiveCampaign → Configuración → Desarrollador
- Busca la sección de "Postmark" o "Emails Transaccionales"
- Copia el **Server API Token**

**Si no tienes Postmark:**
- Ve a [postmarkapp.com](https://postmarkapp.com)
- Crea cuenta gratuita
- Crea un "Server" (puedes llamarlo "Yari Taft")
- Copia el **Server API Token**

### 2. Agregar Variables de Entorno

Edita `yari-crm-backend/.env`:

```env
# Postmark
POSTMARK_API_KEY=tu-server-api-token-aqui
POSTMARK_FROM_EMAIL=hola@yaritaft.com
```

### 3. Configurar Dominio (Opcional pero Recomendado)

**Para usar `hola@yaritaft.com` como remitente:**

1. En Postmark, ve a **Settings → Sending Domains**
2. Agrega tu dominio: `yaritaft.com`
3. Postmark te dará **3 registros DNS**:
   - **SPF** (TXT)
   - **DKIM** (TXT)
   - **Return-Path** (CNAME)

4. Agrega estos registros en tu panel de DNS (donde está registrado `yaritaft.com`)
5. Espera 1-2 horas para que se verifique

**Si no configuras el dominio:**
- Los emails se enviarán desde un email de Postmark (ej: `noreply@postmarkapp.com`)
- Funciona igual, pero no es tan profesional

---

## 🧪 Probar que Funciona

1. **Inicia el backend:**
   ```bash
   cd yari-crm-backend
   npm run start:dev
   ```

2. **Desde el dashboard:**
   - Ve a un estudiante
   - Click en "Enviar Formulario"
   - Revisa los logs del backend (debería decir "✅ Email enviado exitosamente")

3. **Revisa el email del estudiante:**
   - Debería llegar en segundos
   - El link debería funcionar

---

## ❓ Preguntas Frecuentes

### ¿Necesito la URL de ActiveCampaign?
**No.** Postmark funciona independientemente. Solo necesitas el API Key de Postmark.

### ¿Puedo usar la API Key de ActiveCampaign?
**No.** Postmark tiene su propia API Key (Server API Token). Son diferentes.

### ¿Qué pasa si no configuro el dominio?
**Funciona igual**, pero los emails vendrán de un remitente de Postmark en lugar de `hola@yaritaft.com`. Para producción, es mejor configurar el dominio.

### ¿Cuánto cuesta Postmark?
- **Gratis**: 100 emails/mes
- **Pago**: Desde $15/mes para más volumen

---

## 🎯 Resumen: Lo que Necesitas

1. ✅ **POSTMARK_API_KEY** (Server API Token)
2. ✅ **POSTMARK_FROM_EMAIL** (`hola@yaritaft.com`)
3. ✅ Agregar estas variables en `.env`
4. ✅ (Opcional) Configurar dominio en Postmark

**¡Eso es todo!** Postmark es mucho más simple que ActiveCampaign para emails transaccionales.

---

## 📞 Si tu Jefe Tiene ActiveCampaign

Pregúntale:
1. "¿Tienes Postmark integrado en ActiveCampaign?"
2. "¿Dónde está el Server API Token de Postmark?"
3. Si no lo tiene, "¿Puedo crear una cuenta de Postmark? (es gratis hasta 100 emails/mes)"

---

**Una vez que tengas el API Key, agrégalo al `.env` y ¡listo!** 🚀
