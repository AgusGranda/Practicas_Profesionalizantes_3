const express = require('express');
const router = express.Router();

const practicaController = require('../Controllers/practicaController');

router.get('/', practicaController.listado);

router.get('/cupos', practicaController.cupos);

router.get('/:id', practicaController.detalle);

module.exports = router;
