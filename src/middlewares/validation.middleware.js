/**
 * Middleware para validación de datos
 */

/**
 * Valida los datos de un producto
 */
function validateProducto(req, res, next) {
    const { nombre, cantidad } = req.body;

    const errors = [];

    if (!nombre || nombre.trim() === '') {
        errors.push('El nombre del producto es obligatorio');
    }

    if (cantidad === undefined || cantidad === null || cantidad === '') {
        errors.push('La cantidad es obligatoria');
    } else if (isNaN(cantidad) || parseInt(cantidad) < 0) {
        errors.push('La cantidad debe ser un número positivo');
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Errores de validación',
            errors
        });
    }

    next();
}

/**
 * Middleware para manejar errores async
 */
function asyncHandler(fn) {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}

module.exports = {
    validateProducto,
    asyncHandler
};
