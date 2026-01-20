/**
 * Controlador de Ventas
 * Gestiona el registro y visualización de ventas
 */

const googleSheetsService = require('../services/googleSheets.service');
const config = require('../config/app.config');
const UBIGEO_PERU = require('../config/ubigeo.config');

class VentasController {
    /**
     * Obtener inventario completo con tallas disponibles por modelo
     */
    static async obtenerInventarioCompleto() {
        try {
            const rows = await googleSheetsService.readSheet(
                config.sheetNames.productos,
                'A:N'
            );

            const inventario = {};
            
            if (rows && rows.length > 1) {
                rows.slice(1).forEach(row => {
                    const modelo = row[1] || '';
                    if (modelo) {
                        if (!inventario[modelo]) {
                            inventario[modelo] = {
                                variantes: [],
                                tallas: {},
                                colores: new Set(),
                                marcas: new Set(),
                                tacos: new Set()
                            };
                        }

                        const color = row[2] || '';
                        const marca = row[3] || '';
                        const taco = row[4] || '';
                        
                        // Agregar opciones únicas
                        if (color) inventario[modelo].colores.add(color);
                        if (marca) inventario[modelo].marcas.add(marca);
                        if (taco) inventario[modelo].tacos.add(taco);

                        // Crear clave única para esta variante
                        const varianteKey = `${color}|${marca}|${taco}`;
                        
                        // Procesar tallas (columnas F a K = índices 5 a 10)
                        const tallasVariante = {};
                        for (let i = 0; i < 6; i++) {
                            const talla = 35 + i;
                            const stock = parseInt(row[5 + i]) || 0;
                            if (stock > 0) {
                                tallasVariante[talla] = stock;
                            }
                        }

                        // Guardar variante con sus tallas
                        inventario[modelo].variantes.push({
                            color,
                            marca,
                            taco,
                            key: varianteKey,
                            tallas: tallasVariante
                        });
                    }
                });

                // Convertir Sets a Arrays
                Object.keys(inventario).forEach(modelo => {
                    inventario[modelo].colores = Array.from(inventario[modelo].colores);
                    inventario[modelo].marcas = Array.from(inventario[modelo].marcas);
                    inventario[modelo].tacos = Array.from(inventario[modelo].tacos);
                });
            }

            return inventario;
        } catch (error) {
            console.error('Error al obtener inventario completo:', error);
            return {};
        }
    }

    /**
     * Obtener modelos únicos de productos registrados
     */
    static async obtenerModelosDisponibles() {
        try {
            // Leer productos desde Google Sheets
            const rows = await googleSheetsService.readSheet(
                config.sheetNames.productos,
                'A:N'
            );

            if (!rows || rows.length <= 1) {
                return [];
            }

            // Extraer modelos únicos (columna B, índice 1)
            const modelos = [...new Set(rows.slice(1).map(row => row[1]).filter(Boolean))];
            
            return modelos;
        } catch (error) {
            console.error('Error al obtener modelos:', error);
            return [];
        }
    }

    /**
     * Mostrar formulario de registro de ventas
     */
    static async mostrarFormularioVenta(req, res) {
        const modelos = await VentasController.obtenerModelosDisponibles();
        
        // Obtener inventario completo para mostrar tallas disponibles
        const inventario = await VentasController.obtenerInventarioCompleto();
        
        res.render('ventas/registro', {
            title: 'Registrar Venta',
            ubigeo: UBIGEO_PERU,
            modelos: modelos,
            inventario: inventario,
            error: null,
            success: null
        });
    }

