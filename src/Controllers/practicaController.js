const {
  Practica,
  Materia,
  Carrera,
  Profesor,
  Usuario,
  PracticaDia,
  Dia,
  Inscripcion,
  Alumno
} = require('../Data/models');
const {
  agregarCuposDisponibles
} = require('../Services/cupoService');

async function alumnoDeSesion(req) {
  if (!req.session.user || req.session.user.rol !== 'ALUMNO') {
    return null;
  }

  return Alumno.findOne({
    where: { usuarioId: req.session.user.id }
  });
}

const practicaController = {
  cupos: async (req, res) => {
    try {
      const alumno = await alumnoDeSesion(req);

      if (req.session.user && req.session.user.rol === 'ALUMNO' && !alumno?.carreraId) {
        return res.json([]);
      }

      const include = [{
        model: Inscripcion,
        as: 'inscripciones',
        attributes: ['id'],
        where: { estado: 'ACTIVA' },
        required: false
      }];

      if (alumno) {
        include.push({
          model: Materia,
          as: 'materia',
          attributes: [],
          where: { carreraId: alumno.carreraId },
          required: true
        });
      }

      const practicas = await Practica.findAll({
        where: { estado: 'ACTIVA' },
        attributes: ['id', 'cupo'],
        include
      });

      agregarCuposDisponibles(practicas);

      return res.json(practicas.map(practica => ({
        id: practica.id,
        disponibles: practica.getDataValue('cuposDisponibles'),
        total: practica.cupo
      })));
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'No se pudieron consultar los cupos' });
    }
  },

  listado: async (req, res) => {
    const alumno = await alumnoDeSesion(req);

    if (req.session.user && req.session.user.rol === 'ALUMNO' && !alumno?.carreraId) {
      return res.redirect('/alumno/perfil?completarCarrera=1');
    }

    const practicas = await Practica.findAll({
      where: { estado: 'ACTIVA' },
      include: [
        {
          model: Materia,
          as: 'materia',
          where: alumno ? { carreraId: alumno.carreraId } : undefined,
          include: [{ model: Carrera, as: 'carrera' }]
        },
        {
          model: Profesor,
          as: 'profesor',
          include: [{ model: Usuario, as: 'usuario' }]
        },
        {
          model: Inscripcion,
          as: 'inscripciones',
          attributes: ['id'],
          where: { estado: 'ACTIVA' },
          required: false
        }
      ],
      order: [['fechaInicio', 'ASC']]
    });

    agregarCuposDisponibles(practicas);

    res.render('practicas/listado', { practicas });
  },

  detalle: async (req, res) => {
    const practica = await Practica.findByPk(req.params.id, {
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
        },
        {
          model: PracticaDia,
          as: 'dias',
          include: [{ model: Dia, as: 'dia' }]
        },
        {
          model: Inscripcion,
          as: 'inscripciones',
          attributes: ['id', 'alumnoId'],
          where: { estado: 'ACTIVA' },
          required: false
        }
      ]
    });

    if (!practica) {
      return res.status(404).send('Práctica no encontrada');
    }

    agregarCuposDisponibles(practica);

    let estaInscripto = false;

    if (req.session.user && req.session.user.rol === 'ALUMNO') {
      const alumno = await alumnoDeSesion(req);

      if (!alumno?.carreraId) {
        return res.redirect('/alumno/perfil?completarCarrera=1');
      }

      if (practica.materia.carreraId !== alumno.carreraId) {
        return res.redirect(
          '/alumno/practicas-disponibles?mensaje=carrera-no-corresponde'
        );
      }

      estaInscripto = Boolean(await Inscripcion.findOne({
        where: {
          practicaId: practica.id,
          alumnoId: alumno.id,
          estado: ['PENDIENTE', 'ACTIVA']
        }
      }));
    }

    res.render('practicas/detalle', {
      practica,
      estaInscripto,
      mensaje: req.query.mensaje || null
    });
  }
};

module.exports = practicaController;
