const {
  Profesor,
  Practica,
  Materia,
  Carrera,
  Dia,
  PracticaDia,
  Inscripcion,
  sequelize
} = require('../Data/models');

function validarPeriodo({
  fechaInicio,
  fechaFin,
  horarioInicio,
  horarioFin
}) {
  if (fechaFin && fechaFin < fechaInicio) {
    return 'La fecha de finalización no puede ser anterior a la fecha de inicio.';
  }

  if (horarioFin <= horarioInicio) {
    return 'El horario de finalización debe ser posterior al horario de inicio.';
  }

  return null;
}

async function buscarProfesor(userId) {
  return Profesor.findOne({
    where: { usuarioId: userId }
  });
}

async function cargarMateriasProfesor(profesor) {
  if (!profesor || !profesor.materiaId || !profesor.carreraId) {
    return [];
  }

  return Materia.findAll({
    where: {
      id: profesor.materiaId,
      carreraId: profesor.carreraId,
      estado: 'ACTIVA'
    },
    include: [{ model: Carrera, as: 'carrera' }]
  });
}

async function datosFormulario(profesor) {
  const [materias, dias] = await Promise.all([
    cargarMateriasProfesor(profesor),
    Dia.findAll({ order: [['id', 'ASC']] })
  ]);

  return { materias, dias };
}

