/**
 * Controlador de Autenticación
 * Maneja login, logout y validación de credenciales
 */

const bcrypt = require('bcryptjs');

class AuthController {
    /**
     * Mostrar formulario de login
     */
    static mostrarLogin(req, res) {
        res.render('auth/login', {
            error: null
        });
    }

    /**
     * Procesar login
     */
    static async procesarLogin(req, res) {
        try {
            const { username, password } = req.body;

            // Validar campos
            if (!username || !password) {
                return res.render('auth/login', {
                    error: '⚠️ Usuario y contraseña son obligatorios.'
                });
            }

            // Obtener credenciales del .env
            const USERNAME_VALIDO = process.env.LOGIN_USERNAME || 'admin';
            const PASSWORD_VALIDA = process.env.LOGIN_PASSWORD || 'admin123';

            // Validar usuario
            if (username !== USERNAME_VALIDO) {
                console.warn('⚠️ Intento de login con usuario inválido:', username);
                return res.render('auth/login', {
                    error: '❌ Usuario o contraseña incorrectos.'
                });
            }

            // Validar contraseña
            if (password !== PASSWORD_VALIDA) {
                console.warn('⚠️ Intento de login con contraseña incorrecta para usuario:', username);
                return res.render('auth/login', {
                    error: '❌ Usuario o contraseña incorrectos.'
                });
            }

            // Credenciales válidas - Crear sesión
            req.session.usuario = {
                username: username,
                loginTime: new Date().toISOString()
            };

            console.log('✅ Login exitoso:', username);

            // Redirigir al inicio
            res.redirect('/');

        } catch (error) {
            console.error('Error al procesar login:', error);
            res.render('auth/login', {
                error: '❌ Error al procesar el login. Intente nuevamente.'
            });
        }
    }

    /**
     * Cerrar sesión
     */
    static logout(req, res) {
        const username = req.session?.usuario?.username;
        
        req.session.destroy((err) => {
            if (err) {
                console.error('Error al cerrar sesión:', err);
            } else {
                console.log('✅ Sesión cerrada:', username);
            }
            res.redirect('/auth/login');
        });
    }
}

module.exports = AuthController;
