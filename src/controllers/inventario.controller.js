/**
 * Controlador de Inventario
 * Maneja la lógica de negocio relacionada con los productos
 */

const ProductoModel = require('../models/producto.model');

class InventarioController {
    /**
     * Obtener todos los productos
     */
    async getAllProductos(req, res) {
        try {
            const productos = await ProductoModel.getAll();
            res.json({
                success: true,
                data: productos,
                count: productos.length
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al obtener los productos',
                error: error.message
            });
        }
    }

    /**
     * Obtener un producto por ID
     */
    async getProductoById(req, res) {
        try {
            const { id } = req.params;
            const producto = await ProductoModel.getById(id);

            if (!producto) {
                return res.status(404).json({
                    success: false,
                    message: 'Producto no encontrado'
                });
            }

            res.json({
                success: true,
                data: producto
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al obtener el producto',
                error: error.message
            });
        }
    }

    /**
     * Crear un nuevo producto
     */
    async createProducto(req, res) {
        try {
            const productoData = req.body;

            // Validaciones básicas
            if (!productoData.nombre || !productoData.cantidad || !productoData.precio) {
                return res.status(400).json({
                    success: false,
                    message: 'Faltan campos obligatorios'
                });
            }

            // Generar ID único (timestamp)
            productoData.id = Date.now().toString();

            const result = await ProductoModel.create(productoData);

            res.status(201).json({
                success: true,
                message: 'Producto creado exitosamente',
                data: productoData
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al crear el producto',
                error: error.message
            });
        }
    }

    /**
     * Actualizar un producto
     */
    async updateProducto(req, res) {
        try {
            const { id } = req.params;
            const productoData = req.body;

            const result = await ProductoModel.update(id, productoData);

            res.json({
                success: true,
                message: 'Producto actualizado exitosamente',
                data: productoData
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al actualizar el producto',
                error: error.message
            });
        }
    }

    /**
     * Eliminar un producto
     */
    async deleteProducto(req, res) {
        try {
            const { id } = req.params;

            await ProductoModel.delete(id);

            res.json({
                success: true,
                message: 'Producto eliminado exitosamente'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al eliminar el producto',
                error: error.message
            });
        }
    }

    /**
     * Renderizar la vista de inventario
     */
    async renderInventario(req, res) {
        try {
            const productos = await ProductoModel.getAll();
            res.render('inventario/index', {
                title: 'Gestión de Inventario',
                productos
            });
        } catch (error) {
            res.status(500).render('error', {
                title: 'Error',
                message: 'Error al cargar el inventario',
                error
            });
        }
    }
}

module.exports = new InventarioController();
