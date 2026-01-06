/**
 * Rutas de Inventario
 * Define todos los endpoints relacionados con la gestión de inventario
 */

const express = require('express');
const router = express.Router();
const inventarioController = require('../controllers/inventario.controller');

// ============ RUTAS DE VISTAS ============

/**
 * GET /inventario
 * Vista principal del inventario
 */
router.get('/', inventarioController.renderInventario);

// ============ RUTAS DE API (CRUD) ============

/**
 * GET /api/inventario/productos
 * Obtener todos los productos
 */
router.get('/productos', inventarioController.getAllProductos);

/**
 * GET /api/inventario/productos/:id
 * Obtener un producto específico por ID
 */
router.get('/productos/:id', inventarioController.getProductoById);

/**
 * POST /api/inventario/productos
 * Crear un nuevo producto
 */
router.post('/productos', inventarioController.createProducto);

/**
 * PUT /api/inventario/productos/:id
 * Actualizar un producto existente
 */
router.put('/productos/:id', inventarioController.updateProducto);

/**
 * DELETE /api/inventario/productos/:id
 * Eliminar un producto
 */
router.delete('/productos/:id', inventarioController.deleteProducto);

module.exports = router;
