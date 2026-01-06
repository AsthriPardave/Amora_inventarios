/**
 * Rutas principales de la aplicación
 */

const express = require('express');
const router = express.Router();

/**
 * GET /
 * Página de inicio
 */
router.get('/', (req, res) => {
    res.render('index', {
        title: 'Amora Inventarios',
        message: 'Sistema de Gestión de Inventarios'
    });
});

/**
 * GET /about
 * Página acerca de
 */
router.get('/about', (req, res) => {
    res.render('about', {
        title: 'Acerca de',
        version: '1.0.0'
    });
});

module.exports = router;
