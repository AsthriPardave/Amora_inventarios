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
            const { fecha, modelo, formToken } = req.body;

            // PREVENCIÓN DE DUPLICADOS
            const productosRows = await googleSheetsService.readSheet(
                config.sheetNames.productos,
                'A:M'
            );

            if (productosRows && productosRows.length > 1) {
                const ahora = new Date();
                const ultimosProductos = productosRows.slice(-5);
                
                for (const producto of ultimosProductos) {
                    const fechaProducto = new Date(producto[0] || 0);
                    const diferenciaSegundos = (ahora - fechaProducto) / 1000;
                    
                    if (diferenciaSegundos < 5 && producto[1] === modelo) {
                        console.warn('⚠️ Duplicado detectado - Producto ignorado');
                        return res.render('productos/registro', {
                            title: 'Registrar Producto',
                            error: null,
                            success: '✅ Producto ya registrado. No se permiten duplicados.',
                            formData: null
                        });
                    }
                }
            }

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
                success: `✅ Producto registrado exitosamente. ${totalUnidades} unidades agregadas al stock.`,
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

    /**
     * Mostrar formulario para agregar stock a producto existente
     */
    static async mostrarFormularioAgregarStock(req, res) {
        try {
            // Obtener todos los productos existentes
            const rows = await googleSheetsService.readSheet(
                config.sheetNames.productos,
                'A:J'
            );

            let productos = [];
            if (rows && rows.length > 1) {
                // Obtener solo modelos únicos
                const modelosSet = new Set();
                rows.slice(1).forEach(row => {
                    if (row[1]) {
                        modelosSet.add(row[1]);
                    }
                });
                productos = Array.from(modelosSet);
            }

            res.render('ingresos/agregar-stock', {
                title: 'Agregar Stock',
                modelos: productos,
                error: null,
                success: null
            });
        } catch (error) {
            console.error('Error al mostrar formulario:', error);
            res.render('ingresos/agregar-stock', {
                title: 'Agregar Stock',
                modelos: [],
                error: '❌ Error al cargar modelos.',
                success: null
            });
        }
    }

    /**
     * Procesar agregado de stock a producto existente
     */
    static async agregarStockProducto(req, res) {
        try {
            const { modelo } = req.body;

            if (!modelo) {
                return res.render('ingresos/agregar-stock', {
                    title: 'Agregar Stock',
                    modelos: await ProductosController.obtenerModelos(),
                    error: '⚠️ Debes seleccionar un modelo.',
                    success: null,
                    formData: req.body
                });
            }

            // Procesar tallas y cantidades
            let hayTallas = false;
            const tallasNuevas = {};
            
            for (let i = 35; i <= 40; i++) {
                const cantidad = parseInt(req.body[`talla_${i}`]) || 0;
                if (cantidad > 0) {
                    hayTallas = true;
                    tallasNuevas[i] = cantidad;
                }
            }

            if (!hayTallas) {
                return res.render('ingresos/agregar-stock', {
                    title: 'Agregar Stock',
                    modelos: await ProductosController.obtenerModelos(),
                    error: '⚠️ Debes ingresar cantidad para al menos una talla.',
                    success: null,
                    formData: req.body
                });
            }

            // Leer hoja de productos para encontrar el producto
            const rows = await googleSheetsService.readSheet(
                config.sheetNames.productos,
                'A:M'
            );

            if (!rows || rows.length <= 1) {
                throw new Error('No se encontraron productos en la hoja');
            }

            // Buscar la fila del producto (primera coincidencia con el modelo)
            let filaIndex = -1;
            for (let i = 1; i < rows.length; i++) {
                if (rows[i][1] === modelo) {
                    filaIndex = i;
                    break;
                }
            }

            if (filaIndex === -1) {
                return res.render('ingresos/agregar-stock', {
                    title: 'Agregar Stock',
                    modelos: await ProductosController.obtenerModelos(),
                    error: '⚠️ No se encontró el modelo seleccionado.',
                    success: null,
                    formData: req.body
                });
            }

            // Actualizar stock (sumar cantidades nuevas a las existentes)
            const filaActual = rows[filaIndex];
            const stockActual = {
                35: parseInt(filaActual[3]) || 0,
                36: parseInt(filaActual[4]) || 0,
                37: parseInt(filaActual[5]) || 0,
                38: parseInt(filaActual[6]) || 0,
                39: parseInt(filaActual[7]) || 0,
                40: parseInt(filaActual[8]) || 0
            };

            // Sumar stock nuevo
            let totalAgregado = 0;
            for (let talla = 35; talla <= 40; talla++) {
                if (tallasNuevas[talla]) {
                    stockActual[talla] += tallasNuevas[talla];
                    totalAgregado += tallasNuevas[talla];
                }
            }

            // Calcular nuevo total
            const nuevoTotal = Object.values(stockActual).reduce((sum, val) => sum + val, 0);

            // Actualizar fila en Google Sheets
            // Columnas: id, modelo, categoria, talla_35-40, total, precio, descripcion
            const filaActualizada = [
                filaActual[0], // id
                filaActual[1], // modelo
                filaActual[2], // categoria
                stockActual[35],
                stockActual[36],
                stockActual[37],
                stockActual[38],
                stockActual[39],
                stockActual[40],
                nuevoTotal,
                filaActual[10] || '', // precio
                filaActual[11] || ''  // descripcion
            ];

            // Escribir en la posición específica (filaIndex + 1 porque las filas empiezan en 1)
            await googleSheetsService.writeSheet(
                config.sheetNames.productos,
                `A${filaIndex + 1}:M${filaIndex + 1}`,
                [filaActualizada]
            );

            console.log(`Stock agregado al modelo ${modelo}:`, tallasNuevas);

            res.render('ingresos/agregar-stock', {
                title: 'Agregar Stock',
                modelos: await ProductosController.obtenerModelos(),
                error: null,
                success: `✅ Stock agregado exitosamente. Se añadieron ${totalAgregado} unidades al modelo "${modelo}".`,
                formData: null
            });

        } catch (error) {
            console.error('Error al agregar stock:', error);
            res.render('ingresos/agregar-stock', {
                title: 'Agregar Stock',
                modelos: await ProductosController.obtenerModelos(),
                error: '❌ Error al agregar stock. Por favor, intenta nuevamente.',
                success: null,
                formData: req.body
            });
        }
    }

    /**
     * Método auxiliar para obtener modelos
     */
    static async obtenerModelos() {
        try {
            const rows = await googleSheetsService.readSheet(
                config.sheetNames.productos,
                'A:J'
            );

            if (!rows || rows.length <= 1) {
                return [];
            }

            const modelosSet = new Set();
            rows.slice(1).forEach(row => {
                if (row[1]) {
                    modelosSet.add(row[1]);
                }
            });
            return Array.from(modelosSet);
        } catch (error) {
            console.error('Error al obtener modelos:', error);
            return [];
        }
    }
}

module.exports = ProductosController;
