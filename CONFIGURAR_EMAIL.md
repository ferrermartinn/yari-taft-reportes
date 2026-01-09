# 📧 Configuración de Email - Guía Rápida

## ✅ Estado Actual

El sistema está preparado para usar **Postmark** (recomendado) o **ActiveCampaign**. 

**⚠️ IMPORTANTE:** ActiveCampaign no funciona bien para emails transaccionales. Se recomienda usar **Postmark**.

---

## 🚀 Opción 1: Postmark (Recomendado)

### Lo que necesitas de Yari:
- `POSTMARK_API_KEY` (Server API Token)

### Configuración:

1. **Agrega al archivo `yari-crm-backend/.env`:**
```env
POSTMARK_API_KEY=tu-postmark-api-key-aqui
POSTMARK_FROM_EMAIL=hola@yaritaft.com
```

2. **Reinicia el backend**

3. **¡Listo!** El sistema detectará Postmark automáticamente y funcionará.

### Dónde obtener el API Key:

**Si ActiveCampaign tiene Postmark integrado:**
- ActiveCampaign → Configuración → Desarrollador → Postmark
- Copia el "Server API Token"

**Si no está integrado:**
- Ve a [postmarkapp.com](https://postmarkapp.com)
- Crea cuenta (gratis hasta 100 emails/mes)
- Crea un "Server"
- Copia el "Server API Token"

---

## ⚠️ Opción 2: ActiveCampaign (No Recomendado)

**Nota:** ActiveCampaign no está diseñado para emails transaccionales. El código intentará funcionar, pero puede fallar.

Si aún así quieres intentarlo:

```env
WILDMAIL_API_URL=https://yaritaft.api-us1.com
WILDMAIL_API_KEY=2186366fc336bba5147826efed11d6ffa48ffe7c94286cde9396415db4f3acfabf0d50c1
WILDMAIL_FROM_EMAIL=hola@yaritaft.com
```

**Problemas conocidos:**
- Error 405 al crear campañas
- Requiere dominio verificado
- No es ideal para emails transaccionales

---

## 🎯 Prioridad

Si ambas están configuradas, **Postmark tiene prioridad**.

---

## ✅ Verificar que Funciona

1. **Revisa los logs del backend al iniciar:**
   - Debería decir: `✅ Postmark configurado. From: hola@yaritaft.com`
   - O: `✅ ActiveCampaign configurado. From: hola@yaritaft.com`

2. **Envía un email de prueba desde el dashboard**

3. **Revisa los logs:**
   - Debería decir: `✅ Email enviado exitosamente a [email] (Postmark)`

---

## 📞 Mensaje para Yari

```
Hola Yari,

Para terminar el proyecto de emails, necesito:

POSTMARK_API_KEY (Server API Token)

- Si ActiveCampaign tiene Postmark integrado: Configuración → Desarrollador → Postmark
- Si no: puedo crear cuenta en postmarkapp.com (gratis hasta 100/mes)

Postmark es la herramienta recomendada por ActiveCampaign para emails transaccionales.

Gracias!
```

---

**Una vez que tengas el POSTMARK_API_KEY, agrégalo al .env y reinicia el backend. ¡Listo!** 🚀
