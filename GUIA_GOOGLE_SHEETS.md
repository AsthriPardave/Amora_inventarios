# 📋 Guía Completa: Conectar Amora Inventarios con Google Sheets

Esta guía te llevará paso a paso para conectar tu aplicación con Google Sheets.

---

## 📦 Paso 1: Crear un Proyecto en Google Cloud Console

1. **Accede a Google Cloud Console**
   - Ve a: https://console.cloud.google.com/
   - Inicia sesión con tu cuenta de Google

2. **Crear un nuevo proyecto**
   - Haz clic en el selector de proyectos (arriba a la izquierda)
   - Clic en **"NUEVO PROYECTO"**
   - Nombre del proyecto: `Amora-Inventarios` (o el que prefieras)
   - Haz clic en **"CREAR"**
   - Espera a que se cree el proyecto (aparecerá una notificación)

---

## 🔌 Paso 2: Habilitar la API de Google Sheets

1. **Acceder al menú de APIs**
   - En el menú lateral (☰), ve a: **APIs y servicios** → **Biblioteca**

2. **Buscar y habilitar Google Sheets API**
   - En el buscador escribe: `Google Sheets API`
   - Haz clic en **Google Sheets API**
   - Haz clic en el botón **"HABILITAR"**
   - Espera a que se habilite (tarda unos segundos)

---

## 🔑 Paso 3: Crear una Cuenta de Servicio

1. **Ir a Credenciales**
   - En el menú lateral: **APIs y servicios** → **Credenciales**

2. **Crear cuenta de servicio**
   - Haz clic en **"CREAR CREDENCIALES"** (arriba)
   - Selecciona **"Cuenta de servicio"**

3. **Completar detalles**
   - **Nombre de la cuenta de servicio**: `amora-inventarios`
   - **ID de la cuenta**: (se genera automáticamente)
   - **Descripción**: `Cuenta para acceder a Google Sheets desde Amora Inventarios`
   - Haz clic en **"CREAR Y CONTINUAR"**

4. **Permisos (opcional)**
   - Puedes omitir esta sección
   - Haz clic en **"CONTINUAR"**

5. **Acceso de usuarios (opcional)**
   - Puedes omitir esta sección
   - Haz clic en **"LISTO"**

---

## 📥 Paso 4: Descargar el Archivo de Credenciales JSON

1. **Acceder a la cuenta de servicio creada**
   - En la lista de cuentas de servicio, haz clic en la que acabas de crear
   - (Tiene un email como: `amora-inventarios@tu-proyecto.iam.gserviceaccount.com`)

2. **Ir a la pestaña "CLAVES"**
   - Arriba verás varias pestañas: DETALLES, PERMISOS, **CLAVES**, MÉTRICAS
   - Haz clic en **CLAVES**

3. **Crear nueva clave**
   - Haz clic en **"AGREGAR CLAVE"** → **"Crear nueva clave"**
   - Selecciona el tipo **JSON**
   - Haz clic en **"CREAR"**

4. **Guardar el archivo**
   - Se descargará automáticamente un archivo `.json`
   - **¡GUARDA ESTE ARCHIVO DE FORMA SEGURA!**
   - Ejemplo: `amora-inventarios-abc123.json`

---

## 📊 Paso 5: Crear tu Google Sheet

1. **Crear nueva hoja de cálculo**
   - Ve a: https://sheets.google.com/
   - Haz clic en **"+ Nuevo"** o el botón **"+"**
   - Se creará una nueva hoja

2. **Nombrar la hoja de cálculo**
   - Haz clic en "Hoja de cálculo sin título" (arriba a la izquierda)
   - Escribe: `Amora Inventarios`

3. **Crear las pestañas necesarias**
   
   Necesitas crear 6 pestañas (hojas). Haz clic en el **"+"** abajo para agregar:
   
   - ✅ **Productos**
   - ✅ **Ventas**
   - ✅ **Ingresos**
   - ✅ **Cambios**
   - ✅ **Categorias**
   - ✅ **Movimientos**

4. **Configurar la hoja "Productos"**
   
   En la pestaña **Productos**, agrega estos encabezados en la **fila 1** (A1 a G1):
   
   | A | B | C | D | E | F | G |
   |---|---|---|---|---|---|---|
   | id | modelo | categoria | talla_35 | talla_36 | talla_37 | talla_38 |
   
   **Continúa en la misma fila:**
   
   | H | I | J | K | L |
   |---|---|---|---|---|
   | talla_39 | talla_40 | total | precio | descripcion |

