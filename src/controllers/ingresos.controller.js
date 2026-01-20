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
                'A:P'
            );

            let productos = [];
            
            if (rows && rows.length > 1) {
                // Convertir filas a objetos
                productos = rows.slice(1).map((row, index) => {
                    const tallas = {};
                    let totalUnidades = 0;
                    
                    // Procesar tallas (columnas F a K = índices 5 a 10)
                    for (let i = 0; i < 6; i++) {
                        const talla = 35 + i;
                        const cantidad = parseInt(row[5 + i]) || 0;
                        if (cantidad > 0) {
                            tallas[talla] = cantidad;
                            totalUnidades += cantidad;
                        }
                    }

                    return {
                        id: row[0] || (index + 1),
                        modelo: row[1] || '',
                        color: row[2] || '',
                        marca: row[3] || '',
                        tamano_taco: row[4] || '',
                        tallas: tallas,
                        totalUnidades: totalUnidades,
                        precio: row[12] || '',
                        descripcion: row[13] || ''
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

            const precio = req.body.precio || '';
            const descripcion = req.body.descripcion || '';
            const color = req.body.color || '';
            const marca = req.body.marca || '';
            const tamano_taco = req.body.tamano_taco || '';

            // Normalizar datos para comparación (convertir a mayúsculas)
            const modeloNorm = modelo.trim().toUpperCase();
            const colorNorm = color.toUpperCase();
            const marcaNorm = marca.toUpperCase();
            const tamanoTacoNorm = tamano_taco.toUpperCase();
            const descripcionNorm = descripcion.toUpperCase();

            // Leer productos existentes para buscar coincidencias
            const productosRows = await googleSheetsService.readSheet(
                config.sheetNames.productos,
                'A:P'
            );

            let productoExistente = null;
            let filaIndex = -1;

            if (productosRows && productosRows.length > 1) {
                // Buscar producto que coincida en TODOS los campos
                for (let i = 1; i < productosRows.length; i++) {
                    const row = productosRows[i];
                    
                    // Comparar todos los campos (índices: 1=modelo, 2=color, 3=marca, 4=tamano_taco, 12=precio, 13=descripcion)
                    if (
                        row[1] === modeloNorm &&
                        row[2] === colorNorm &&
                        row[3] === marcaNorm &&
                        row[4] === tamanoTacoNorm &&
                        row[12] === precio &&
                        row[13] === descripcionNorm
                    ) {
                        productoExistente = row;
                        filaIndex = i;
                        break;
                    }
                }
            }

            // Si existe un producto idéntico, sumar el stock
            if (productoExistente) {
                const stockActual = {
                    35: parseInt(productoExistente[5]) || 0,
                    36: parseInt(productoExistente[6]) || 0,
                    37: parseInt(productoExistente[7]) || 0,
                    38: parseInt(productoExistente[8]) || 0,
                    39: parseInt(productoExistente[9]) || 0,
                    40: parseInt(productoExistente[10]) || 0
                };

                // Sumar stock nuevo
                for (let talla = 35; talla <= 40; talla++) {
                    if (tallasData[talla]) {
                        stockActual[talla] += tallasData[talla];
                    }
                }

                // Calcular nuevo total
                const nuevoTotal = Object.values(stockActual).reduce((sum, val) => sum + val, 0);

                // Actualizar fila en Google Sheets
                const filaActualizada = [
                    productoExistente[0], // id original
                    modeloNorm,
                    colorNorm,
                    marcaNorm,
                    tamanoTacoNorm,
                    stockActual[35],
                    stockActual[36],
                    stockActual[37],
                    stockActual[38],
                    stockActual[39],
                    stockActual[40],
                    nuevoTotal,
                    precio,
                    descripcionNorm
                ];

                // Escribir en la posición específica (filaIndex + 1 porque las filas empiezan en 1)
                await googleSheetsService.writeSheet(
                    config.sheetNames.productos,
                    `A${filaIndex + 1}:P${filaIndex + 1}`,
                    [filaActualizada]
                );

                console.log('Stock agregado a producto existente:', modeloNorm);

                res.render('productos/registro', {
                    title: 'Registrar Producto',
                    error: null,
                    success: `✅ Stock agregado al producto existente. Se añadieron ${totalUnidades} unidades al modelo "${modeloNorm}".`,
                    formData: null
                });

            } else {
                // No existe producto idéntico, crear uno nuevo
                const id = Date.now().toString();

                // Preparar fila para Google Sheets
                // Columnas: id, modelo, color, marca, tamano_taco, talla_35, talla_36, talla_37, talla_38, talla_39, talla_40, total, precio, descripcion
                const productoData = [
                    id,
                    modeloNorm,
                    colorNorm,
                    marcaNorm,
                    tamanoTacoNorm,
                    tallasData[35] || 0,
                    tallasData[36] || 0,
                    tallasData[37] || 0,
                    tallasData[38] || 0,
                    tallasData[39] || 0,
                    tallasData[40] || 0,
                    totalUnidades,
                    precio,
                    descripcionNorm
                ];

                // Guardar en Google Sheets
                await googleSheetsService.appendSheet(
                    config.sheetNames.productos,
                    [productoData]
                );

                console.log('Producto nuevo registrado en Google Sheets:', productoData);

                res.render('productos/registro', {
                    title: 'Registrar Producto',
                    error: null,
                    success: `✅ Producto nuevo registrado exitosamente. ${totalUnidades} unidades agregadas al stock.`,
                    formData: null
                });
            }

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
