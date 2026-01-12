/**
 * Middleware de Autenticación
 * Protege las rutas del sistema verificando que el usuario esté logueado
 */

const config = require('../config/app.config');

class AuthMiddleware {
    /**
     * Verificar si el usuario está autenticado
     */
    static verificarAutenticacion(req, res, next) {
        // Verificar si existe sesión activa
        if (req.session && req.session.usuario) {
            // Usuario autenticado, continuar con la petición
            return next();
        }

        // No autenticado, redirigir al login
        // Si es una petición AJAX/API, devolver 401
        if (req.xhr || req.headers.accept?.indexOf('json') > -1) {
            return res.status(401).json({
                success: false,
                message: 'No autorizado. Debe iniciar sesión.'
            });
        }

        // Si es una petición normal, redirigir al login
        return res.redirect('/auth/login');
    }

    /**
     * Verificar si ya está logueado (para páginas de login)
     */
    static verificarYaLogueado(req, res, next) {
        if (req.session && req.session.usuario) {
            // Ya está logueado, redirigir al inicio
            return res.redirect('/');
        }
        next();
    }
}

module.exports = AuthMiddleware;
