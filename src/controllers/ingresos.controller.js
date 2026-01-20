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

            // Normalizar datos para comparación (convertir a mayúsculas y limpiar espacios)
            const modeloNorm = modelo.trim().toUpperCase();
            const colorNorm = color.trim().toUpperCase();
            const marcaNorm = marca.trim().toUpperCase();
            const tamanoTacoNorm = tamano_taco.trim().toUpperCase();
            const descripcionNorm = descripcion.trim().toUpperCase();
            const precioNorm = precio.toString().trim();

            // Leer productos existentes para buscar coincidencias
            const productosRows = await googleSheetsService.readSheet(
                config.sheetNames.productos,
                'A:P'
            );

            let productoExistente = null;
            let filaIndex = -1;

            console.log('🔍 Buscando producto con:', {
                modelo: modeloNorm,
                color: colorNorm,
                marca: marcaNorm,
                taco: tamanoTacoNorm,
                precio: precioNorm
            });

            if (productosRows && productosRows.length > 1) {
                console.log(`📊 Total de productos en la hoja: ${productosRows.length - 1}`);
                
                // Buscar producto que coincida en: modelo, color, marca, tamaño de taco y precio
                for (let i = 1; i < productosRows.length; i++) {
                    const row = productosRows[i];
                    
                    // Normalizar valores de la fila para comparación
                    const rowModelo = (row[1] || '').toString().trim().toUpperCase();
                    const rowColor = (row[2] || '').toString().trim().toUpperCase();
                    const rowMarca = (row[3] || '').toString().trim().toUpperCase();
                    const rowTamanoTaco = (row[4] || '').toString().trim().toUpperCase();
                    const rowPrecio = (row[12] || '').toString().trim();
                    
                    // Log de cada comparación
                    const esCoincidencia = 
                        rowModelo === modeloNorm &&
                        rowColor === colorNorm &&
                        rowMarca === marcaNorm &&
                        rowTamanoTaco === tamanoTacoNorm &&
                        rowPrecio === precioNorm;
                    
                    if (i <= 3 || esCoincidencia) { // Log de las primeras 3 filas o si hay coincidencia
                        console.log(`Fila ${i + 1}:`, {
                            modelo: `"${rowModelo}" === "${modeloNorm}" ? ${rowModelo === modeloNorm}`,
                            color: `"${rowColor}" === "${colorNorm}" ? ${rowColor === colorNorm}`,
                            marca: `"${rowMarca}" === "${marcaNorm}" ? ${rowMarca === marcaNorm}`,
                            taco: `"${rowTamanoTaco}" === "${tamanoTacoNorm}" ? ${rowTamanoTaco === tamanoTacoNorm}`,
                            precio: `"${rowPrecio}" === "${precioNorm}" ? ${rowPrecio === precioNorm}`,
                            COINCIDE: esCoincidencia
                        });
                    }
                    
                    if (esCoincidencia) {
                        productoExistente = row;
                        filaIndex = i;
                        console.log('✅ Producto existente encontrado en fila', i + 1, '- Se sumará el stock');
                        break;
                    }
                }
                
                if (!productoExistente) {
                    console.log('❌ No se encontró producto coincidente. Se creará uno nuevo.');
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

                // Actualizar fila en Google Sheets (mantener descripción original)
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
                    precioNorm,
                    productoExistente[13] || descripcionNorm // Mantener descripción original
                ];

                // Escribir en la posición específica (filaIndex + 1 porque las filas empiezan en 1)
                await googleSheetsService.writeSheet(
                    config.sheetNames.productos,
                    `A${filaIndex + 1}:P${filaIndex + 1}`,
                    [filaActualizada]
                );

                console.log(`✅ Stock agregado a producto existente (ID: ${productoExistente[0]}):`, {
                    modelo: modeloNorm,
                    unidadesAgregadas: totalUnidades,
                    totalNuevo: nuevoTotal
                });

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
                    precioNorm,
                    descripcionNorm
                ];

                // Guardar en Google Sheets
                await googleSheetsService.appendSheet(
                    config.sheetNames.productos,
                    [productoData]
                );

                console.log('✅ Producto nuevo registrado:', {
                    id,
                    modelo: modeloNorm,
                    color: colorNorm,
                    marca: marcaNorm,
                    taco: tamanoTacoNorm,
                    precio: precioNorm,
                    unidades: totalUnidades
                });

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