5. **Configurar la hoja "Ventas"**
   
   En la pestaña **Ventas**, agrega estos encabezados en la **fila 1**:
   
   | A | B | C | D | E | F | G | H |
   |---|---|---|---|---|---|---|---|
   | fecha | modelo | talla | cantidad | tipoVia | nombreVia | numero | interior |
   
   **Continúa en la misma fila:**
   
   | I | J | K | L | M | N | O |
   |---|---|---|---|---|---|---|
   | ciudad | referencia | direccionCompleta | whatsapp | deliveryPagado | estado | observaciones |

6. **Configurar las demás hojas (opcional por ahora)**
   
   Las hojas **Ingresos**, **Cambios**, **Categorias**, y **Movimientos** pueden quedar vacías por ahora. Las configuraremos más adelante según las necesidades.

---

## 🔗 Paso 6: Obtener el ID de tu Google Sheet

1. **Copiar el ID desde la URL**
   - Mira la barra de direcciones de tu navegador
   - La URL se ve así:
   ```
   https://docs.google.com/spreadsheets/d/1a2B3c4D5e6F7g8H9i0J1k2L3m4N5o6P7q8R9s0T1u2V3/edit
                                        ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
                                        ESTE ES EL ID DE TU HOJA
   ```
   - **Copia todo el texto entre `/d/` y `/edit`**
   - Ejemplo: `1a2B3c4D5e6F7g8H9i0J1k2L3m4N5o6P7q8R9s0T1u2V3`

---

## 🔓 Paso 7: Compartir la Hoja con la Cuenta de Servicio

**¡ESTE PASO ES MUY IMPORTANTE!**

1. **Abrir el archivo JSON que descargaste**
   - Busca el archivo `.json` que descargaste en el Paso 4
   - Ábrelo con cualquier editor de texto

2. **Copiar el email de la cuenta de servicio**
   - Busca la línea que dice `"client_email":`
   - Copia el email completo
   - Ejemplo: `amora-inventarios@tu-proyecto.iam.gserviceaccount.com`

3. **Compartir tu Google Sheet**
   - Vuelve a tu Google Sheet
   - Haz clic en el botón **"Compartir"** (arriba a la derecha)
   - Pega el email de la cuenta de servicio
   - Asegúrate de darle permisos de **"Editor"**
   - **DESMARCA** la casilla **"Notificar a las personas"**
   - Haz clic en **"Enviar"** o **"Compartir"**

---

## ⚙️ Paso 8: Configurar tu Archivo .env

1. **Crear el archivo .env**
   - En la raíz de tu proyecto, copia el archivo `.env.example`:
   ```bash
   cp .env.example .env
   ```

2. **Abrir el archivo JSON de credenciales**
   - Abre nuevamente el archivo `.json` descargado

3. **Copiar las credenciales al .env**

   Necesitas copiar 3 valores del archivo JSON al archivo `.env`:

   **a) GOOGLE_CLIENT_EMAIL**
   - En el JSON busca: `"client_email"`
   - Copia el valor completo
   - Pégalo en `.env`:
   ```env
   GOOGLE_CLIENT_EMAIL=amora-inventarios@tu-proyecto.iam.gserviceaccount.com
   ```

   **b) GOOGLE_PRIVATE_KEY**
   - En el JSON busca: `"private_key"`
   - Copia el valor completo (incluye `\n`, `-----BEGIN PRIVATE KEY-----`, etc.)
   - **¡IMPORTANTE!** Debe estar entre comillas dobles
   - Pégalo en `.env`:
   ```env
   GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEF...(resto de la clave)...\n-----END PRIVATE KEY-----\n"
   ```

   **c) GOOGLE_SHEET_ID**
   - Usa el ID que copiaste en el Paso 6
   - Pégalo en `.env`:
   ```env
   GOOGLE_SHEET_ID=1a2B3c4D5e6F7g8H9i0J1k2L3m4N5o6P7q8R9s0T1u2V3
   ```

4. **Archivo .env completo**
   
   Tu archivo `.env` debe verse así:
   
   ```env
   # Configuración del servidor
   PORT=3000
   NODE_ENV=development

   # Configuración de Google Sheets
   GOOGLE_SHEET_ID=1a2B3c4D5e6F7g8H9i0J1k2L3m4N5o6P7q8R9s0T1u2V3
   GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEA...\n-----END PRIVATE KEY-----\n"
   GOOGLE_CLIENT_EMAIL=amora-inventarios@tu-proyecto.iam.gserviceaccount.com

   # Nombre de las hojas en Google Sheets
   SHEET_NAME_PRODUCTOS=Productos
   SHEET_NAME_CATEGORIAS=Categorias
   SHEET_NAME_MOVIMIENTOS=Movimientos
   SHEET_NAME_VENTAS=Ventas
   SHEET_NAME_INGRESOS=Ingresos
   SHEET_NAME_CAMBIOS=Cambios
   ```