    /**
     * Procesar registro de venta
     * Reglas de negocio:
     * - Solo se descuenta stock si el delivery está pagado
     * - Si no pagó delivery, no se registra la venta
     * - Prevención de duplicados: verifica últimas ventas en los últimos 5 segundos
     */
    static async registrarVenta(req, res) {
        try {
            const { 
                modelo, color, marca, tamano_taco, talla, cantidad, 
                direccion, departamento, provincia, distrito, referencia,
                deliveryPagado, whatsapp, observaciones,
                formToken
            } = req.body;

            // PREVENCIÓN DE DUPLICADOS
            // Verificar si existe una venta idéntica en los últimos 5 segundos
            const ventasRows = await googleSheetsService.readSheet(
                config.sheetNames.ventas,
                'A:N'
            );

            if (ventasRows && ventasRows.length > 1) {
                const ahora = new Date();
                const ultimasVentas = ventasRows.slice(-5); // Últimas 5 ventas
                
                for (const venta of ultimasVentas) {
                    const fechaVenta = new Date(venta[0]);
                    const diferenciaSegundos = (ahora - fechaVenta) / 1000;
                    
                    // Si hay una venta idéntica en los últimos 5 segundos, es un duplicado
                    // Índices correctos: 0=fecha, 1=modelo, 2=color, 3=marca, 4=taco, 5=talla, 6=cantidad, 10=whatsapp
                    if (diferenciaSegundos < 5 &&
                        venta[1]?.toUpperCase() === modelo?.toUpperCase() &&
                        venta[2]?.toUpperCase() === color?.toUpperCase() &&
                        venta[3]?.toUpperCase() === marca?.toUpperCase() &&
                        venta[4]?.toUpperCase() === tamano_taco?.toUpperCase() &&
                        venta[5] === talla &&
                        venta[6] === cantidad &&
                        venta[10] === whatsapp) {
                        
                        console.warn('⚠️ Duplicado detectado - Venta ignorada');
                        return res.render('ventas/registro', {
                            title: 'Registrar Venta',
                            ubigeo: UBIGEO_PERU,
                            modelos: await VentasController.obtenerModelosDisponibles(),
                            inventario: await VentasController.obtenerInventarioCompleto(),
                            error: null,
                            success: '✅ Venta ya registrada. No se permiten duplicados.',
                            formData: null
                        });
                    }
                }
            }

            // Validar que el delivery esté pagado
            if (deliveryPagado !== 'true' && deliveryPagado !== true) {
                return res.render('ventas/registro', {
                    title: 'Registrar Venta',
                    ubigeo: UBIGEO_PERU,
                    modelos: await VentasController.obtenerModelosDisponibles(),
                    inventario: await VentasController.obtenerInventarioCompleto(),
                    error: '⚠️ No se puede registrar la venta. El delivery debe estar pagado.',
                    success: null,
                    formData: req.body
                });
            }

            // Validar datos básicos del producto
            if (!modelo || !color || !marca || !tamano_taco || !talla || !cantidad) {
                return res.render('ventas/registro', {
                    title: 'Registrar Venta',
                    ubigeo: UBIGEO_PERU,
                    modelos: await VentasController.obtenerModelosDisponibles(),
                    inventario: await VentasController.obtenerInventarioCompleto(),
                    error: '⚠️ Todos los datos del producto son obligatorios (modelo, color, marca, taco, talla, cantidad).',
                    success: null,
                    formData: req.body
                });
            }

            // Validar datos de dirección
            if (!direccion || !departamento || !provincia || !distrito || !whatsapp) {
                return res.render('ventas/registro', {
                    title: 'Registrar Venta',
                    ubigeo: UBIGEO_PERU,
                    modelos: await VentasController.obtenerModelosDisponibles(),
                    inventario: await VentasController.obtenerInventarioCompleto(),
                    error: '⚠️ Los datos de envío (dirección completa y WhatsApp) son obligatorios.',
                    success: null,
                    formData: req.body
                });
            }

            // Validar talla (35-40)
            const tallaNum = parseInt(talla);
            if (tallaNum < 35 || tallaNum > 40) {
                return res.render('ventas/registro', {
                    title: 'Registrar Venta',
                    ubigeo: UBIGEO_PERU,
                    modelos: await VentasController.obtenerModelosDisponibles(),
                    inventario: await VentasController.obtenerInventarioCompleto(),
                    error: '⚠️ La talla debe estar entre 35 y 40.',
                    success: null,
                    formData: req.body
                });
            }

            // Construir dirección completa
            const direccionCompleta = `${direccion}, ${distrito}, ${provincia}, ${departamento}`;
            
            // Construir ubicación (Departamento - Provincia - Distrito)
            const ubicacionCompleta = `${departamento.toUpperCase()} - ${provincia.toUpperCase()} - ${distrito.toUpperCase()}`;
            
            // Obtener fecha y hora actual en zona horaria de Perú (GMT-5)
            const fecha = new Date();
            const dia = String(fecha.getDate()).padStart(2, '0');
            const mes = String(fecha.getMonth() + 1).padStart(2, '0');
            const anio = fecha.getFullYear();
            const fechaFormateada = `${dia}/${mes}/${anio}`;

            // Preparar datos para Google Sheets (convertir textos a mayúsculas)
            // Orden correcto: fecha, modelo, Color, Marca, Taco, Talla, Cantidad, Departamento, Direccion completa, Referencias, WhatsApp, Delivery pagado, Estado, Observaciones
            const ventaData = [
                fechaFormateada,                  // A: fecha
                modelo.toUpperCase(),             // B: modelo
                color.toUpperCase(),              // C: Color
                marca.toUpperCase(),              // D: Marca
                tamano_taco.toUpperCase(),        // E: Taco
                talla,                            // F: Talla
                cantidad,                         // G: Cantidad
                ubicacionCompleta,                // H: Departamento - Provincia - Distrito
                direccionCompleta.toUpperCase(),  // I: Direccion completa
                (referencia || '').toUpperCase(), // J: Referencias
                whatsapp,                         // K: WhatsApp
                'Sí',                             // L: Delivery pagado
                'Pendiente de envío',             // M: Estado
                (observaciones || '').toUpperCase() // N: Observaciones
            ];

            console.log('📝 Datos de venta a guardar:', ventaData);

            // Guardar en Google Sheets
            await googleSheetsService.appendSheet(
                config.sheetNames.ventas,
                [ventaData]
            );

            console.log('Venta registrada:', ventaData);

            // DESCONTAR STOCK - Ya que el delivery está pagado
            try {
                await VentasController.descontarStock(
                    modelo.toUpperCase(), 
                    color.toUpperCase(), 
                    marca.toUpperCase(), 
                    tamano_taco.toUpperCase(), 
                    tallaNum, 
                    parseInt(cantidad)
                );
                console.log(`✅ Stock descontado correctamente: ${modelo.toUpperCase()} - ${color.toUpperCase()} - ${marca.toUpperCase()} - ${tamano_taco.toUpperCase()} - Talla ${tallaNum} - Cantidad ${cantidad}`);
            } catch (errorStock) {
                console.error('⚠️ Error al descontar stock:', errorStock.message);
                // Continuar aunque falle el descuento de stock, la venta ya está registrada
            }

            res.render('ventas/registro', {
                title: 'Registrar Venta',
                ubigeo: UBIGEO_PERU,
                modelos: await VentasController.obtenerModelosDisponibles(),
                inventario: await VentasController.obtenerInventarioCompleto(),
                error: null,
                success: '✅ Venta registrada exitosamente en Google Sheets.',
                formData: null
            });

        } catch (error) {
            console.error('Error al registrar venta:', error);
            res.render('ventas/registro', {
                title: 'Registrar Venta',
                ubigeo: UBIGEO_PERU,
                modelos: await VentasController.obtenerModelosDisponibles(),
                inventario: await VentasController.obtenerInventarioCompleto(),
                error: '❌ Error al registrar la venta. Por favor, intente nuevamente.',
                success: null,
                formData: req.body
            });
        }
    }

