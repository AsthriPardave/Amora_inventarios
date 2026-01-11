/**
 * Controlador de Cambios de Talla
 * Gestiona el cambio de tallas en pedidos
 */

const googleSheetsService = require('../services/googleSheets.service');
const config = require('../config/app.config');

class CambiosController {
    /**
     * Mostrar lista de cambios de talla
     */
    static async listarCambios(req, res) {
        try {
            // Leer cambios desde Google Sheets
            const rows = await googleSheetsService.readSheet(
                config.sheetNames.cambios,
                'A:K'
            );

            let cambios = [];
            
            if (rows && rows.length > 1) {
                cambios = rows.slice(1).map((row, index) => {
                    return {
                        id: row[0] || (index + 1),
                        fecha: row[1] || '',
                        modeloOriginal: row[2] || '',
                        tallaSale: row[3] || '',
                        modeloNuevo: row[4] || '',
                        tallaEntra: row[5] || '',
                        motivo: row[6] || '',
                        cliente: row[7] || '',
                        whatsapp: row[8] || '',
                        observaciones: row[9] || '',
                        estado: row[10] || 'pendiente'
                    };
                });
            }

            res.render('cambios/lista', {
                title: 'Cambios de Talla',
                cambios
            });

        } catch (error) {
            console.error('Error al listar cambios:', error);
            res.render('cambios/lista', {
                title: 'Cambios de Talla',
                cambios: []
            });
        }
    }

    /**
     * Mostrar formulario para registrar cambio de talla
     */
    static mostrarFormularioCambio(req, res) {
        res.render('cambios/registro', {
            title: 'Registrar Cambio de Talla',
            error: null,
            success: null,
            formData: null
        });
    }

    /**
     * Buscar pedido por WhatsApp
     */
    static async buscarPedido(req, res) {
        try {
            const { whatsapp } = req.body;

            if (!whatsapp) {
                return res.render('cambios/registro', {
                    title: 'Registrar Cambio de Talla',
                    error: '⚠️ Debes ingresar un número de WhatsApp para buscar.',
                    success: null,
                    formData: null
                });
            }

            // Buscar pedido en Google Sheets por WhatsApp
            const rows = await googleSheetsService.readSheet(
                config.sheetNames.ventas,
                'A:O'
            );

            let pedido = null;
            
            if (rows && rows.length > 1) {
                // Buscar por WhatsApp (columna L, índice 11)
                for (let i = 1; i < rows.length; i++) {
                    if (rows[i][11] === whatsapp) {
                        pedido = {
                            encontrado: true,
                            modelo: rows[i][1] || '',
                            talla: rows[i][2] || '',
                            cantidad: rows[i][3] || 1,
                            whatsapp: whatsapp
                        };
                        break;
                    }
                }
            }

            if (pedido && pedido.encontrado) {
                // Obtener tallas disponibles del modelo en inventario
                const productosRows = await googleSheetsService.readSheet(
                    config.sheetNames.productos,
                    'A:J'
                );

                let tallasDisponibles = [];
                if (productosRows && productosRows.length > 1) {
                    // Buscar el modelo en inventario
                    for (let i = 1; i < productosRows.length; i++) {
                        const modeloInventario = productosRows[i][1] || '';
                        if (modeloInventario.toLowerCase() === pedido.modelo.toLowerCase()) {
                            // Verificar tallas con stock > 0 (columnas D a I = índices 3 a 8)
                            for (let tallaIdx = 0; tallaIdx < 6; tallaIdx++) {
                                const talla = 35 + tallaIdx;
                                const stock = parseInt(productosRows[i][3 + tallaIdx]) || 0;
                                if (stock > 0) {
                                    tallasDisponibles.push({ talla: talla, stock: stock });
                                }
                            }
                            break;
                        }
                    }
                }

                res.render('cambios/registro', {
                    title: 'Registrar Cambio de Talla',
                    error: null,
                    success: null,
                    formData: null,
                    pedido: pedido,
                    tallasDisponibles: tallasDisponibles
                });
            } else {
                res.render('cambios/registro', {
                    title: 'Registrar Cambio de Talla',
                    error: '❌ No se encontró ningún pedido con ese número de WhatsApp.',
                    success: null,
                    formData: null
                });
            }

        } catch (error) {
            console.error('Error al buscar pedido:', error);
            res.render('cambios/registro', {
                title: 'Registrar Cambio de Talla',
                error: '❌ Error al buscar el pedido. Por favor, intente nuevamente.',
                success: null,
                formData: req.body
            });
        }
    }

