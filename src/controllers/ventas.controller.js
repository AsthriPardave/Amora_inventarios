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
                'A:J'
            );

            const inventario = {};
            
            if (rows && rows.length > 1) {
                rows.slice(1).forEach(row => {
                    const modelo = row[1] || '';
                    if (modelo) {
                        inventario[modelo] = {};
                        // Procesar tallas (columnas D a I = índices 3 a 8)
                        for (let i = 0; i < 6; i++) {
                            const talla = 35 + i;
                            const stock = parseInt(row[3 + i]) || 0;
                            inventario[modelo][talla] = stock;
                        }
                    }
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
                'A:G'
            );

            if (!rows || rows.length <= 1) {
                return [];
            }

            // Convertir a objetos y extraer modelos únicos
            const productos = googleSheetsService.rowsToObjects(rows);
            const modelos = [...new Set(productos.map(p => p.modelo).filter(Boolean))];
            
            return modelos;
        } catch (error) {
            console.error('Error al obtener modelos:', error);
            // Retornar modelos de ejemplo si hay error
            return ['Nike Air Max 270', 'Adidas Superstar', 'Puma RS-X'];
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
                modelo, talla, cantidad, 
                direccion, departamento, provincia, distrito, referencia,
                deliveryPagado, whatsapp, observaciones,
                formToken
            } = req.body;

            // PREVENCIÓN DE DUPLICADOS
            // Verificar si existe una venta idéntica en los últimos 5 segundos
            const ventasRows = await googleSheetsService.readSheet(
                config.sheetNames.ventas,
                'A:O'
            );

            if (ventasRows && ventasRows.length > 1) {
                const ahora = new Date();
                const ultimasVentas = ventasRows.slice(-5); // Últimas 5 ventas
                
                for (const venta of ultimasVentas) {
                    const fechaVenta = new Date(venta[0]);
                    const diferenciaSegundos = (ahora - fechaVenta) / 1000;
                    
                    // Si hay una venta idéntica en los últimos 5 segundos, es un duplicado
                    if (diferenciaSegundos < 5 &&
                        venta[1] === modelo &&
                        venta[2] === talla &&
                        venta[3] === cantidad &&
                        venta[11] === whatsapp) {
                        
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
            if (!modelo || !talla || !cantidad) {
                return res.render('ventas/registro', {
                    title: 'Registrar Venta',
                    ubigeo: UBIGEO_PERU,
                    modelos: await VentasController.obtenerModelosDisponibles(),
                    inventario: await VentasController.obtenerInventarioCompleto(),
                    error: '⚠️ Los datos del producto son obligatorios.',
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
            
            // Obtener fecha y hora actual en zona horaria de Perú (GMT-5)
            const fecha = new Date();
            const fechaPeru = new Date(fecha.toLocaleString('en-US', { timeZone: 'America/Lima' }));
            const fechaFormateada = fechaPeru.toISOString();

            // Preparar datos para Google Sheets
            // Orden: Fecha, Modelo, Talla, Cantidad, Departamento, Provincia, Distrito, Dirección, Referencia, Dirección Completa, WhatsApp, Delivery Pagado, Estado, Observaciones
            const ventaData = [
                fechaFormateada,     // A: Fecha
                modelo,              // B: Modelo
                talla,               // C: Talla
                cantidad,            // D: Cantidad
                departamento,        // E: Departamento
                provincia,           // F: Provincia
                distrito,            // G: Distrito
                direccion,           // H: Dirección exacta
                referencia || '',    // I: Referencia
                direccionCompleta,   // J: Dirección completa
                whatsapp,            // K: WhatsApp
                'Sí',                // L: Delivery Pagado (siempre Sí)
                'Pendiente de envío', // M: Estado
                observaciones || ''   // N: Observaciones
            ];

            // Guardar en Google Sheets
            await googleSheetsService.appendSheet(
                config.sheetNames.ventas,
                [ventaData]
            );

            console.log('Venta registrada:', ventaData);

            // DESCONTAR STOCK - Ya que el delivery está pagado
            try {
                await VentasController.descontarStock(modelo, tallaNum, parseInt(cantidad));
                console.log(`✅ Stock descontado correctamente: ${modelo} - Talla ${tallaNum} - Cantidad ${cantidad}`);
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
                'A:O'
            );

            let ventas = [];
            
            if (rows && rows.length > 1) {
                // Convertir filas a objetos
                // Orden: A=Fecha, B=Modelo, C=Talla, D=Cantidad, E=Departamento, F=Provincia, G=Distrito, H=Dirección, I=Referencia, J=Dir.Completa, K=WhatsApp, L=DeliveryPagado, M=Estado, N=Observaciones
                ventas = rows.slice(1).map(row => {
                    return {
                        fecha: row[0] || '',           // A
                        modelo: row[1] || '',          // B
                        talla: row[2] || '',           // C
                        cantidad: row[3] || '',        // D
                        departamento: row[4] || '',    // E
                        provincia: row[5] || '',       // F
                        ciudad: row[6] || '',          // G (distrito)
                        direccion: row[7] || '',       // H (dirección exacta)
                        referencia: row[8] || '',      // I
                        direccionCompleta: row[9] || '', // J
                        whatsapp: row[10] || '',       // K
                        deliveryPagado: row[11] || '', // L
                        estado: row[12] || 'Pendiente de envío', // M
                        observaciones: row[13] || ''   // N
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
                'A:O'
            );

            if (!rows || rows.length < rowIndex) {
                return res.status(404).json({
                    success: false,
                    message: 'Venta no encontrada'
                });
            }

            const filaActual = rows[rowIndex - 1];
            const deliveryAnterior = filaActual[11]; // Estado anterior del delivery (columna L, índice 11)

            // Actualizar solo los campos de delivery y estado
            const filaActualizada = [...filaActual];
            if (deliveryPagado !== undefined) {
                filaActualizada[11] = deliveryPagado; // Columna L (índice 11)
            }
            if (estado !== undefined) {
                filaActualizada[12] = estado; // Columna M (índice 12)
            }

            // Si el delivery cambia de No/Pendiente a Sí/Pagado, descontar stock
            if (deliveryPagado === 'Sí' && deliveryAnterior !== 'Sí') {
                console.log('Descontando stock por cambio de delivery a Pagado');
                
                const modelo = filaActual[1];
                const talla = parseInt(filaActual[2]);
                const cantidad = parseInt(filaActual[3]);

                // Descontar stock del inventario
                await VentasController.descontarStock(modelo, talla, cantidad);
            }

            // Escribir la fila actualizada
            await googleSheetsService.writeSheet(
                config.sheetNames.ventas,
                `A${rowIndex}:O${rowIndex}`,
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
     */
    static async descontarStock(modelo, talla, cantidad) {
        try {
            // Leer productos desde Google Sheets
            const rows = await googleSheetsService.readSheet(
                config.sheetNames.productos,
                'A:M'
            );

            if (!rows || rows.length <= 1) {
                throw new Error('No se encontraron productos en la hoja');
            }

            // Buscar el producto por modelo
            let filaIndex = -1;
            for (let i = 1; i < rows.length; i++) {
                if (rows[i][1] === modelo) {
                    filaIndex = i;
                    break;
                }
            }

            if (filaIndex === -1) {
                throw new Error(`No se encontró el modelo: ${modelo}`);
            }

            // Calcular el índice de la talla (35-40 -> 3-8)
            const tallaIndex = 3 + (talla - 35);
            
            const filaActual = rows[filaIndex];
            const stockActual = parseInt(filaActual[tallaIndex]) || 0;

            if (stockActual < cantidad) {
                throw new Error(`Stock insuficiente. Disponible: ${stockActual}, Requerido: ${cantidad}`);
            }

            // Descontar el stock
            const nuevoStock = stockActual - cantidad;
            filaActual[tallaIndex] = nuevoStock;

            // Recalcular el total
            let nuevoTotal = 0;
            for (let i = 3; i <= 8; i++) {
                nuevoTotal += parseInt(filaActual[i]) || 0;
            }
            filaActual[9] = nuevoTotal;

            // Actualizar en Google Sheets
            await googleSheetsService.writeSheet(
                config.sheetNames.productos,
                `A${filaIndex + 1}:M${filaIndex + 1}`,
                [filaActual]
            );

            console.log(`Stock descontado: Modelo ${modelo}, Talla ${talla}, Cantidad ${cantidad}`);
            console.log(`Stock anterior: ${stockActual}, Stock nuevo: ${nuevoStock}`);

        } catch (error) {
            console.error('Error al descontar stock:', error);
            throw error;
        }
    }
}

module.exports = VentasController;
