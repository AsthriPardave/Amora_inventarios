/**
 * Rutas de Políticas
 */

const express = require('express');
const router = express.Router();
const PoliticasController = require('../controllers/politicas.controller');

// GET - Mostrar todas las políticas
router.get('/', PoliticasController.mostrarPoliticas);

// GET - Mostrar política específica
router.get('/:tipo', PoliticasController.mostrarPoliticaEspecifica);

module.exports = router;
