/**
 * Rutas de Ingresos
 */

const express = require('express');
const router = express.Router();
const IngresosController = require('../controllers/ingresos.controller');

// GET - Mostrar formulario de registro de ingreso
router.get('/registrar', IngresosController.mostrarFormularioIngreso);

// POST - Procesar registro de ingreso
router.post('/registrar', IngresosController.registrarIngreso);

// GET - Listar ingresos
router.get('/lista', IngresosController.listarIngresos);

module.exports = router;
