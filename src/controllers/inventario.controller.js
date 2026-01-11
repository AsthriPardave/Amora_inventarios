/**
 * Controlador de Inventario
 * Maneja la lógica de negocio relacionada con los productos
 */

const googleSheetsService = require('../services/googleSheets.service');
const config = require('../config/app.config');

class InventarioController {
    /**
     * Obtener todos los productos
     */
    async getAllProductos(req, res) {
        try {
            // Leer productos desde Google Sheets
            const rows = await googleSheetsService.readSheet(
                config.sheetNames.productos,
                'A:J'
            );

            let productos = [];
            
            if (rows && rows.length > 1) {
                productos = rows.slice(1).map((row, index) => {
                    return {
                        id: row[0] || (index + 1),
                        modelo: row[1] || '',
                        categoria: row[2] || '',
                        talla_35: parseInt(row[3]) || 0,
                        talla_36: parseInt(row[4]) || 0,
                        talla_37: parseInt(row[5]) || 0,
                        talla_38: parseInt(row[6]) || 0,
                        talla_39: parseInt(row[7]) || 0,
                        talla_40: parseInt(row[8]) || 0,
                        total: parseInt(row[9]) || 0
                    };
                });
            }

            res.json({
                success: true,
                data: productos,
                count: productos.length
            });
        } catch (error) {
            console.error('Error al obtener productos:', error);
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
            
            // Leer productos desde Google Sheets
            const rows = await googleSheetsService.readSheet(
                config.sheetNames.productos,
                'A:J'
            );

            let producto = null;
            
            if (rows && rows.length > 1) {
                for (let i = 1; i < rows.length; i++) {
                    if (rows[i][0] === id) {
                        producto = {
                            id: rows[i][0],
                            modelo: rows[i][1] || '',
                            categoria: rows[i][2] || '',
                            talla_35: parseInt(rows[i][3]) || 0,
                            talla_36: parseInt(rows[i][4]) || 0,
                            talla_37: parseInt(rows[i][5]) || 0,
                            talla_38: parseInt(rows[i][6]) || 0,
                            talla_39: parseInt(rows[i][7]) || 0,
                            talla_40: parseInt(rows[i][8]) || 0,
                            total: parseInt(rows[i][9]) || 0
                        };
                        break;
                    }
                }
            }

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
            if (!productoData.modelo || !productoData.total) {
                return res.status(400).json({
                    success: false,
                    message: 'Faltan campos obligatorios'
                });
            }

            // Generar ID único (timestamp)
            const id = Date.now().toString();

            // Preparar datos para Google Sheets
            const newProducto = [
                id,
                productoData.modelo,
                productoData.categoria || 'Zapatillas',
                productoData.talla_35 || 0,
                productoData.talla_36 || 0,
                productoData.talla_37 || 0,
                productoData.talla_38 || 0,
                productoData.talla_39 || 0,
                productoData.talla_40 || 0,
                productoData.total
            ];

            // Guardar en Google Sheets
            await googleSheetsService.appendSheet(
                config.sheetNames.productos,
                [newProducto]
            );

            res.status(201).json({
                success: true,
                message: 'Producto creado exitosamente',
                data: { id, ...productoData }
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

            // TODO: Implementar actualización en Google Sheets
            // Por ahora, retornar success

            res.json({
                success: true,
                message: 'Producto actualizado exitosamente (funcionalidad pendiente)',
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

            // TODO: Implementar eliminación en Google Sheets
            // Por ahora, retornar success

            res.json({
                success: true,
                message: 'Producto eliminado exitosamente (funcionalidad pendiente)'
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
            // Leer productos desde Google Sheets
            const rows = await googleSheetsService.readSheet(
                config.sheetNames.productos,
                'A:J'
            );

            let productos = [];
            
            if (rows && rows.length > 1) {
                productos = rows.slice(1).map((row) => {
                    return {
                        id: row[0] || '',
                        modelo: row[1] || '',
                        categoria: row[2] || '',
                        talla_35: parseInt(row[3]) || 0,
                        talla_36: parseInt(row[4]) || 0,
                        talla_37: parseInt(row[5]) || 0,
                        talla_38: parseInt(row[6]) || 0,
                        talla_39: parseInt(row[7]) || 0,
                        talla_40: parseInt(row[8]) || 0,
                        total: parseInt(row[9]) || 0
                    };
                });
            }

            res.render('inventario/index', {
                title: 'Gestión de Inventario',
                productos
            });
        } catch (error) {
            console.error('Error al cargar inventario:', error);
            res.status(500).render('error', {
                title: 'Error',
                message: 'Error al cargar el inventario',
                error
            });
        }
    }
}

module.exports = new InventarioController();
