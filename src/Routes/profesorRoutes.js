const express = require('express');
const router = express.Router();

const profesorController = require('../Controllers/profesorController');

router.get('/registro', profesorController.registro);
router.post('/registro', profesorController.crearRegistro);
router.get('/', profesorController.index);
router.get('/practicas/nueva', profesorController.nuevaPractica);
router.post('/practicas', profesorController.crearPractica);
router.get('/practicas/:id/editar', profesorController.editarPractica);
router.post('/practicas/:id', profesorController.actualizarPractica);
router.post('/practicas/:id/eliminar', profesorController.eliminarPractica);

module.exports = router;
