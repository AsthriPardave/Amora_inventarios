/**
 * Configuración general de la aplicación
 */

module.exports = {
    // Puerto del servidor
    port: process.env.PORT || 3000,
    
    // Entorno de ejecución
    env: process.env.NODE_ENV || 'development',
    
    // Configuración de Google Sheets
    googleSheets: {
        spreadsheetId: process.env.GOOGLE_SHEET_ID,
        credentials: {
            client_email: process.env.GOOGLE_CLIENT_EMAIL,
            private_key: process.env.GOOGLE_PRIVATE_KEY ? 
                process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n') : undefined
        },
        scopes: ['https://www.googleapis.com/auth/spreadsheets']
    },
    
    // Nombres de las hojas en Google Sheets
    sheetNames: {
        productos: process.env.SHEET_NAME_PRODUCTOS || 'Productos',
        categorias: process.env.SHEET_NAME_CATEGORIAS || 'Categorias',
        movimientos: process.env.SHEET_NAME_MOVIMIENTOS || 'Movimientos',
        ventas: process.env.SHEET_NAME_VENTAS || 'Ventas',
        ingresos: process.env.SHEET_NAME_INGRESOS || 'Ingresos',
        cambios: process.env.SHEET_NAME_CAMBIOS || 'Cambios'
    }
};
