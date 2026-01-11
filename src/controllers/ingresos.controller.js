/**
 * Controlador de Productos
 * Gestiona el registro de productos disponibles para venta
 */

const googleSheetsService = require('../services/googleSheets.service');
const config = require('../config/app.config');

class ProductosController {
    /**
     * Mostrar formulario de registro de productos
     */
    static mostrarFormularioProducto(req, res) {
        res.render('productos/registro', {
            title: 'Registrar Producto',
            error: null,
            success: null
        });
    }

    /**
     * Listar todos los productos registrados
     */
    static async listarProductos(req, res) {
        try {
            // Leer productos desde Google Sheets
            const rows = await googleSheetsService.readSheet(
                config.sheetNames.productos,
                'A:M'
            );

            let productos = [];
            
            if (rows && rows.length > 1) {
                // Convertir filas a objetos
                productos = rows.slice(1).map((row, index) => {
                    const tallas = {};
                    let totalUnidades = 0;
                    
                    // Procesar tallas (columnas D a I = índices 3 a 8)
                    for (let i = 0; i < 6; i++) {
                        const talla = 35 + i;
                        const cantidad = parseInt(row[3 + i]) || 0;
                        if (cantidad > 0) {
                            tallas[talla] = cantidad;
                            totalUnidades += cantidad;
                        }
                    }

                    return {
                        id: row[0] || (index + 1),
                        modelo: row[1] || '',
                        categoria: row[2] || '',
                        tallas: tallas,
                        totalUnidades: totalUnidades,
                        precio: row[10] || '',
                        descripcion: row[11] || ''
                    };
                });
            }

            res.render('productos/lista', {
                title: 'Productos',
                productos
            });
        } catch (error) {
            console.error('Error al listar productos:', error);
            res.render('productos/lista', {
                title: 'Productos',
                productos: []
            });
        }
    }

    /**
     * Procesar registro de producto
     */
    static async registrarProducto(req, res) {
        try {
            const { fecha, modelo } = req.body;

            // Validar datos obligatorios
            if (!fecha || !modelo) {
                return res.render('productos/registro', {
                    title: 'Registrar Producto',
                    error: '⚠️ La fecha y el modelo son obligatorios.',
                    success: null,
                    formData: req.body
                });
            }

            // Procesar tallas y cantidades
            let hayTallas = false;
            const tallasData = {};
            let totalUnidades = 0;
            
            for (let i = 35; i <= 40; i++) {
                const cantidad = parseInt(req.body[`talla_${i}`]) || 0;
                if (cantidad > 0) {
                    hayTallas = true;
                    tallasData[i] = cantidad;
                    totalUnidades += cantidad;
                }
            }

            if (!hayTallas) {
                return res.render('productos/registro', {
                    title: 'Registrar Producto',
                    error: '⚠️ Debes ingresar cantidad para al menos una talla.',
                    success: null,
                    formData: req.body
                });
            }

            // Generar ID único
            const id = Date.now().toString();
            const categoria = req.body.categoria || 'Zapatillas';
            const precio = req.body.precio || '';
            const descripcion = req.body.descripcion || '';

            // Preparar fila para Google Sheets
            // Columnas: id, modelo, categoria, talla_35, talla_36, talla_37, talla_38, talla_39, talla_40, total, precio, descripcion
            const productoData = [
                id,
                modelo.trim(),
                categoria,
                tallasData[35] || 0,
                tallasData[36] || 0,
                tallasData[37] || 0,
                tallasData[38] || 0,
                tallasData[39] || 0,
                tallasData[40] || 0,
                totalUnidades,
                precio,
                descripcion
            ];

            // Guardar en Google Sheets
            await googleSheetsService.appendSheet(
                config.sheetNames.productos,
                [productoData]
            );

            console.log('Producto registrado en Google Sheets:', productoData);

            res.render('productos/registro', {
                title: 'Registrar Producto',
                error: null,
                success: `✅ Producto registrado exitosamente en Google Sheets. ${totalUnidades} unidades agregadas al stock.`,
                formData: null
            });

        } catch (error) {
            console.error('Error al registrar producto:', error);
            res.render('productos/registro', {
                title: 'Registrar Producto',
                error: '❌ Error al registrar el producto. Por favor, intenta nuevamente.',
                success: null,
                formData: req.body
            });
        }
    }
}

module.exports = ProductosController;
