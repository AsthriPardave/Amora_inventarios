# Amora Inventarios

Sistema de gestión de inventarios con integración a Google Sheets.

## 📁 Estructura del Proyecto

```
Amora_inventarios/
├── src/
│   ├── controllers/     # Lógica de negocio (Backend)
│   ├── models/          # Modelos de datos y conexión con Google Sheets
│   ├── routes/          # Definición de endpoints (API)
│   ├── views/           # Vistas del frontend (EJS)
│   ├── services/        # Servicios auxiliares
│   ├── middlewares/     # Middlewares personalizados
│   └── config/          # Configuraciones generales
├── public/              # Archivos estáticos
│   ├── css/            # Estilos
│   ├── js/             # Scripts del cliente
│   └── images/         # Imágenes
├── server.js           # Punto de entrada de la aplicación
├── package.json        # Dependencias del proyecto
└── .env               # Variables de entorno (no incluido en git)
```

## 🚀 Instalación

1. Clona el repositorio
2. Instala las dependencias:
   ```bash
   npm install
   ```
3. Copia `.env.example` a `.env` y configura tus variables de entorno
4. Configura las credenciales de Google Sheets
5. Ejecuta el servidor:
   ```bash
   npm run dev
   ```

## 📝 Configuración de Google Sheets

1. Crea un proyecto en Google Cloud Console
2. Habilita la API de Google Sheets
3. Crea credenciales de cuenta de servicio
4. Comparte tu hoja de cálculo con el email de la cuenta de servicio
5. Copia el ID de la hoja y las credenciales en el archivo `.env`

## 🔧 Scripts disponibles

- `npm start` - Inicia el servidor en modo producción
- `npm run dev` - Inicia el servidor en modo desarrollo con nodemon

## 📦 Tecnologías

- Node.js
- Express.js
- Google Sheets API
- EJS (Motor de plantillas)
- Body Parser
- Morgan (Logger)
- CORS

## 🏗️ Arquitectura

El proyecto sigue el patrón MVC (Modelo-Vista-Controlador):

- **Modelo**: Gestión de datos con Google Sheets
- **Vista**: Interfaz de usuario con EJS
- **Controlador**: Lógica de negocio
- **Rutas**: Definición de endpoints de la API
