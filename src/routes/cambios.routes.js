/**
 * Rutas de Cambios de Talla
 */

const express = require('express');
const router = express.Router();
const CambiosController = require('../controllers/cambios.controller');

// GET - Lista de cambios
router.get('/lista', CambiosController.listarCambios);

// GET - Buscar cambios por WhatsApp
router.get('/buscar', CambiosController.buscarCambiosPorWhatsapp);

// GET - Mostrar formulario de registro de cambio
router.get('/registro', CambiosController.mostrarFormularioCambio);

// POST - Buscar pedido por WhatsApp
router.post('/buscar-pedido', CambiosController.buscarPedido);

// POST - Registrar cambio de talla
router.post('/registrar', CambiosController.registrarCambio);

// POST - Actualizar estado de cambio
router.post('/actualizar/:id', CambiosController.actualizarEstado);

module.exports = router;
