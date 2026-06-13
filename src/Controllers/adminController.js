const {
  Usuario,
  Profesor,
  Carrera,
  Materia
} = require('../Data/models');

const adminController = {
  dashboard: (req, res) => {
    res.render('admin/dashboard');
  },

  listadoCarreras: async (req, res) => {
    const carreras = await Carrera.findAll({
      order: [['nombre', 'ASC']]
    });

    res.render('admin/carreras/listado', { carreras });
  },

  crearCarreraView: (req, res) => {
    res.render('admin/carreras/crear', { error: null });
  },

  crearCarrera: async (req, res) => {
    try {
      const { nombre, descripcion } = req.body;

      await Carrera.create({
        nombre,
        descripcion,
        estado: 'ACTIVA'
      });

      res.redirect('/admin/carreras');
    } catch (error) {
      console.error(error);
      res.render('admin/carreras/crear', {
        error: 'No se pudo crear la carrera.'
      });
    }
  },

  editarCarreraView: async (req, res) => {
    const carrera = await Carrera.findByPk(req.params.id);

    if (!carrera) {
      return res.status(404).send('Carrera no encontrada');
    }

    res.render('admin/carreras/editar', { carrera, error: null });
  },

  editarCarrera: async (req, res) => {
    try {
      const { nombre, descripcion, estado } = req.body;

      await Carrera.update(
        { nombre, descripcion, estado },
        { where: { id: req.params.id } }
      );

      res.redirect('/admin/carreras');
    } catch (error) {
      console.error(error);
      res.status(500).send('Error al editar carrera');
    }
  },

  eliminarCarrera: async (req, res) => {
    await Carrera.update(
      { estado: 'INACTIVA' },
      { where: { id: req.params.id } }
    );

    res.redirect('/admin/carreras');
  },

  listadoMaterias: async (req, res) => {
    const materias = await Materia.findAll({
      include: [{ model: Carrera, as: 'carrera' }],
      order: [['nombre', 'ASC']]
    });

    res.render('admin/materias/listado', { materias });
  },

  crearMateriaView: async (req, res) => {
    const carreras = await Carrera.findAll({
      where: { estado: 'ACTIVA' },
      order: [['nombre', 'ASC']]
    });

    res.render('admin/materias/crear', { carreras, error: null });
  },

  crearMateria: async (req, res) => {
    try {
      const { nombre, descripcion, carreraId } = req.body;

      await Materia.create({
        nombre,
        descripcion,
        carreraId,
        estado: 'ACTIVA'
      });

      res.redirect('/admin/materias');
    } catch (error) {
      console.error(error);
      res.status(500).send('Error al crear materia');
    }
  },

  editarMateriaView: async (req, res) => {
    const materia = await Materia.findByPk(req.params.id);
    const carreras = await Carrera.findAll({
      where: { estado: 'ACTIVA' },
      order: [['nombre', 'ASC']]
    });

    if (!materia) {
      return res.status(404).send('Materia no encontrada');
    }

    res.render('admin/materias/editar', {
      materia,
      carreras,
      error: null
    });
  },

  editarMateria: async (req, res) => {
    const { nombre, descripcion, carreraId, estado } = req.body;

    await Materia.update(
      { nombre, descripcion, carreraId, estado },
      { where: { id: req.params.id } }
    );

    res.redirect('/admin/materias');
  },

  eliminarMateria: async (req, res) => {
    await Materia.update(
      { estado: 'INACTIVA' },
      { where: { id: req.params.id } }
    );

    res.redirect('/admin/materias');
  },

  profesoresPendientes: async (req, res) => {
    const profesores = await Profesor.findAll({
      include: [
        {
          model: Usuario,
          as: 'usuario',
          where: { estado: 'PENDIENTE' }
        },
        {
          association: 'carreras',
          include: [{ model: Carrera, as: 'carrera' }]
        },
        {
          association: 'materias',
          include: [{ model: Materia, as: 'materia' }]
        }
      ]
    });

    res.render('admin/profesoresPendientes', {
      profesores,
      error: req.query.error || null
    });
  },

  aprobarProfesor: async (req, res) => {
    const profesor = await Profesor.findByPk(req.params.id);

    if (!profesor) {
      return res.status(404).send('Profesor no encontrado');
    }

    await Usuario.update(
      { estado: 'ACTIVO' },
      { where: { id: profesor.usuarioId } }
    );

    await Profesor.update(
      {
        aprobadoPorAdminId: req.session.user.id,
        fechaAprobacion: new Date()
      },
      { where: { id: profesor.id } }
    );

    res.redirect('/admin/profesores-pendientes');
  },

  rechazarProfesor: async (req, res) => {
    const profesor = await Profesor.findByPk(req.params.id);

    if (!profesor) {
      return res.status(404).send('Profesor no encontrado');
    }

    await Usuario.update(
      { estado: 'RECHAZADO' },
      { where: { id: profesor.usuarioId } }
    );

    res.redirect('/admin/profesores-pendientes');
  }
};

module.exports = adminController;
