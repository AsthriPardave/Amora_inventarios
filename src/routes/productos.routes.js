/**
 * Rutas para gestión de productos
 */

const express = require('express');
const router = express.Router();
const ProductosController = require('../controllers/ingresos.controller');

/**
 * GET /productos
 * Mostrar lista de productos
 */
router.get('/', ProductosController.listarProductos);

/**
 * GET /productos/registrar
 * Mostrar formulario de registro de producto
 */
router.get('/registrar', ProductosController.mostrarFormularioProducto);

/**
 * POST /productos/registrar
 * Procesar registro de producto
 */
router.post('/registrar', ProductosController.registrarProducto);

module.exports = router;
