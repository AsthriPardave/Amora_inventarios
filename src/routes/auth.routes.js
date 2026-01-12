/**
 * Rutas de Autenticación
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// GET - Mostrar formulario de login
router.get('/login', authMiddleware.verificarYaLogueado, authController.mostrarLogin);

// POST - Procesar login
router.post('/login', authMiddleware.verificarYaLogueado, authController.procesarLogin);

// GET - Cerrar sesión
router.get('/logout', authController.logout);

module.exports = router;