    /**
     * Listar todas las ventas
     */
    static async listarVentas(req, res) {
        try {
            // Leer ventas desde Google Sheets
            const rows = await googleSheetsService.readSheet(
                config.sheetNames.ventas,
                'A:N'
            );

            let ventas = [];
            
            if (rows && rows.length > 1) {
                // Convertir filas a objetos
                // Orden correcto: fecha, modelo, Color, Marca, Taco, Talla, Cantidad, Departamento, Direccion completa, Referencias, WhatsApp, Delivery pagado, Estado, Observaciones
                ventas = rows.slice(1).map(row => {
                    return {
                        fecha: row[0] || '',           // A: fecha
                        modelo: row[1] || '',          // B: modelo
                        color: row[2] || '',           // C: Color
                        marca: row[3] || '',           // D: Marca
                        taco: row[4] || '',            // E: Taco
                        talla: row[5] || '',           // F: Talla
                        cantidad: row[6] || '',        // G: Cantidad
                        ubicacion: row[7] || '',       // H: Departamento - Provincia - Distrito
                        direccionCompleta: row[8] || '', // I: Direccion completa
                        referencia: row[9] || '',      // J: Referencias
                        whatsapp: row[10] || '',       // K: WhatsApp
                        deliveryPagado: row[11] || '', // L: Delivery pagado
                        estado: row[12] || 'Pendiente de envío', // M: Estado
                        observaciones: row[13] || ''   // N: Observaciones
                    };
                });
            }

            res.render('ventas/lista', {
                title: 'Ventas',
                ventas
            });

        } catch (error) {
            console.error('Error al listar ventas:', error);
            res.render('ventas/lista', {
                title: 'Ventas',
                ventas: []
            });
        }
    }

