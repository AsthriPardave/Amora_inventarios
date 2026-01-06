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

// Importar configuración
const config = require('./src/config/app.config');

// Importar rutas
const indexRoutes = require('./src/routes/index.routes');
const inventarioRoutes = require('./src/routes/inventario.routes');

const app = express();

// ============ CONFIGURACIÓN DE MIDDLEWARES ============

// Logger de peticiones HTTP
app.use(morgan('dev'));

// CORS
app.use(cors());

// Body parser - para procesar datos del formulario
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Motor de plantillas EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src/views'));

// ============ RUTAS ============

// Ruta principal
app.use('/', indexRoutes);

// Rutas de inventario
app.use('/api/inventario', inventarioRoutes);

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

const PORT = config.port;

app.listen(PORT, () => {
    console.log('='.repeat(50));
    console.log(`🚀 Servidor iniciado en modo ${config.env}`);
    console.log(`📡 Escuchando en el puerto: ${PORT}`);
    console.log(`🌐 URL: http://localhost:${PORT}`);
    console.log('='.repeat(50));
});

module.exports = app;
