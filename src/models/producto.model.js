/**
 * Modelo de Producto
 * Gestiona la interacción con la hoja de Productos en Google Sheets
 */

const googleSheetsConfig = require('../config/googleSheets.config');
const config = require('../config/app.config');

class ProductoModel {
    constructor() {
        this.sheetName = config.sheetNames.productos;
    }

    /**
     * Obtiene todos los productos
     */
    async getAll() {
        try {
            const sheets = googleSheetsConfig.getSheets();
            const spreadsheetId = googleSheetsConfig.getSpreadsheetId();

            const response = await sheets.spreadsheets.values.get({
                spreadsheetId,
                range: `${this.sheetName}!A:F`,
            });

            const rows = response.data.values;
            if (!rows || rows.length === 0) {
                return [];
            }

            // Convertir filas a objetos (la primera fila son los encabezados)
            const headers = rows[0];
            const productos = rows.slice(1).map(row => {
                const producto = {};
                headers.forEach((header, index) => {
                    producto[header] = row[index] || '';
                });
                return producto;
            });

            return productos;
        } catch (error) {
            console.error('Error al obtener productos:', error);
            throw error;
        }
    }

    /**
     * Obtiene un producto por ID
     */
    async getById(id) {
        try {
            const productos = await this.getAll();
            return productos.find(p => p.id === id.toString());
        } catch (error) {
            console.error('Error al obtener producto por ID:', error);
            throw error;
        }
    }

    /**
     * Crea un nuevo producto
     */
    async create(productoData) {
        try {
            const sheets = googleSheetsConfig.getSheets();
            const spreadsheetId = googleSheetsConfig.getSpreadsheetId();

            const values = [
                [
                    productoData.id,
                    productoData.nombre,
                    productoData.categoria,
                    productoData.cantidad,
                    productoData.precio,
                    productoData.descripcion
                ]
            ];

            const response = await sheets.spreadsheets.values.append({
                spreadsheetId,
                range: `${this.sheetName}!A:F`,
                valueInputOption: 'USER_ENTERED',
                resource: { values }
            });

            return response.data;
        } catch (error) {
            console.error('Error al crear producto:', error);
            throw error;
        }
    }

    /**
     * Actualiza un producto existente
     */
    async update(id, productoData) {
        try {
            const sheets = googleSheetsConfig.getSheets();
            const spreadsheetId = googleSheetsConfig.getSpreadsheetId();

            // Primero, encontrar la fila del producto
            const productos = await this.getAll();
            const index = productos.findIndex(p => p.id === id.toString());

            if (index === -1) {
                throw new Error('Producto no encontrado');
            }

            // La fila real es index + 2 (1 por el header, 1 por index base 0)
            const rowNumber = index + 2;

            const values = [
                [
                    id,
                    productoData.nombre,
                    productoData.categoria,
                    productoData.cantidad,
                    productoData.precio,
                    productoData.descripcion
                ]
            ];

            const response = await sheets.spreadsheets.values.update({
                spreadsheetId,
                range: `${this.sheetName}!A${rowNumber}:F${rowNumber}`,
                valueInputOption: 'USER_ENTERED',
                resource: { values }
            });

            return response.data;
        } catch (error) {
            console.error('Error al actualizar producto:', error);
            throw error;
        }
    }

    /**
     * Elimina un producto
     */
    async delete(id) {
        try {
            const sheets = googleSheetsConfig.getSheets();
            const spreadsheetId = googleSheetsConfig.getSpreadsheetId();

            // Encontrar la fila del producto
            const productos = await this.getAll();
            const index = productos.findIndex(p => p.id === id.toString());

            if (index === -1) {
                throw new Error('Producto no encontrado');
            }

            const rowNumber = index + 1; // +1 por el header

            // Eliminar la fila
            const response = await sheets.spreadsheets.batchUpdate({
                spreadsheetId,
                resource: {
                    requests: [
                        {
                            deleteDimension: {
                                range: {
                                    sheetId: 0, // ID de la hoja (0 es la primera)
                                    dimension: 'ROWS',
                                    startIndex: rowNumber,
                                    endIndex: rowNumber + 1
                                }
                            }
                        }
                    ]
                }
            });

            return response.data;
        } catch (error) {
            console.error('Error al eliminar producto:', error);
            throw error;
        }
    }
}

module.exports = new ProductoModel();