const profesorController = {
  dashboard: (req, res) => {
    res.render('profesor/dashboard');
  },

  misPracticas: async (req, res) => {
    const profesor = await buscarProfesor(req.session.user.id);

    const practicas = await Practica.findAll({
      where: { profesorId: profesor.id },
      include: [
        {
          model: Materia,
          as: 'materia',
          include: [{ model: Carrera, as: 'carrera' }]
        }
      ],
      order: [['fechaInicio', 'ASC']]
    });

    res.render('profesor/misPracticas', { practicas });
  },

  crearPracticaView: async (req, res) => {
    const profesor = await buscarProfesor(req.session.user.id);
    const { materias, dias } = await datosFormulario(profesor);

    res.render('profesor/practicas/crear', {
      materias,
      dias,
      formData: {},
      error: materias.length === 0
        ? 'Antes de crear una práctica, completá tu carrera y materia en Mi perfil.'
        : null
    });
  },

  crearPractica: async (req, res) => {
    try {
      const {
        titulo,
        descripcion,
        lugar,
        fechaInicio,
        fechaFin,
        horarioInicio,
        horarioFin,
        cupo,
        materiaId,
        observaciones,
        dias
      } = req.body;

      const profesor = await buscarProfesor(req.session.user.id);
      const datos = await datosFormulario(profesor);
      const errorPeriodo = validarPeriodo({
        fechaInicio,
        fechaFin,
        horarioInicio,
        horarioFin
      });

      if (!profesor) {
        return res.status(403).send('No existe perfil de profesor para este usuario');
      }

      if (Number(materiaId) !== profesor.materiaId || datos.materias.length === 0) {
        return res.render('profesor/practicas/crear', {
          ...datos,
          formData: req.body,
          error: 'Solo podés crear prácticas para la materia asignada en tu perfil.'
        });
      }

      if (errorPeriodo) {
        return res.render('profesor/practicas/crear', {
          ...datos,
          formData: req.body,
          error: errorPeriodo
        });
      }

      const diasSeleccionados = Array.isArray(dias) ? dias : dias ? [dias] : [];

      await sequelize.transaction(async (transaction) => {
        const practica = await Practica.create({
          titulo,
          descripcion,
          lugar,
          fechaInicio,
          fechaFin: fechaFin || null,
          horarioInicio,
          horarioFin,
          cupo,
          materiaId,
          profesorId: profesor.id,
          observaciones,
          estado: 'ACTIVA'
        }, { transaction });

        if (diasSeleccionados.length > 0) {
          await PracticaDia.bulkCreate(
            diasSeleccionados.map(diaId => ({
              practicaId: practica.id,
              diaId
            })),
            { transaction }
          );
        }
      });

      return res.redirect('/profesor/mis-practicas');
    } catch (error) {
      console.error(error);
      return res.status(500).send('Error al crear práctica');
    }
  },

  editarPracticaView: async (req, res) => {
    const profesor = await buscarProfesor(req.session.user.id);

    const practica = await Practica.findOne({
      where: {
        id: req.params.id,
        profesorId: profesor.id
      },
      include: [{ model: PracticaDia, as: 'dias' }]
    });

    if (!practica) {
      return res.status(404).send('Práctica no encontrada');
    }

    const { materias, dias } = await datosFormulario(profesor);

    return res.render('profesor/practicas/editar', {
      practica,
      materias,
      dias,
      diasSeleccionados: practica.dias.map(item => item.diaId),
      error: materias.length === 0
        ? 'Completá tu carrera y materia en Mi perfil antes de editar.'
        : null
    });
  },

  editarPractica: async (req, res) => {
    try {
      const {
        titulo,
        descripcion,
        lugar,
        fechaInicio,
        fechaFin,
        horarioInicio,
        horarioFin,
        cupo,
        materiaId,
        estado,
        observaciones,
        dias
      } = req.body;

      const profesor = await buscarProfesor(req.session.user.id);

      const practica = await Practica.findOne({
        where: {
          id: req.params.id,
          profesorId: profesor.id
        },
        include: [{ model: PracticaDia, as: 'dias' }]
      });

      if (!practica) {
        return res.status(404).send('Práctica no encontrada');
      }

      const datos = await datosFormulario(profesor);
      const diasSeleccionados = Array.isArray(dias) ? dias : dias ? [dias] : [];
      const renderError = (mensaje) => res.render('profesor/practicas/editar', {
        ...datos,
        practica: {
          ...practica.get({ plain: true }),
          ...req.body
        },
        diasSeleccionados: diasSeleccionados.map(Number),
        error: mensaje
      });

      if (Number(materiaId) !== profesor.materiaId || datos.materias.length === 0) {
        return renderError('Solo podés asignar la práctica a la materia indicada en tu perfil.');
      }

      const errorPeriodo = validarPeriodo({
        fechaInicio,
        fechaFin,
        horarioInicio,
        horarioFin
      });

      if (errorPeriodo) {
        return renderError(errorPeriodo);
      }

      const inscripcionesActivas = await Inscripcion.count({
        where: {
          practicaId: practica.id,
          estado: 'ACTIVA'
        }
      });

      if (Number(cupo) < inscripcionesActivas) {
        return renderError(
          `El cupo no puede ser menor a las ${inscripcionesActivas} inscripciones activas.`
        );
      }

      await sequelize.transaction(async (transaction) => {
        await practica.update({
          titulo,
          descripcion,
          lugar,
          fechaInicio,
          fechaFin: fechaFin || null,
          horarioInicio,
          horarioFin,
          cupo,
          materiaId,
          estado,
          observaciones
        }, { transaction });

        await PracticaDia.destroy({
          where: { practicaId: practica.id },
          transaction
        });

        if (diasSeleccionados.length > 0) {
          await PracticaDia.bulkCreate(
            diasSeleccionados.map(diaId => ({
              practicaId: practica.id,
              diaId
            })),
            { transaction }
          );
        }
      });

      return res.redirect('/profesor/mis-practicas');
    } catch (error) {
      console.error(error);
      return res.status(500).send('Error al editar práctica');
    }
  },

  eliminarPractica: async (req, res) => {
    const profesor = await buscarProfesor(req.session.user.id);

    const practica = await Practica.findOne({
      where: {
        id: req.params.id,
        profesorId: profesor.id
      }
    });

    if (!practica) {
      return res.status(404).send('Práctica no encontrada');
    }

    await practica.update({ estado: 'INACTIVA' });

    return res.redirect('/profesor/mis-practicas');
  }
};

module.exports = profesorController;
