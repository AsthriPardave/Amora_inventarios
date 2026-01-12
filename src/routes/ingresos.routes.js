/**
 * Rutas de Ingresos
 */

const express = require('express');
const router = express.Router();
const ProductosController = require('../controllers/ingresos.controller');

// GET - Mostrar formulario para agregar stock a producto existente
router.get('/agregar-stock', ProductosController.mostrarFormularioAgregarStock);

// POST - Procesar agregado de stock
router.post('/agregar-stock', ProductosController.agregarStockProducto);

module.exports = router;
