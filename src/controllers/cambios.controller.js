/**
 * Controlador de Cambios de Talla
 * Gestiona el cambio de tallas en pedidos
 */

const googleSheetsService = require('../services/googleSheets.service');
const config = require('../config/app.config');

class CambiosController {
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
            const rows = await googleSheetsService.readSheet(
                config.sheetNames.productos,
                'A:N'
            );

            if (!rows || rows.length <= 1) {
                return [];
            }

            const modelos = [...new Set(rows.slice(1).map(row => row[1]).filter(Boolean))];
            
            return modelos;
        } catch (error) {
            console.error('Error al obtener modelos:', error);
            return [];
        }
    }

    /**
     * Mostrar lista de cambios de talla
     */
    static async listarCambios(req, res) {
        try {
            // Leer cambios desde Google Sheets
            const rows = await googleSheetsService.readSheet(
                config.sheetNames.cambios,
                'A:J'
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
                        cantidad: row[6] || '1',
                        whatsapp: row[7] || '',
                        observaciones: row[8] || '',
                        estado: row[9] || 'pendiente'
                    };
                });
            }

            res.render('cambios/lista', {
                title: 'Lista de Cambios de Producto',
                cambios
            });

        } catch (error) {
            console.error('Error al listar cambios:', error);
            res.render('cambios/lista', {
                title: 'Lista de Cambios de Producto',
                cambios: []
            });
        }
    }

    /**
     * Mostrar formulario para registrar cambio de talla
     */
    static mostrarFormularioCambio(req, res) {
        res.render('cambios/registro', {
            title: 'Registrar Cambio de Producto',
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
                    title: 'Registrar Cambio de Producto',
                    error: '⚠️ Debes ingresar un número de WhatsApp para buscar.',
                    success: null,
                    pedidos: null,
                    formData: null
                });
            }

            // Buscar TODOS los pedidos del cliente en Google Sheets por WhatsApp
            const rows = await googleSheetsService.readSheet(
                config.sheetNames.ventas,
                'A:O'
            );

            let pedidos = [];
            
            if (rows && rows.length > 1) {
                // Buscar todos los pedidos por WhatsApp
                // Nuevo formato: A=Fecha, B=Modelo, C=Talla, D=Cantidad, E=Departamento, F=Provincia, G=Distrito, H=Dirección, I=Referencia, J=Dir.Completa, K=WhatsApp, L=DeliveryPagado, M=Estado, N=Observaciones
                // WhatsApp está en índice 10 (columna K)
                // Estado está en índice 12 (columna M)
                const modelosUnicos = new Set();
                
                for (let i = 1; i < rows.length; i++) {
                    const estadoEnvio = rows[i][12] || 'Pendiente de envío'; // Columna M (índice 12)
                    
                    if (rows[i][10] === whatsapp && (estadoEnvio === 'Enviado' || estadoEnvio === 'Entregado')) { // Columna K (índice 10)
                        const modelo = rows[i][1] || '';
                        modelosUnicos.add(modelo);
                        
                        pedidos.push({
                            index: i + 1, // Índice de la fila en Google Sheets (base 1)
                            fecha: rows[i][0] || '',
                            modelo: modelo,
                            talla: rows[i][2] || '',
                            cantidad: parseInt(rows[i][3]) || 1,
                            whatsapp: whatsapp,
                            estado: estadoEnvio,
                            deliveryPagado: rows[i][11] || '' // Columna L (índice 11)
                        });
                    }
                }
                
                // Determinar si tiene múltiples modelos
                const tieneMultiplesModelos = modelosUnicos.size > 1;
                
                if (pedidos.length === 0) {
                    return res.render('cambios/registro', {
                        title: 'Registrar Cambio de Producto',
                        error: '⚠️ No se encontraron pedidos en estado "Enviado" o "Entregado" para este número de WhatsApp.',
                        success: null,
                        pedidos: null,
                        formData: null
                    });
                }

                // Obtener inventario completo para validar stock disponible
                const inventario = await CambiosController.obtenerInventarioCompleto();
                
                // Obtener modelos disponibles
                const modelos = await CambiosController.obtenerModelosDisponibles();

                res.render('cambios/registro', {
                    title: 'Registrar Cambio de Producto',
                    error: null,
                    success: null,
                    pedidos: pedidos,
                    tieneMultiplesModelos: tieneMultiplesModelos,
                    whatsapp: whatsapp,
                    inventario: inventario,
                    modelos: modelos,
                    formData: null
                });
                
                return;
            }

            if (pedidos.length === 0) {
                return res.render('cambios/registro', {
                    title: 'Registrar Cambio de Producto',
                    error: '⚠️ No se encontraron pedidos en estado "Enviado" o "Entregado" para este número de WhatsApp.',
                    success: null,
                    pedidos: null,
                    formData: null
                });
            }

        } catch (error) {
            console.error('Error al buscar pedido:', error);
            res.render('cambios/registro', {
                title: 'Registrar Cambio de Producto',
                error: '❌ Error al buscar el pedido. Por favor, intente nuevamente.',
                success: null,
                pedidos: null,
                formData: req.body
            });
        }
    }

    /**
     * Registrar cambio de producto
     */
    static async registrarCambio(req, res) {
        try {
            const { 
                fecha, 
                modeloOriginal, colorOriginal, marcaOriginal, tacoOriginal, tallaSale, 
                cantidadOriginal, cantidadCambio, 
                modeloNuevo, colorNuevo, marcaNueva, tacoNuevo, tallaEntra, 
                whatsapp, observaciones, formToken 
            } = req.body;

            console.log('Datos recibidos en registrarCambio:', req.body);

            // PREVENCIÓN DE DUPLICADOS
            const cambiosRows = await googleSheetsService.readSheet(
                config.sheetNames.cambios,
                'A:P'
            );

            if (cambiosRows && cambiosRows.length > 1) {
                const ahora = new Date();
                const ultimosCambios = cambiosRows.slice(-5);
                
                for (const cambio of ultimosCambios) {
                    const fechaCambio = new Date(cambio[1] || 0);
                    const diferenciaSegundos = (ahora - fechaCambio) / 1000;
                    
                    if (diferenciaSegundos < 5 &&
                        cambio[2] === modeloOriginal &&
                        cambio[3] === colorOriginal &&
                        cambio[4] === marcaOriginal &&
                        cambio[5] === tacoOriginal &&
                        cambio[6] === tallaSale &&
                        cambio[11] === tallaEntra &&
                        cambio[12] === whatsapp) {
                        
                        console.warn('⚠️ Duplicado detectado - Cambio ignorado');
                        return res.render('cambios/registro', {
                            title: 'Registrar Cambio de Producto',
                            error: null,
                            success: '✅ Cambio ya registrado. No se permiten duplicados.',
                            pedidos: null,
                            tieneMultiplesModelos: false,
                            formData: null
                        });
                    }
                }
            }

            // Validar datos básicos
            if (!fecha || !modeloOriginal || !colorOriginal || !marcaOriginal || !tacoOriginal || !tallaSale || 
                !modeloNuevo || !colorNuevo || !marcaNueva || !tacoNuevo || !tallaEntra || !whatsapp) {
                console.log('Validación fallida - campos faltantes');
                return res.render('cambios/registro', {
                    title: 'Registrar Cambio de Producto',
                    error: '⚠️ Todos los campos obligatorios deben estar completos.',
                    success: null,
                    pedidos: null,
                    tieneMultiplesModelos: false,
                    formData: req.body
                });
            }

            // Validar cantidad a cambiar
            const cantidadCambioNum = parseInt(cantidadCambio) || 1;
            const cantidadOriginalNum = parseInt(cantidadOriginal) || 1;
            
            if (cantidadCambioNum > cantidadOriginalNum) {
                return res.render('cambios/registro', {
                    title: 'Registrar Cambio de Producto',
                    error: '⚠️ La cantidad a cambiar no puede ser mayor a la cantidad del pedido.',
                    success: null,
                    pedidos: null,
                    tieneMultiplesModelos: false,
                    formData: req.body
                });
            }

            // Validar tallas (35-40)
            const tallaSaleNum = parseInt(tallaSale);
            const tallaEntraNum = parseInt(tallaEntra);
            
            if (tallaSaleNum < 35 || tallaSaleNum > 40 || tallaEntraNum < 35 || tallaEntraNum > 40) {
                return res.render('cambios/registro', {
                    title: 'Registrar Cambio de Producto',
                    error: '⚠️ Las tallas deben estar entre 35 y 40.',
                    success: null,
                    pedidos: null,
                    tieneMultiplesModelos: false,
                    formData: req.body
                });
            }

            // VALIDAR STOCK DISPONIBLE para el producto de destino
            const inventario = await CambiosController.obtenerInventarioCompleto();
            
            // Buscar la variante específica en el inventario
            const varianteKey = `${colorNuevo}|${marcaNueva}|${tacoNuevo}`;
            const modeloInventario = inventario[modeloNuevo];
            
            if (!modeloInventario) {
                return res.render('cambios/registro', {
                    title: 'Registrar Cambio de Producto',
                    error: `⚠️ El modelo "${modeloNuevo}" no existe en el inventario.`,
                    success: null,
                    pedidos: null,
                    tieneMultiplesModelos: false,
                    formData: req.body
                });
            }
            
            const variante = modeloInventario.variantes.find(v => v.key === varianteKey);
            if (!variante) {
                return res.render('cambios/registro', {
                    title: 'Registrar Cambio de Producto',
                    error: `⚠️ La combinación de color "${colorNuevo}", marca "${marcaNueva}" y taco "${tacoNuevo}" no existe para el modelo "${modeloNuevo}".`,
                    success: null,
                    pedidos: null,
                    tieneMultiplesModelos: false,
                    formData: req.body
                });
            }
            
            const stockDisponible = variante.tallas[tallaEntraNum] || 0;
            
            if (stockDisponible < cantidadCambioNum) {
                return res.render('cambios/registro', {
                    title: 'Registrar Cambio de Producto',
                    error: `⚠️ No hay suficiente stock disponible.\nModelo: "${modeloNuevo}"\nColor: "${colorNuevo}"\nMarca: "${marcaNueva}"\nTaco: "${tacoNuevo}"\nTalla: ${tallaEntraNum}\nStock actual: ${stockDisponible} unidad(es)\nNecesitas: ${cantidadCambioNum} unidad(es).`,
                    success: null,
                    pedidos: null,
                    tieneMultiplesModelos: false,
                    formData: req.body
                });
            }

            // Generar ID único
            const id = Date.now().toString();

            // Preparar datos para Google Sheets
            // Columnas: id, fecha, modeloOriginal, colorOriginal, marcaOriginal, tacoOriginal, tallaSale, 
            //           modeloNuevo, colorNuevo, marcaNueva, tacoNuevo, tallaEntra, 
            //           cantidad, whatsapp, observaciones, estado
            const cambioData = [
                id,                         // A
                fecha,                      // B
                modeloOriginal.trim(),      // C
                colorOriginal.trim(),       // D
                marcaOriginal.trim(),       // E
                tacoOriginal.trim(),        // F
                tallaSaleNum,               // G
                modeloNuevo.trim(),         // H
                colorNuevo.trim(),          // I
                marcaNueva.trim(),          // J
                tacoNuevo.trim(),           // K
                tallaEntraNum,              // L
                cantidadCambioNum,          // M
                whatsapp,                   // N
                observaciones || '',        // O
                'pendiente'                 // P
            ];

            // Guardar en Google Sheets
            await googleSheetsService.appendSheet(
                config.sheetNames.cambios,
                [cambioData]
            );

            console.log('Cambio de talla registrado en Google Sheets:', cambioData);
            
            // ACTUALIZAR LA VENTA ORIGINAL
            // Buscar la venta original en ventas para agregar observación
            const ventasRows = await googleSheetsService.readSheet(
                config.sheetNames.ventas,
                'A:O'
            );

            if (ventasRows && ventasRows.length > 1) {
                // Buscar la fila de la venta original (coincide whatsapp, modelo y talla)
                for (let i = 1; i < ventasRows.length; i++) {
                    const ventaWhatsapp = ventasRows[i][11] || '';
                    const ventaModelo = ventasRows[i][1] || '';
                    const ventaTalla = ventasRows[i][2] || '';
                    
                    if (ventaWhatsapp === whatsapp && 
                        ventaModelo === modeloOriginal.trim() && 
                        ventaTalla == tallaSaleNum) {
                        
                        // Actualizar observaciones de la venta original
                        const observacionCambio = `🔄 PRODUCTO CAMBIADO - Cambio registrado el ${fecha}. Nueva talla: ${tallaEntraNum}${modeloFinal !== modeloOriginal.trim() ? `, Nuevo modelo: ${modeloFinal}` : ''}`;
                        const rowIndex = i + 1; // Base 1
                        const range = `${config.sheetNames.ventas}!O${rowIndex}`;
                        
                        await googleSheetsService.updateCell(range, observacionCambio);
                        console.log(`Venta original actualizada con observación de cambio en fila ${rowIndex}`);
                        break; // Solo actualizar la primera coincidencia
                    }
                }
            }

            // REGISTRAR NUEVA VENTA CON EL PRODUCTO CAMBIADO
            // Obtener datos de la venta original para copiar dirección y otros datos
            if (ventasRows && ventasRows.length > 1) {
                for (let i = 1; i < ventasRows.length; i++) {
                    const ventaWhatsapp = ventasRows[i][11] || '';
                    const ventaModelo = ventasRows[i][1] || '';
                    const ventaTalla = ventasRows[i][2] || '';
                    
                    if (ventaWhatsapp === whatsapp && 
                        ventaModelo === modeloOriginal.trim() && 
                        ventaTalla == tallaSaleNum) {
                        
                        // Copiar datos de dirección de la venta original
                        const fechaVenta = new Date().toISOString();
                        
                        const nuevaVentaData = [
                            fechaVenta,
                            modeloFinal, // nuevo modelo
                            tallaEntraNum, // nueva talla
                            cantidadCambioNum, // cantidad
                            ventasRows[i][4] || '', // tipoVia
                            ventasRows[i][5] || '', // nombreVia
                            ventasRows[i][6] || '', // numero
                            ventasRows[i][7] || '', // interior
                            ventasRows[i][8] || '', // ciudad
                            ventasRows[i][9] || '', // referencia
                            ventasRows[i][10] || '', // direccionCompleta
                            whatsapp,
                            'Sí', // deliveryPagado
                            'Pendiente de envío', // estado
                            `🔄 Producto generado por cambio de talla (ID cambio: ${id})` // observaciones
                        ];
                        
                        await googleSheetsService.appendSheet(
                            config.sheetNames.ventas,
                            [nuevaVentaData]
                        );
                        
                        console.log('Nueva venta registrada por cambio:', nuevaVentaData);
                        break;
                    }
                }
            }
            
            console.log('⚠️ Inventario NO modificado. El cambio debe ser marcado como "Realizado" para ajustar el inventario.');

            res.render('cambios/registro', {
                title: 'Registrar Cambio de Producto',
                error: null,
                success: `✅ Cambio de ${cantidadCambioNum} unidad(es) registrado exitosamente.\n✅ Venta original marcada como cambiada.\n✅ Nueva venta registrada con el producto cambiado.\n⚠️ Estado: Pendiente. El inventario se ajustará cuando se marque como "Realizado".`,
                pedidos: null,
                tieneMultiplesModelos: false,
                formData: null
            });

        } catch (error) {
            console.error('Error al registrar cambio:', error);
            res.render('cambios/registro', {
                title: 'Registrar Cambio de Producto',
                error: '❌ Error al registrar el cambio. Por favor, intente nuevamente.',
                success: null,
                pedidos: null,
                tieneMultiplesModelos: false,
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
                'A:J'
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
                        cantidad: parseInt(rows[i][6]) || 1,
                        whatsapp: rows[i][7],
                        observaciones: rows[i][8],
                        estadoActual: rows[i][9]
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
                            // Actualizar stock de tallas según la cantidad
                            const indiceTallaSale = cambio.tallaSale - 35 + 3; // columna D=3 para talla 35
                            const indiceTallaEntra = cambio.tallaEntra - 35 + 3;
                            const cantidad = cambio.cantidad;
                            
                            // La talla que SALE vuelve al stock (+cantidad)
                            const stockTallaSale = parseInt(productosRows[i][indiceTallaSale]) || 0;
                            productosRows[i][indiceTallaSale] = stockTallaSale + cantidad;
                            
                            // La talla que ENTRA se descuenta (-cantidad)
                            const stockTallaEntra = parseInt(productosRows[i][indiceTallaEntra]) || 0;
                            productosRows[i][indiceTallaEntra] = Math.max(0, stockTallaEntra - cantidad);
                            
                            // Recalcular total
                            let nuevoTotal = 0;
                            for (let t = 0; t < 6; t++) {
                                nuevoTotal += parseInt(productosRows[i][3 + t]) || 0;
                            }
                            productosRows[i][9] = nuevoTotal; // columna J = total
                            
                            console.log(`✅ Inventario ajustado: Talla ${cambio.tallaSale} +${cantidad}, Talla ${cambio.tallaEntra} -${cantidad}`);
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
            rows[cambioIndex][9] = estado;
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
                'A:J'
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
