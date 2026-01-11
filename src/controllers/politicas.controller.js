/**
 * Controlador de Políticas
 * Gestiona la visualización de políticas de la empresa
 */

// Políticas de la empresa
const POLITICAS = {
    VENTAS: {
        titulo: 'Políticas de Ventas',
        items: [
            'Todas las ventas deben registrarse en el sistema antes de procesar el envío.',
            'El delivery debe estar pagado para confirmar la venta y descontar del stock.',
            'Se debe verificar la disponibilidad de stock antes de confirmar la venta.',
            'Toda venta debe incluir el número de WhatsApp del cliente para seguimiento.',
            'Los precios están sujetos a la lista actualizada vigente.'
        ]
    },
    DELIVERY: {
        titulo: 'Políticas de Delivery',
        items: [
            'El costo del delivery varía según la ciudad de destino.',
            'Lima Metropolitana: Delivery entre S/ 10 - S/ 15.',
            'Provincias: Costo según agencia de transporte.',
            'El delivery debe ser pagado antes del envío del producto.',
            'Tiempo estimado de entrega: 24-48 horas en Lima, 3-7 días en provincias.'
        ]
    },
    CAMBIOS: {
        titulo: '🔄 Políticas de Cambios - AMORA',
        subtitulo: 'Requisitos Generales',
        items: [
            '✅ Cambios sujetos a stock disponible',
            '📹 Video detallado del calzado es OBLIGATORIO para evaluación',
            '👟 Producto sin uso y en perfectas condiciones',
            '⚠️ AMORA se reserva el derecho de aprobar o rechazar el cambio'
        ],
        secciones: {
            lima: {
                titulo: '🏙️ LIMA',
                items: [
                    '⏰ Máximo 2 días para solicitar cambio',
                    '💰 Pago de S/10 por nuevo delivery'
                ]
            },
            provincia: {
                titulo: '🚚 PROVINCIA',
                items: [
                    '⏰ Máximo 1 semana para solicitar cambio',
                    '📦 Cliente asume el costo del envío de retorno a Lima'
                ]
            }
        }
    },
    INVENTARIO: {
        titulo: 'Políticas de Inventario',
        items: [
            'Todo ingreso de mercadería debe registrarse inmediatamente en el sistema.',
            'Se debe verificar el estado de los productos antes de registrar el ingreso.',
            'El stock se actualiza automáticamente con cada venta confirmada.',
            'Realizar inventario físico mensual para verificar coincidencias.',
            'Reportar inmediatamente cualquier discrepancia en el inventario.'
        ]
    },
    ATENCION_CLIENTE: {
        titulo: 'Políticas de Atención al Cliente',
        items: [
            'Responder consultas de WhatsApp en un máximo de 2 horas.',
            'Brindar información clara sobre disponibilidad, precios y delivery.',
            'Ser amable y profesional en todo momento.',
            'Resolver reclamos en un máximo de 24 horas.',
            'Mantener al cliente informado sobre el estado de su pedido.'
        ]
    },
    PRECIOS: {
        titulo: 'Políticas de Precios',
        items: [
            'Los precios mostrados son en soles peruanos (S/).',
            'Los precios pueden variar según temporada y disponibilidad.',
            'Descuentos por volumen: Consultar condiciones especiales.',
            'Precio de delivery no incluido en el precio del producto.',
            'Promociones y ofertas sujetas a stock disponible.'
        ]
    }
};

class PoliticasController {
    /**
     * Mostrar todas las políticas
     */
    static mostrarPoliticas(req, res) {
        res.render('politicas/index', {
            title: 'Políticas de la Empresa',
            politicas: POLITICAS
        });
    }

    /**
     * Mostrar política específica
     */
    static mostrarPoliticaEspecifica(req, res) {
        const { tipo } = req.params;
        const politica = POLITICAS[tipo.toUpperCase()];

        if (!politica) {
            return res.status(404).render('404', {
                title: 'Política no encontrada'
            });
        }

        res.render('politicas/detalle', {
            title: politica.titulo,
            politica,
            tipo: tipo.toUpperCase()
        });
    }
}

module.exports = PoliticasController;
