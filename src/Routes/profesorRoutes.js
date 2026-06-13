const express = require('express');
const router = express.Router();

const profesorController = require('../Controllers/profesorController');
const perfilController = require('../Controllers/perfilController');
const profesorMiddleware = require('../Middlewares/profesorMiddleware');

router.use(profesorMiddleware);

router.get('/dashboard', profesorController.dashboard);

router.get('/mis-practicas', profesorController.misPracticas);

router.get('/practicas/crear', profesorController.crearPracticaView);
router.post('/practicas/crear', profesorController.crearPractica);

router.get('/practicas/:id/editar', profesorController.editarPracticaView);
router.put('/practicas/:id', profesorController.editarPractica);
router.delete('/practicas/:id', profesorController.eliminarPractica);

router.get('/perfil', perfilController.editarView);
router.put('/perfil', perfilController.actualizar);

module.exports = router;
