const express = require('express');
const router = express.Router();

const inscripcionController = require('../Controllers/inscripcionController');
const alumnoMiddleware = require('../Middlewares/alumnoMiddleware');

router.use(alumnoMiddleware);

router.post('/practica/:practicaId', inscripcionController.inscribirse);

router.get('/:id/comprobante', inscripcionController.descargarComprobante);

router.delete('/:id', inscripcionController.cancelar);

module.exports = router;
