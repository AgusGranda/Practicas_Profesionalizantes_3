const express = require('express');
const router = express.Router();

const adminController = require('../Controllers/adminController');

router.get('/', adminController.index);
router.post('/profesores/:id/aprobar', adminController.aprobarProfesor);

module.exports = router;
