const {
  Alumno,
  Practica,
  Materia,
  Carrera,
  Profesor,
  Usuario,
  Inscripcion
} = require('../Data/models');
const {
  agregarCuposDisponibles
} = require('../Services/cupoService');

const alumnoController = {
  dashboard: (req, res) => {
    res.render('alumno/dashboard');
  },

  practicasDisponibles: async (req, res) => {
    const alumno = await Alumno.findOne({
      where: { usuarioId: req.session.user.id }
    });

    if (!alumno || !alumno.carreraId) {
      return res.redirect('/alumno/perfil?completarCarrera=1');
    }

    const practicas = await Practica.findAll({
      where: { estado: 'ACTIVA' },
      include: [
        {
          model: Materia,
          as: 'materia',
          where: {
            carreraId: alumno.carreraId,
            estado: 'ACTIVA'
          },
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

    return res.render('alumno/practicasDisponibles', {
      practicas,
      mensaje: req.query.mensaje || null
    });
  },

  misInscripciones: async (req, res) => {
    const alumno = await Alumno.findOne({
      where: { usuarioId: req.session.user.id }
    });

    const inscripciones = await Inscripcion.findAll({
      where: { alumnoId: alumno.id },
      include: [
        {
          model: Practica,
          as: 'practica',
          include: [
            {
              model: Materia,
              as: 'materia',
              include: [{ model: Carrera, as: 'carrera' }]
            }
          ]
        }
      ],
      order: [['fechaInscripcion', 'DESC']]
    });

    res.render('alumno/misInscripciones', {
      inscripciones,
      mensaje: req.query.mensaje || null
    });
  }
};

module.exports = alumnoController;
