/**
 * Middleware de logging personalizado
 */

/**
 * Logger de peticiones
 */
function requestLogger(req, res, next) {
    const timestamp = new Date().toISOString();
    const method = req.method;
    const url = req.url;
    const ip = req.ip || req.connection.remoteAddress;

    console.log(`[${timestamp}] ${method} ${url} - IP: ${ip}`);
    
    next();
}

/**
 * Logger de respuestas
 */
function responseLogger(req, res, next) {
    const originalSend = res.send;

    res.send = function(data) {
        const statusCode = res.statusCode;
        const timestamp = new Date().toISOString();
        
        console.log(`[${timestamp}] Response: ${statusCode} - ${req.method} ${req.url}`);
        
        originalSend.call(this, data);
    };

    next();
}

module.exports = {
    requestLogger,
    responseLogger
};