    /**
     * Registrar cambio de talla
     */
    static async registrarCambio(req, res) {
        try {
            const { fecha, modeloOriginal, tallaSale, modeloNuevo, tallaEntra, motivo, cliente, whatsapp, observaciones } = req.body;

            // Validar datos básicos
            if (!fecha || !modeloOriginal || !tallaSale || !tallaEntra || !whatsapp) {
                return res.render('cambios/registro', {
                    title: 'Registrar Cambio de Talla',
                    error: '⚠️ Todos los campos obligatorios deben estar completos.',
                    success: null,
                    formData: req.body
                });
            }

            // Validar tallas (35-40)
            const tallaSaleNum = parseInt(tallaSale);
            const tallaEntraNum = parseInt(tallaEntra);
            
            if (tallaSaleNum < 35 || tallaSaleNum > 40 || tallaEntraNum < 35 || tallaEntraNum > 40) {
                return res.render('cambios/registro', {
                    title: 'Registrar Cambio de Talla',
                    error: '⚠️ Las tallas deben estar entre 35 y 40.',
                    success: null,
                    formData: req.body
                });
            }

            // Generar ID único
            const id = Date.now().toString();

            // Preparar datos para Google Sheets
            // Columnas: id, fecha, modeloOriginal, tallaSale, modeloNuevo, tallaEntra, motivo, cliente, whatsapp, observaciones, estado
            const cambioData = [
                id,
                fecha,
                modeloOriginal.trim(),
                tallaSaleNum,
                modeloNuevo ? modeloNuevo.trim() : modeloOriginal.trim(),
                tallaEntraNum,
                motivo || 'Cambio de talla',
                cliente || '',
                whatsapp,
                observaciones || '',
                'pendiente'
            ];

            // Guardar en Google Sheets
            await googleSheetsService.appendSheet(
                config.sheetNames.cambios,
                [cambioData]
            );

            console.log('Cambio de talla registrado en Google Sheets:', cambioData);
            console.log('⚠️ Inventario NO modificado. El cambio debe ser marcado como "Realizado" para ajustar el inventario.');

            res.render('cambios/registro', {
                title: 'Registrar Cambio de Talla',
                error: null,
                success: '✅ Cambio de talla registrado exitosamente.\n⚠️ Estado: Pendiente. El inventario se ajustará cuando se marque como "Realizado".',
                formData: null
            });

        } catch (error) {
            console.error('Error al registrar cambio:', error);
            res.render('cambios/registro', {
                title: 'Registrar Cambio de Talla',
                error: '❌ Error al registrar el cambio. Por favor, intente nuevamente.',
                success: null,
                formData: req.body
            });
        }
    }

