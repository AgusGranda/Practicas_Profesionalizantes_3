const {
  Profesor,
  ProfesorMateria,
  Usuario,
  Alumno,
  Practica,
  Materia,
  Carrera,
  Dia,
  PracticaDia,
  Inscripcion,
  sequelize
} = require('../Data/models');
const {
  generarComprobantePdf
} = require('../Services/comprobantePdfService');
const {
  enviarInscripcionAceptada,
  enviarInscripcionRechazada
} = require('../Services/mailService');

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
  if (!profesor) {
    return [];
  }

  const relaciones = await ProfesorMateria.findAll({
    where: { profesorId: profesor.id }
  });
  const materiasIds = relaciones.map(item => item.materiaId);

  if (materiasIds.length === 0 && profesor.materiaId) {
    materiasIds.push(profesor.materiaId);
  }

  if (materiasIds.length === 0) {
    return [];
  }

  return Materia.findAll({
    where: {
      id: materiasIds,
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

function includeSolicitud() {
  return [
    {
      model: Alumno,
      as: 'alumno',
      include: [{ model: Usuario, as: 'usuario' }]
    },
    {
      model: Practica,
      as: 'practica',
      include: [
        {
          model: Materia,
          as: 'materia',
          include: [{ model: Carrera, as: 'carrera' }]
        },
        {
          model: Profesor,
          as: 'profesor',
          include: [{ model: Usuario, as: 'usuario' }]
        }
      ]
    }
  ];
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

  solicitudes: async (req, res) => {
    const profesor = await buscarProfesor(req.session.user.id);

    const solicitudes = await Inscripcion.findAll({
      where: { estado: 'PENDIENTE' },
      include: [
        {
          model: Alumno,
          as: 'alumno',
          include: [{ model: Usuario, as: 'usuario' }]
        },
        {
          model: Practica,
          as: 'practica',
          where: { profesorId: profesor.id },
          include: [{
            model: Materia,
            as: 'materia',
            include: [{ model: Carrera, as: 'carrera' }]
          }]
        }
      ],
      order: [['fechaInscripcion', 'ASC']]
    });

    return res.render('profesor/solicitudes', {
      solicitudes,
      mensaje: req.query.mensaje || null
    });
  },

  aprobarSolicitud: async (req, res) => {
    try {
      const profesor = await buscarProfesor(req.session.user.id);

      const resultado = await sequelize.transaction(async (transaction) => {
        const inscripcion = await Inscripcion.findByPk(req.params.id, {
          transaction,
          lock: transaction.LOCK.UPDATE
        });

        if (!inscripcion || inscripcion.estado !== 'PENDIENTE') {
          return 'no_disponible';
        }

        const practica = await Practica.findByPk(inscripcion.practicaId, {
          transaction,
          lock: transaction.LOCK.UPDATE
        });

        if (!practica || practica.profesorId !== profesor.id) {
          return 'no_autorizado';
        }

        const inscripcionesActivas = await Inscripcion.count({
          where: {
            practicaId: practica.id,
            estado: 'ACTIVA'
          },
          transaction
        });

        if (inscripcionesActivas >= practica.cupo) {
          return 'sin_cupo';
        }

        await inscripcion.update({
          estado: 'ACTIVA',
          fechaResolucion: new Date()
        }, { transaction });

        return 'aceptada';
      });

      if (resultado !== 'aceptada') {
        return res.redirect(`/profesor/solicitudes?mensaje=${resultado}`);
      }

      const inscripcion = await Inscripcion.findByPk(req.params.id, {
        include: includeSolicitud()
      });
      let mailEnviado = true;

      try {
        const pdf = await generarComprobantePdf(inscripcion);
        await enviarInscripcionAceptada({ inscripcion, pdf });
        await inscripcion.update({ certificadoEnviado: true });
      } catch (mailError) {
        console.error('No se pudo enviar el comprobante al alumno:', mailError);
        mailEnviado = false;
      }

      return res.redirect(
        `/profesor/solicitudes?mensaje=${mailEnviado ? 'aceptada' : 'aceptada-mail-error'}`
      );
    } catch (error) {
      console.error(error);
      return res.redirect('/profesor/solicitudes?mensaje=error');
    }
  },

  rechazarSolicitud: async (req, res) => {
    try {
      const profesor = await buscarProfesor(req.session.user.id);
      const inscripcion = await Inscripcion.findByPk(req.params.id, {
        include: [{
          model: Practica,
          as: 'practica',
          where: { profesorId: profesor.id }
        }]
      });

      if (!inscripcion || inscripcion.estado !== 'PENDIENTE') {
        return res.redirect('/profesor/solicitudes?mensaje=no-disponible');
      }

      await inscripcion.update({
        estado: 'RECHAZADA',
        fechaResolucion: new Date()
      });

      const inscripcionCompleta = await Inscripcion.findByPk(inscripcion.id, {
        include: includeSolicitud()
      });

      try {
        await enviarInscripcionRechazada({
          inscripcion: inscripcionCompleta
        });
      } catch (mailError) {
        console.error('No se pudo avisar el rechazo al alumno:', mailError);
      }

      return res.redirect('/profesor/solicitudes?mensaje=rechazada');
    } catch (error) {
      console.error(error);
      return res.redirect('/profesor/solicitudes?mensaje=error');
    }
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

      const materiaPermitida = datos.materias.some(
        materia => materia.id === Number(materiaId)
      );

      if (!materiaPermitida) {
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

      const materiaPermitida = datos.materias.some(
        materia => materia.id === Number(materiaId)
      );

      if (!materiaPermitida) {
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
