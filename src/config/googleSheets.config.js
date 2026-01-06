/**
 * Configuración de la conexión con Google Sheets
 */

const { google } = require('googleapis');
const config = require('./app.config');

class GoogleSheetsConfig {
    constructor() {
        this.auth = null;
        this.sheets = null;
    }

    /**
     * Inicializa la autenticación con Google Sheets
     */
    async initialize() {
        try {
            // Crear cliente de autenticación JWT
            this.auth = new google.auth.JWT(
                config.googleSheets.credentials.client_email,
                null,
                config.googleSheets.credentials.private_key,
                config.googleSheets.scopes
            );

            // Autorizar el cliente
            await this.auth.authorize();

            // Crear instancia de la API de Sheets
            this.sheets = google.sheets({ version: 'v4', auth: this.auth });

            console.log('✅ Conexión con Google Sheets establecida correctamente');
            return this.sheets;
        } catch (error) {
            console.error('❌ Error al conectar con Google Sheets:', error.message);
            throw error;
        }
    }

    /**
     * Obtiene la instancia de Google Sheets
     */
    getSheets() {
        if (!this.sheets) {
            throw new Error('Google Sheets no está inicializado. Llama a initialize() primero.');
        }
        return this.sheets;
    }

    /**
     * Obtiene el ID de la hoja de cálculo
     */
    getSpreadsheetId() {
        return config.googleSheets.spreadsheetId;
    }
}

// Exportar una instancia única (Singleton)
module.exports = new GoogleSheetsConfig();
