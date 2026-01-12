/**
 * Rutas de Ventas
 */

const express = require('express');
const router = express.Router();
const VentasController = require('../controllers/ventas.controller');

// GET - Mostrar formulario de registro de venta
router.get('/registrar', VentasController.mostrarFormularioVenta);

// POST - Procesar registro de venta
router.post('/registrar', VentasController.registrarVenta);

// GET - Listar ventas
router.get('/lista', VentasController.listarVentas);

// POST - Actualizar estado de venta
router.post('/actualizar-estado', VentasController.actualizarEstadoVenta);

module.exports = router;
