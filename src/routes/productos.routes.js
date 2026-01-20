/**
 * Rutas de Productos
 */

const express = require('express');
const router = express.Router();
const ProductosController = require('../controllers/ingresos.controller');

// GET - Mostrar formulario de registro de producto
router.get('/registrar', ProductosController.mostrarFormularioProducto);

// POST - Procesar registro de producto
router.post('/registrar', ProductosController.registrarProducto);

// GET - Listar productos
router.get('/lista', ProductosController.listarProductos);

module.exports = router;
