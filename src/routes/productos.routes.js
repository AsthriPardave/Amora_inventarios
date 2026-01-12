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

// GET - Mostrar formulario para agregar stock a producto existente
router.get('/agregar-stock', ProductosController.mostrarFormularioAgregarStock);

// POST - Procesar agregado de stock
router.post('/agregar-stock', ProductosController.agregarStockProducto);

module.exports = router;
