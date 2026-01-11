/**
 * Controlador de Ventas
 * Gestiona el registro y visualización de ventas
 */

const googleSheetsService = require('../services/googleSheets.service');
const config = require('../config/app.config');

// Ciudades disponibles para delivery
const CIUDADES = {
    LIMA: [
        'Lima Centro', 'San Isidro', 'Miraflores', 'Surco', 'La Molina',
        'San Borja', 'Barranco', 'Chorrillos', 'Villa El Salvador',
        'San Juan de Miraflores', 'Villa María del Triunfo', 'Los Olivos',
        'San Martín de Porres', 'Independencia', 'Comas', 'Callao'
    ],
    PROVINCIAS: [
        'Arequipa', 'Cusco', 'Trujillo', 'Chiclayo', 'Piura', 'Iquitos',
        'Huancayo', 'Tacna', 'Puno', 'Ica', 'Cajamarca', 'Ayacucho',
        'Tumbes', 'Tarapoto', 'Chimbote', 'Sullana', 'Juliaca', 'Pucallpa'
    ]
};

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
            ciudades: CIUDADES,
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
     */
    static async registrarVenta(req, res) {
        try {
            const { 
                modelo, talla, cantidad, 
                tipoVia, nombreVia, numero, interior, ciudad, referencia,
                deliveryPagado, whatsapp, observaciones 
            } = req.body;

            // Validar que el delivery esté pagado
            if (deliveryPagado !== 'true' && deliveryPagado !== true) {
                return res.render('ventas/registro', {
                    title: 'Registrar Venta',
                    ciudades: CIUDADES,
                    modelos: await VentasController.obtenerModelosDisponibles(),
                    error: '⚠️ No se puede registrar la venta. El delivery debe estar pagado.',
                    success: null,
                    formData: req.body
                });
            }

            // Validar datos básicos del producto
            if (!modelo || !talla || !cantidad) {
                return res.render('ventas/registro', {
                    title: 'Registrar Venta',
                    ciudades: CIUDADES,
                    modelos: await VentasController.obtenerModelosDisponibles(),
                    error: '⚠️ Los datos del producto son obligatorios.',
                    success: null,
                    formData: req.body
                });
            }

            // Validar datos de dirección
            if (!tipoVia || !nombreVia || !numero || !ciudad || !whatsapp) {
                return res.render('ventas/registro', {
                    title: 'Registrar Venta',
                    ciudades: CIUDADES,
                    modelos: await VentasController.obtenerModelosDisponibles(),
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
                    ciudades: CIUDADES,
                    modelos: await VentasController.obtenerModelosDisponibles(),
                    error: '⚠️ La talla debe estar entre 35 y 40.',
                    success: null,
                    formData: req.body
                });
            }

            // Construir dirección completa
            const direccionCompleta = `${tipoVia} ${nombreVia} ${numero}${interior ? ' Int. ' + interior : ''}, ${ciudad}`;
            const fecha = new Date();
            const fechaFormateada = fecha.toLocaleString('es-PE', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });

            // Preparar datos para Google Sheets
            const ventaData = [
                fechaFormateada,
                modelo,
                talla,
                cantidad,
                tipoVia,
                nombreVia,
                numero,
                interior || '',
                ciudad,
                referencia || '',
                direccionCompleta,
                whatsapp,
                'Sí', // deliveryPagado
                'Pendiente de envío', // estado
                observaciones || ''
            ];

            // Guardar en Google Sheets
            await googleSheetsService.appendSheet(
                config.sheetNames.ventas,
                [ventaData]
            );

            console.log('Venta registrada en Google Sheets:', ventaData);

            res.render('ventas/registro', {
                title: 'Registrar Venta',
                ciudades: CIUDADES,
                modelos: await VentasController.obtenerModelosDisponibles(),
                error: null,
                success: '✅ Venta registrada exitosamente en Google Sheets.',
                formData: null
            });

        } catch (error) {
            console.error('Error al registrar venta:', error);
            res.render('ventas/registro', {
                title: 'Registrar Venta',
                ciudades: CIUDADES,
                modelos: await VentasController.obtenerModelosDisponibles(),
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
                const headers = rows[0];
                ventas = rows.slice(1).map(row => {
                    return {
                        fecha: row[0] || '',
                        modelo: row[1] || '',
                        talla: row[2] || '',
                        cantidad: row[3] || '',
                        tipoVia: row[4] || '',
                        nombreVia: row[5] || '',
                        numero: row[6] || '',
                        interior: row[7] || '',
                        ciudad: row[8] || '',
                        referencia: row[9] || '',
                        direccionCompleta: row[10] || '',
                        whatsapp: row[11] || '',
                        deliveryPagado: row[12] || '',
                        estado: row[13] || 'Pendiente de envío',
                        observaciones: row[14] || ''
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
}

module.exports = VentasController;
