# Guía de Configuración de Google Sheets

## Pasos para configurar Google Sheets API

### 1. Crear un proyecto en Google Cloud Console

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Nombra tu proyecto (ej: "Amora Inventarios")

### 2. Habilitar la API de Google Sheets

1. En el menú lateral, ve a "APIs y servicios" > "Biblioteca"
2. Busca "Google Sheets API"
3. Haz clic en "Habilitar"

### 3. Crear credenciales de cuenta de servicio

1. Ve a "APIs y servicios" > "Credenciales"
2. Haz clic en "Crear credenciales" > "Cuenta de servicio"
3. Completa los detalles:
   - Nombre: `amora-inventarios-service`
   - ID: se generará automáticamente
   - Descripción: "Cuenta de servicio para Amora Inventarios"
4. Haz clic en "Crear y continuar"
5. En "Otorgar acceso a este servicio", puedes omitir este paso
6. Haz clic en "Listo"

### 4. Generar clave JSON

1. En la lista de cuentas de servicio, haz clic en la que acabas de crear
2. Ve a la pestaña "Claves"
3. Haz clic en "Agregar clave" > "Crear nueva clave"
4. Selecciona "JSON" y haz clic en "Crear"
5. Se descargará un archivo JSON con tus credenciales

### 5. Configurar el archivo .env

1. Abre el archivo JSON descargado
2. Copia el valor de `client_email`
3. Copia el valor de `private_key` (incluye todo, incluso los `\n`)
4. En tu proyecto, copia `.env.example` a `.env`
5. Completa las variables:

```env
GOOGLE_CLIENT_EMAIL=tu-cuenta-servicio@tu-proyecto.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nTu clave privada aquí...\n-----END PRIVATE KEY-----\n"
GOOGLE_SHEET_ID=tu_sheet_id_aqui
```

### 6. Crear y configurar tu Google Sheet

1. Crea una nueva hoja de cálculo en [Google Sheets](https://sheets.google.com)
2. Nómbrala "Amora Inventarios" o como prefieras
3. Crea las siguientes hojas (pestañas):
   - **Productos**
   - **Categorias**
   - **Movimientos**

### 7. Configurar la hoja de Productos

En la hoja "Productos", agrega los siguientes encabezados en la primera fila:

| id | nombre | categoria | cantidad | precio | descripcion |
|----|--------|-----------|----------|--------|-------------|

### 8. Compartir la hoja con la cuenta de servicio

1. En tu hoja de Google Sheets, haz clic en "Compartir"
2. Pega el `client_email` de tu cuenta de servicio
3. Dale permisos de "Editor"
4. Desmarca "Notificar a las personas"
5. Haz clic en "Compartir"

### 9. Obtener el ID de la hoja

El ID de tu hoja está en la URL:
```
https://docs.google.com/spreadsheets/d/[ESTE_ES_EL_ID]/edit
```

Copia ese ID y pégalo en tu archivo `.env` en `GOOGLE_SHEET_ID`

### 10. Verificar la configuración

Ejecuta el servidor:
```bash
npm install
npm run dev
```

Si todo está configurado correctamente, deberías ver:
```
✅ Conexión con Google Sheets establecida correctamente
```

## Estructura de las hojas

### Hoja: Productos
| id | nombre | categoria | cantidad | precio | descripcion |
|----|--------|-----------|----------|--------|-------------|
| 1  | Laptop | Electrónica | 10 | 1500.00 | Laptop HP 15" |

### Hoja: Categorias
| id | nombre | descripcion |
|----|--------|-------------|
| 1  | Electrónica | Productos electrónicos |

### Hoja: Movimientos
| id | producto_id | tipo | cantidad | fecha | usuario |
|----|-------------|------|----------|-------|---------|
| 1  | 1 | entrada | 5 | 2026-01-05 | admin |

## Solución de problemas

### Error: "The caller does not have permission"
- Verifica que hayas compartido la hoja con el `client_email` de la cuenta de servicio
- Asegúrate de que la cuenta tenga permisos de "Editor"

### Error: "Unable to parse range"
- Verifica que los nombres de las hojas en `.env` coincidan exactamente con los nombres en Google Sheets
- Los nombres son sensibles a mayúsculas/minúsculas

### Error: "Invalid credentials"
- Verifica que la `private_key` esté correctamente copiada, incluyendo los saltos de línea (`\n`)
- Asegúrate de que el `client_email` sea el correcto

## Recursos adicionales

- [Documentación de Google Sheets API](https://developers.google.com/sheets/api)
- [Guía de autenticación](https://developers.google.com/sheets/api/guides/authorizing)
- [Referencia de la API](https://developers.google.com/sheets/api/reference/rest)
