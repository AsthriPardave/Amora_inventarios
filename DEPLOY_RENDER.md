# 🚀 Guía de Despliegue en Render

Esta guía te ayudará a desplegar el sistema de inventarios Amora en Render de forma gratuita.

## 📋 Requisitos Previos

- [x] Tener el código en GitHub (repositorio público o privado)
- [x] Cuenta de Google Cloud con credenciales JSON
- [x] Cuenta de Render (gratuita)

---

## 🔧 Paso 1: Preparar el Repositorio

### 1.1 Verificar que el archivo `.gitignore` excluye archivos sensibles

```bash
# Archivo .gitignore debe incluir:
.env
credentials.json
token.json
node_modules/
```

### 1.2 Asegurarse de que el código está en GitHub

```bash
# Si aún no has subido el código:
git add .
git commit -m "Preparar para deploy en Render"
git push origin main
```

---

## 🌐 Paso 2: Crear Cuenta en Render

1. Ve a [https://render.com](https://render.com)
2. Haz clic en **"Get Started for Free"**
3. Regístrate con GitHub (recomendado) o email
4. Confirma tu email

---

## 🎯 Paso 3: Crear el Web Service

### 3.1 Conectar Repositorio

1. En el Dashboard de Render, haz clic en **"New +"** → **"Web Service"**
2. Conecta tu cuenta de GitHub si aún no lo has hecho
3. Busca y selecciona el repositorio `Amora_inventarios`
4. Haz clic en **"Connect"**

### 3.2 Configurar el Servicio

Completa el formulario con estos datos:

| Campo | Valor |
|-------|-------|
| **Name** | `amora-inventarios` (o el nombre que prefieras) |
| **Region** | `Oregon (US West)` (o el más cercano) |
| **Branch** | `main` |
| **Runtime** | `Docker` |
| **Instance Type** | `Free` |

---

## 🔐 Paso 4: Configurar Variables de Entorno

En la sección **"Environment Variables"**, agrega todas las variables de tu archivo `.env`:

### Variables Requeridas:

```bash
# Puerto (Render asigna automáticamente, pero definimos fallback)
PORT=3000

# Google Sheets
GOOGLE_SHEET_ID=tu_google_sheet_id_aqui
GOOGLE_CREDENTIALS={"type":"service_account","project_id":"..."}

# Configuración de Google Sheets
SHEET_NAME_PRODUCTOS=Productos
SHEET_NAME_VENTAS=Ventas
SHEET_NAME_INGRESOS=Ingresos
SHEET_NAME_CAMBIOS=Cambios

# Autenticación
SESSION_SECRET=tu_clave_secreta_segura_aqui
ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH=$2a$10$tu_hash_bcrypt_aqui

# Entorno
NODE_ENV=production
```

### ⚠️ **Importante: Variable GOOGLE_CREDENTIALS**

El contenido de `credentials.json` debe ir en **UNA SOLA LÍNEA** sin saltos de línea:

```json
{"type":"service_account","project_id":"tu-proyecto","private_key_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n","client_email":"...","client_id":"...","auth_uri":"...","token_uri":"...","auth_provider_x509_cert_url":"...","client_x509_cert_url":"..."}
```

**Consejo:** Usa este comando para convertir tu archivo:
```bash
# En PowerShell:
Get-Content credentials.json | ConvertFrom-Json | ConvertTo-Json -Compress
```

---

## 🔑 Paso 5: Preparar Credenciales de Google

### 5.1 Obtener las credenciales en formato JSON

1. Ve a [Google Cloud Console](https://console.cloud.google.com)
2. Selecciona tu proyecto
3. Ve a **"IAM & Admin"** → **"Service Accounts"**
4. Haz clic en tu cuenta de servicio
5. Ve a la pestaña **"Keys"**
6. Haz clic en **"Add Key"** → **"Create new key"**
7. Selecciona **JSON** y descarga

### 5.2 Copiar el contenido completo

Abre el archivo `credentials.json` descargado y copia TODO el contenido (debe empezar con `{` y terminar con `}`).

---

## 🚀 Paso 6: Desplegar

1. Revisa que todas las variables de entorno estén configuradas
2. Haz clic en **"Create Web Service"**
3. Render comenzará a construir la imagen Docker (toma 2-5 minutos)
4. Espera a que el estado cambie a **"Live"** (verde) ✅

---

## 🌍 Paso 7: Acceder a tu Aplicación

Tu aplicación estará disponible en:
```
https://amora-inventarios.onrender.com
```
(O el nombre que hayas elegido)

---

## 📊 Paso 8: Verificar Google Sheets

1. Accede a tu aplicación desplegada
2. Ve a `/productos/registrar` y registra un producto de prueba
3. Verifica que aparezca en tu Google Sheet
4. Si funciona, ¡todo está listo! 🎉

---

## 🔄 Actualizaciones Automáticas

Render se actualiza automáticamente cuando hagas `git push` a tu rama principal:

```bash
# Hacer cambios en el código
git add .
git commit -m "Descripción de cambios"
git push origin main

# Render detectará el push y desplegará automáticamente
```

---

## ⚠️ Limitaciones del Plan Gratuito

- **Inactividad:** El servicio se "duerme" después de 15 minutos sin tráfico
- **Tiempo de inicio:** Tarda ~30 segundos en despertar cuando alguien accede
- **Horas:** 750 horas/mes (suficiente para uso normal)
- **Memoria:** 512 MB RAM
- **Almacenamiento:** Datos se guardan en Google Sheets (no hay límite)

---

## 🐛 Solución de Problemas

### Error: "Build Failed"

1. Revisa los logs en Render
2. Verifica que el `Dockerfile` esté en la raíz del proyecto
3. Asegúrate de que `package.json` tenga el script `"start": "node server.js"`

### Error: "Google Sheets API"

1. Verifica que `GOOGLE_CREDENTIALS` esté en una sola línea
2. Confirma que el Service Account tenga acceso al Google Sheet
3. Revisa que `GOOGLE_SHEET_ID` sea correcto

### Error: "Application Error"

1. Ve a **"Logs"** en el dashboard de Render
2. Busca errores en rojo
3. Verifica que todas las variables de entorno estén configuradas

### El servicio tarda mucho en responder

- Es normal en el plan gratuito (primera carga tras inactividad)
- Considera usar un servicio de "ping" cada 10 minutos para mantenerlo activo
- Ejemplos: [UptimeRobot](https://uptimerobot.com), [Cron-Job.org](https://cron-job.org)

---

## 🔐 Seguridad

### Recomendaciones:

1. **Nunca** subas `credentials.json` o `.env` a GitHub
2. Usa contraseñas fuertes para `ADMIN_PASSWORD_HASH`
3. Cambia `SESSION_SECRET` regularmente
4. Revisa los permisos del Service Account en Google Cloud

### Generar nueva contraseña hash:

```javascript
// Ejecutar en la consola de Node.js:
const bcrypt = require('bcryptjs');
const hash = bcrypt.hashSync('tu_nueva_contraseña', 10);
console.log(hash);
```

---

## 📞 Soporte

- **Documentación de Render:** [https://render.com/docs](https://render.com/docs)
- **Google Sheets API:** [https://developers.google.com/sheets](https://developers.google.com/sheets)
- **Logs en tiempo real:** Dashboard de Render → Tu servicio → "Logs"

---

## ✅ Checklist Final

Antes de marcar como completado:

- [ ] Código subido a GitHub
- [ ] Cuenta de Render creada
- [ ] Web Service creado y configurado
- [ ] Todas las variables de entorno agregadas
- [ ] `GOOGLE_CREDENTIALS` en formato correcto (una línea)
- [ ] Despliegue exitoso (estado "Live")
- [ ] Aplicación accesible desde el navegador
- [ ] Prueba de registro en Google Sheets funciona
- [ ] URL guardada para acceso futuro

---

## 🎉 ¡Listo!

Tu sistema de inventarios Amora ahora está desplegado en la nube de forma gratuita.

**URL de tu aplicación:** https://[tu-nombre].onrender.com

**Tiempo estimado total:** 15-20 minutos
