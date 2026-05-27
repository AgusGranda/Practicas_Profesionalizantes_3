const express = require('express');
const router = express.Router();

const alumnoController = require('../Controllers/alumnoController');

router.get('/', alumnoController.index);
router.post('/', alumnoController.actualizarPerfil);
router.post('/inscripciones/:id/cancelar', alumnoController.cancelarInscripcion);

module.exports = router;