    /**
     * Actualizar estado de una venta
     */
    static async actualizarEstadoVenta(req, res) {
        try {
            const { rowIndex, deliveryPagado, estado } = req.body;

            console.log('Datos recibidos para actualizar:', { rowIndex, deliveryPagado, estado });

            if (!rowIndex || rowIndex < 2) {
                return res.status(400).json({
                    success: false,
                    message: 'Índice de fila inválido'
                });
            }

            // Leer la venta actual
            const rows = await googleSheetsService.readSheet(
                config.sheetNames.ventas,
                'A:Q'
            );

            if (!rows || rows.length < rowIndex) {
                return res.status(404).json({
                    success: false,
                    message: 'Venta no encontrada'
                });
            }

            const filaActual = rows[rowIndex - 1];
            const deliveryAnterior = filaActual[14]; // Estado anterior del delivery (columna O, índice 14)

            // Actualizar solo los campos de delivery y estado
            const filaActualizada = [...filaActual];
            if (deliveryPagado !== undefined) {
                filaActualizada[14] = deliveryPagado; // Columna O (índice 14)
            }
            if (estado !== undefined) {
                filaActualizada[15] = estado; // Columna P (índice 15)
            }

            // Si el delivery cambia de No/Pendiente a Sí/Pagado, descontar stock
            if (deliveryPagado === 'Sí' && deliveryAnterior !== 'Sí') {
                console.log('Descontando stock por cambio de delivery a Pagado');
                
                const modelo = filaActual[1];  // B: Modelo
                const color = filaActual[2];   // C: Color
                const marca = filaActual[3];   // D: Marca
                const taco = filaActual[4];    // E: Taco
                const talla = parseInt(filaActual[5]);  // F: Talla
                const cantidad = parseInt(filaActual[6]); // G: Cantidad

                // Descontar stock del inventario
                await VentasController.descontarStock(modelo, color, marca, taco, talla, cantidad);
            }

            // Escribir la fila actualizada
            await googleSheetsService.writeSheet(
                config.sheetNames.ventas,
                `A${rowIndex}:Q${rowIndex}`,
                [filaActualizada]
            );

            console.log(`Venta actualizada en fila ${rowIndex}:`, {
                deliveryPagado,
                estado
            });

            return res.json({
                success: true,
                message: 'Estado actualizado correctamente'
            });

        } catch (error) {
            console.error('Error al actualizar estado de venta:', error);
            return res.status(500).json({
                success: false,
                message: 'Error al actualizar el estado'
            });
        }
    }

    /**
     * Descontar stock del inventario
     * @param {string} modelo - Modelo del producto
     * @param {string} color - Color del producto
     * @param {string} marca - Marca del producto
     * @param {string} taco - Tamaño de taco
     * @param {number} talla - Talla (35-40)
     * @param {number} cantidad - Cantidad a descontar
     */
    static async descontarStock(modelo, color, marca, taco, talla, cantidad) {
        try {
            // Leer productos desde Google Sheets
            const rows = await googleSheetsService.readSheet(
                config.sheetNames.productos,
                'A:N'
            );

            if (!rows || rows.length <= 1) {
                throw new Error('No se encontraron productos en la hoja');
            }

            // Buscar el producto por modelo, color, marca y taco
            let filaIndex = -1;
            for (let i = 1; i < rows.length; i++) {
                if (rows[i][1] === modelo &&   // Modelo (columna B)
                    rows[i][2] === color &&     // Color (columna C)
                    rows[i][3] === marca &&     // Marca (columna D)
                    rows[i][4] === taco) {      // Taco (columna E)
                    filaIndex = i;
                    break;
                }
            }

            if (filaIndex === -1) {
                throw new Error(`No se encontró el producto: ${modelo} - ${color} - ${marca} - ${taco}`);
            }

            // Calcular el índice de la talla (35-40 -> columnas F-K, índices 5-10)
            const tallaIndex = 5 + (talla - 35);
            
            const filaActual = rows[filaIndex];
            const stockActual = parseInt(filaActual[tallaIndex]) || 0;

            if (stockActual < cantidad) {
                throw new Error(`Stock insuficiente. Disponible: ${stockActual}, Requerido: ${cantidad}`);
            }

            // Descontar el stock
            const nuevoStock = stockActual - cantidad;
            filaActual[tallaIndex] = nuevoStock;

            // Recalcular el total (suma de columnas F a K, índices 5 a 10)
            let nuevoTotal = 0;
            for (let i = 5; i <= 10; i++) {
                nuevoTotal += parseInt(filaActual[i]) || 0;
            }
            filaActual[11] = nuevoTotal; // Columna L

            // Actualizar en Google Sheets
            await googleSheetsService.writeSheet(
                config.sheetNames.productos,
                `A${filaIndex + 1}:N${filaIndex + 1}`,
                [filaActual]
            );

            console.log(`Stock descontado: ${modelo} - ${color} - ${marca} - ${taco}, Talla ${talla}, Cantidad ${cantidad}`);
            console.log(`Stock anterior: ${stockActual}, Stock nuevo: ${nuevoStock}`);

        } catch (error) {
            console.error('Error al descontar stock:', error);
            throw error;
        }
    }
}

module.exports = VentasController;
