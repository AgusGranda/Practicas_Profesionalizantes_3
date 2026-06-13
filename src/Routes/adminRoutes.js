const express = require('express');
const router = express.Router();

const adminController = require('../Controllers/adminController');
const adminMiddleware = require('../Middlewares/adminMiddleware');

router.use(adminMiddleware);

router.get('/dashboard', adminController.dashboard);

router.get('/carreras', adminController.listadoCarreras);
router.get('/carreras/crear', adminController.crearCarreraView);
router.post('/carreras/crear', adminController.crearCarrera);
router.get('/carreras/:id/editar', adminController.editarCarreraView);
router.put('/carreras/:id', adminController.editarCarrera);
router.delete('/carreras/:id', adminController.eliminarCarrera);

router.get('/materias', adminController.listadoMaterias);
router.get('/materias/crear', adminController.crearMateriaView);
router.post('/materias/crear', adminController.crearMateria);
router.get('/materias/:id/editar', adminController.editarMateriaView);
router.put('/materias/:id', adminController.editarMateria);
router.delete('/materias/:id', adminController.eliminarMateria);

router.get('/profesores-pendientes', adminController.profesoresPendientes);
router.post('/profesores/:id/aprobar', adminController.aprobarProfesor);
router.post('/profesores/:id/rechazar', adminController.rechazarProfesor);

module.exports = router;
