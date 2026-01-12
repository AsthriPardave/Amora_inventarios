/**
 * Archivo principal del servidor
 * Amora Inventarios - Sistema de gestión de inventarios
 */

require('dotenv').config();
const express = require('express');
const path = require('path');
const morgan = require('morgan');
const cors = require('cors');
const bodyParser = require('body-parser');
const session = require('express-session');

// Importar configuración
const config = require('./src/config/app.config');
const googleSheetsConfig = require('./src/config/googleSheets.config');

// Importar middlewares
const authMiddleware = require('./src/middlewares/auth.middleware');

// Importar rutas
const authRoutes = require('./src/routes/auth.routes');
const indexRoutes = require('./src/routes/index.routes');
const inventarioRoutes = require('./src/routes/inventario.routes');
const ventasRoutes = require('./src/routes/ventas.routes');
const productosRoutes = require('./src/routes/productos.routes');
const ingresosRoutes = require('./src/routes/ingresos.routes');
const cambiosRoutes = require('./src/routes/cambios.routes');
const politicasRoutes = require('./src/routes/politicas.routes');

const app = express();

// ============ CONFIGURACIÓN DE MIDDLEWARES ============

// Logger de peticiones HTTP
app.use(morgan('dev'));

// CORS
app.use(cors());

// Body parser - para procesar datos del formulario
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Configuración de sesiones
app.use(session(config.session));

// Archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Motor de plantillas EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src/views'));

// ============ RUTAS ============

// Rutas de autenticación (sin protección)
app.use('/auth', authRoutes);

// Aplicar middleware de autenticación a todas las rutas siguientes
app.use(authMiddleware.verificarAutenticacion);

// Ruta principal
app.use('/', indexRoutes);

// Rutas de inventario
app.use('/api/inventario', inventarioRoutes);

// Rutas de ventas
app.use('/ventas', ventasRoutes);

// Rutas de productos
app.use('/productos', productosRoutes);

// Rutas de ingresos
app.use('/ingresos', ingresosRoutes);

// Rutas de cambios
app.use('/cambios', cambiosRoutes);

// Rutas de políticas
app.use('/politicas', politicasRoutes);

// Manejo de rutas no encontradas (404)
app.use((req, res) => {
    res.status(404).render('404', {
        title: 'Página no encontrada',
        message: 'La página que buscas no existe'
    });
});

// Manejo de errores
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('error', {
        title: 'Error del servidor',
        message: 'Ha ocurrido un error en el servidor',
        error: config.env === 'development' ? err : {}
    });
});

// ============ INICIAR SERVIDOR ============

// Inicializar Google Sheets y luego iniciar el servidor
async function startServer() {
    try {
        // Inicializar conexión con Google Sheets
        await googleSheetsConfig.initialize();
        
        const PORT = config.port;

        app.listen(PORT, () => {
            console.log('='.repeat(50));
            console.log(`🚀 Servidor iniciado en modo ${config.env}`);
            console.log(`📡 Escuchando en el puerto: ${PORT}`);
            console.log(`🌐 URL: http://localhost:${PORT}`);
            console.log('='.repeat(50));
        });
    } catch (error) {
        console.error('❌ Error al iniciar el servidor:', error.message);
        console.log('⚠️  Verifica tu configuración de Google Sheets en el archivo .env');
        process.exit(1);
    }
}

startServer();

module.exports = app;
