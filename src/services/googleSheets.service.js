/**
 * Servicio para Google Sheets
 * Métodos auxiliares para operaciones comunes con Google Sheets
 */

const googleSheetsConfig = require('../config/googleSheets.config');

class GoogleSheetsService {
    /**
     * Lee datos de una hoja específica
     * @param {string} sheetName - Nombre de la hoja
     * @param {string} range - Rango a leer (ej: 'A:F')
     */
    async readSheet(sheetName, range) {
        try {
            const sheets = googleSheetsConfig.getSheets();
            const spreadsheetId = googleSheetsConfig.getSpreadsheetId();

            const response = await sheets.spreadsheets.values.get({
                spreadsheetId,
                range: `${sheetName}!${range}`
            });

            return response.data.values || [];
        } catch (error) {
            console.error(`Error al leer la hoja ${sheetName}:`, error);
            throw error;
        }
    }

    /**
     * Escribe datos en una hoja específica
     * @param {string} sheetName - Nombre de la hoja
     * @param {string} range - Rango donde escribir
     * @param {Array} values - Valores a escribir
     */
    async writeSheet(sheetName, range, values) {
        try {
            const sheets = googleSheetsConfig.getSheets();
            const spreadsheetId = googleSheetsConfig.getSpreadsheetId();

            const response = await sheets.spreadsheets.values.update({
                spreadsheetId,
                range: `${sheetName}!${range}`,
                valueInputOption: 'USER_ENTERED',
                resource: { values }
            });

            return response.data;
        } catch (error) {
            console.error(`Error al escribir en la hoja ${sheetName}:`, error);
            throw error;
        }
    }

    /**
     * Agrega datos al final de una hoja
     * @param {string} sheetName - Nombre de la hoja
     * @param {Array} values - Valores a agregar
     */
    async appendSheet(sheetName, values) {
        try {
            const sheets = googleSheetsConfig.getSheets();
            const spreadsheetId = googleSheetsConfig.getSpreadsheetId();

            const response = await sheets.spreadsheets.values.append({
                spreadsheetId,
                range: `${sheetName}!A:A`,
                valueInputOption: 'USER_ENTERED',
                resource: { values }
            });

            return response.data;
        } catch (error) {
            console.error(`Error al agregar datos a la hoja ${sheetName}:`, error);
            throw error;
        }
    }

    /**
     * Convierte filas de una hoja en objetos
     * @param {Array} rows - Filas de la hoja
     * @returns {Array} Array de objetos
     */
    rowsToObjects(rows) {
        if (!rows || rows.length === 0) {
            return [];
        }

        const headers = rows[0];
        return rows.slice(1).map(row => {
            const obj = {};
            headers.forEach((header, index) => {
                obj[header] = row[index] || '';
            });
            return obj;
        });
    }

    /**
     * Convierte un objeto en una fila de valores
     * @param {Object} obj - Objeto a convertir
     * @param {Array} headers - Encabezados de la hoja
     * @returns {Array} Fila de valores
     */
    objectToRow(obj, headers) {
        return headers.map(header => obj[header] || '');
    }

    /**
     * Actualiza un rango completo de datos (sobrescribe todo)
     * @param {string} sheetName - Nombre de la hoja
     * @param {string} startCell - Celda inicial (ej: 'A1')
     * @param {Array} values - Matriz de valores a escribir
     */
    async updateSheet(sheetName, startCell, values) {
        try {
            const sheets = googleSheetsConfig.getSheets();
            const spreadsheetId = googleSheetsConfig.getSpreadsheetId();

            const response = await sheets.spreadsheets.values.update({
                spreadsheetId,
                range: `${sheetName}!${startCell}`,
                valueInputOption: 'USER_ENTERED',
                resource: { values }
            });

            return response.data;
        } catch (error) {
            console.error(`Error al actualizar la hoja ${sheetName}:`, error);
            throw error;
        }
    }
}

module.exports = new GoogleSheetsService();