---

## 🚀 Paso 9: Probar la Conexión

1. **Reiniciar el servidor Docker**
   ```bash
   docker-compose down
   docker-compose up -d --build
   ```

2. **Ver los logs**
   ```bash
   docker-compose logs -f
   ```

3. **Verificar la conexión exitosa**
   
   Deberías ver en los logs:
   ```
   ✅ Conexión con Google Sheets establecida correctamente
   🚀 Servidor iniciado en modo development
   📡 Escuchando en el puerto: 3000
   ```

4. **Si hay error**
   
   Si ves un error como:
   ```
   ❌ Error al conectar con Google Sheets
   ```
   
   Verifica:
   - ✅ El archivo `.env` está en la raíz del proyecto
   - ✅ Las comillas en `GOOGLE_PRIVATE_KEY` están correctas
   - ✅ El `GOOGLE_SHEET_ID` es correcto
   - ✅ Compartiste la hoja con la cuenta de servicio
   - ✅ La API de Google Sheets está habilitada

---

## 🎉 Paso 10: ¡Probarlo!

1. **Acceder a la aplicación**
   - Abre tu navegador
   - Ve a: http://localhost:3000

2. **Registrar una venta**
   - Menú: **Gestión** → **🛒 Registrar Venta**
   - Completa el formulario
   - Haz clic en **"Registrar Venta"**

3. **Verificar en Google Sheets**
   - Ve a tu Google Sheet
   - Abre la pestaña **"Ventas"**
   - Deberías ver la venta registrada en una nueva fila

4. **Ver el registro de ventas**
   - Menú: **Gestión** → **📊 Ver Ventas**
   - Deberías ver la tabla con todas las ventas

---

## 🔧 Solución de Problemas Comunes

### Error: "No se puede conectar con Google Sheets"

**Solución:**
- Verifica que el archivo `.env` existe
- Revisa que las credenciales están correctamente copiadas
- Asegúrate de que compartiste la hoja con la cuenta de servicio

### Error: "Permission denied"

**Solución:**
- Compartiste la hoja con el email incorrecto
- No diste permisos de "Editor"
- Vuelve al Paso 7

### Error: "Invalid credentials"

**Solución:**
- La `GOOGLE_PRIVATE_KEY` no está entre comillas
- Falta algún `\n` en la clave
- Vuelve al Paso 8

### La venta no aparece en Google Sheets

**Solución:**
- Verifica que la hoja se llama exactamente "Ventas" (respeta mayúsculas)
- Revisa que los encabezados estén en la fila 1
- Mira los logs del servidor: `docker-compose logs -f`

---

## 📚 Recursos Adicionales

- **Google Cloud Console**: https://console.cloud.google.com/
- **Google Sheets**: https://sheets.google.com/
- **Documentación de Google Sheets API**: https://developers.google.com/sheets/api

---

## ✅ Checklist Final

Marca cada elemento cuando lo completes:

- [ ] Proyecto creado en Google Cloud Console
- [ ] Google Sheets API habilitada
- [ ] Cuenta de servicio creada
- [ ] Archivo JSON de credenciales descargado
- [ ] Google Sheet creado con el nombre "Amora Inventarios"
- [ ] Pestañas creadas: Productos, Ventas, Ingresos, Cambios, Categorias, Movimientos
- [ ] Encabezados configurados en la pestaña "Productos"
- [ ] Encabezados configurados en la pestaña "Ventas"
- [ ] ID de la hoja copiado
- [ ] Hoja compartida con la cuenta de servicio (con permisos de Editor)
- [ ] Archivo `.env` creado
- [ ] `GOOGLE_CLIENT_EMAIL` configurado en `.env`
- [ ] `GOOGLE_PRIVATE_KEY` configurado en `.env` (con comillas)
- [ ] `GOOGLE_SHEET_ID` configurado en `.env`
- [ ] Servidor reiniciado
- [ ] Conexión exitosa verificada en los logs
- [ ] Venta de prueba registrada
- [ ] Venta visible en Google Sheets
- [ ] Tabla de ventas funcionando en la aplicación

---

**¡Listo! Tu aplicación ahora está conectada con Google Sheets.**

Si tienes algún problema, revisa los logs del servidor y verifica cada paso de esta guía.
