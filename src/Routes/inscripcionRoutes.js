const express = require('express');
const router = express.Router();

const inscripcionController = require('../Controllers/inscripcionController');

router.get('/', inscripcionController.index);
router.get('/comprobante/:id/pdf', inscripcionController.comprobantePdf);
router.get('/comprobante/:id', inscripcionController.comprobante);
router.get('/:grupoId', inscripcionController.form);
router.post('/:grupoId', inscripcionController.create);

module.exports = router;