    /**
     * Actualizar estado de cambio
     * REGLA: El inventario solo se ajusta cuando el estado sea "Realizado"
     * - La talla que sale vuelve al stock (+1)
     * - La talla que entra se descuenta (-1)
     */
    static async actualizarEstado(req, res) {
        try {
            const { id } = req.params;
            const { estado } = req.body;

            // Leer cambios desde Google Sheets
            const rows = await googleSheetsService.readSheet(
                config.sheetNames.cambios,
                'A:K'
            );

            if (!rows || rows.length <= 1) {
                return res.redirect('/cambios/lista');
            }

            // Buscar el cambio por ID
            let cambioIndex = -1;
            let cambio = null;
            
            for (let i = 1; i < rows.length; i++) {
                if (rows[i][0] === id) {
                    cambioIndex = i;
                    cambio = {
                        id: rows[i][0],
                        fecha: rows[i][1],
                        modeloOriginal: rows[i][2],
                        tallaSale: parseInt(rows[i][3]),
                        modeloNuevo: rows[i][4],
                        tallaEntra: parseInt(rows[i][5]),
                        motivo: rows[i][6],
                        cliente: rows[i][7],
                        whatsapp: rows[i][8],
                        observaciones: rows[i][9],
                        estadoActual: rows[i][10]
                    };
                    break;
                }
            }

            if (!cambio) {
                console.error('Cambio no encontrado:', id);
                return res.redirect('/cambios/lista');
            }

            // Si el estado cambia a "Realizado" y antes NO era "Realizado", ajustar inventario
            if (estado === 'realizado' && cambio.estadoActual !== 'realizado') {
                console.log(`🔄 Ajustando inventario para cambio ${id}...`);
                
                // Leer inventario actual
                const productosRows = await googleSheetsService.readSheet(
                    config.sheetNames.productos,
                    'A:J'
                );

                if (productosRows && productosRows.length > 1) {
                    // Buscar el modelo en inventario
                    for (let i = 1; i < productosRows.length; i++) {
                        const modeloInventario = productosRows[i][1] || '';
                        
                        if (modeloInventario.toLowerCase() === cambio.modeloOriginal.toLowerCase()) {
                            // Actualizar stock de tallas
                            const indiceTallaSale = cambio.tallaSale - 35 + 3; // columna D=3 para talla 35
                            const indiceTallaEntra = cambio.tallaEntra - 35 + 3;
                            
                            // La talla que SALE vuelve al stock (+1)
                            const stockTallaSale = parseInt(productosRows[i][indiceTallaSale]) || 0;
                            productosRows[i][indiceTallaSale] = stockTallaSale + 1;
                            
                            // La talla que ENTRA se descuenta (-1)
                            const stockTallaEntra = parseInt(productosRows[i][indiceTallaEntra]) || 0;
                            productosRows[i][indiceTallaEntra] = Math.max(0, stockTallaEntra - 1);
                            
                            // Recalcular total
                            let nuevoTotal = 0;
                            for (let t = 0; t < 6; t++) {
                                nuevoTotal += parseInt(productosRows[i][3 + t]) || 0;
                            }
                            productosRows[i][9] = nuevoTotal; // columna J = total
                            
                            console.log(`✅ Inventario ajustado: Talla ${cambio.tallaSale} +1, Talla ${cambio.tallaEntra} -1`);
                            break;
                        }
                    }
                    
                    // Actualizar Google Sheets con el nuevo inventario
                    await googleSheetsService.updateSheet(
                        config.sheetNames.productos,
                        'A1',
                        productosRows
                    );
                }
            }

            // Actualizar el estado del cambio
            rows[cambioIndex][10] = estado;
            
            // Actualizar Google Sheets
            await googleSheetsService.updateSheet(
                config.sheetNames.cambios,
                'A1',
                rows
            );

            console.log(`✅ Cambio ${id} actualizado a estado: ${estado}`);

            res.redirect('/cambios/lista');

        } catch (error) {
            console.error('Error al actualizar estado:', error);
            res.redirect('/cambios/lista');
        }
    }

    /**
     * Buscar cambios por WhatsApp
     */
    static async buscarCambiosPorWhatsapp(req, res) {
        try {
            const { whatsapp } = req.query;

            // Leer cambios desde Google Sheets
            const rows = await googleSheetsService.readSheet(
                config.sheetNames.cambios,
                'A:K'
            );

            let cambios = [];
            
            if (rows && rows.length > 1 && whatsapp) {
                // Filtrar por WhatsApp
                cambios = rows.slice(1)
                    .filter(row => row[8] === whatsapp)
                    .map((row, index) => {
                        return {
                            id: row[0] || (index + 1),
                            fecha: row[1] || '',
                            modeloOriginal: row[2] || '',
                            tallaSale: row[3] || '',
                            modeloNuevo: row[4] || '',
                            tallaEntra: row[5] || '',
                            motivo: row[6] || '',
                            cliente: row[7] || '',
                            whatsapp: row[8] || '',
                            observaciones: row[9] || '',
                            estado: row[10] || 'pendiente'
                        };
                    });
            }

            res.render('cambios/lista', {
                title: 'Cambios de Talla',
                cambios,
                busqueda: whatsapp
            });

        } catch (error) {
            console.error('Error al buscar cambios:', error);
            res.render('error', {
                title: 'Error',
                message: 'Error al buscar cambios',
                error
            });
        }
    }
}

module.exports = CambiosController;
