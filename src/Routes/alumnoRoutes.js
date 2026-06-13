const express = require('express');
const router = express.Router();

const alumnoController = require('../Controllers/alumnoController');
const perfilController = require('../Controllers/perfilController');
const alumnoMiddleware = require('../Middlewares/alumnoMiddleware');

router.use(alumnoMiddleware);

router.get('/dashboard', alumnoController.dashboard);

router.get('/practicas-disponibles', alumnoController.practicasDisponibles);

router.get('/mis-inscripciones', alumnoController.misInscripciones);

router.get('/perfil', perfilController.editarView);
router.put('/perfil', perfilController.actualizar);

module.exports = router;
