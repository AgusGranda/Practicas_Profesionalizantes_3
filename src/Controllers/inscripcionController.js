const {
  Alumno,
  Usuario,
  Inscripcion,
  Practica,
  Materia,
  Carrera,
  Profesor,
  sequelize
} = require('../Data/models');
const {
  generarComprobantePdf
} = require('../Services/comprobantePdfService');

const inscripcionController = {
  inscribirse: async (req, res) => {
    try {
      const alumno = await Alumno.findOne({
        where: { usuarioId: req.session.user.id }
      });

      if (!alumno) {
        return res.status(403).send('Solo los alumnos pueden inscribirse');
      }

      if (!alumno.carreraId) {
        return res.redirect('/alumno/perfil?completarCarrera=1');
      }

      const resultado = await sequelize.transaction(async (transaction) => {
        const practica = await Practica.findByPk(req.params.practicaId, {
          include: [{
            model: Materia,
            as: 'materia',
            attributes: ['carreraId']
          }],
          transaction,
          lock: transaction.LOCK.UPDATE
        });

        if (!practica || practica.estado !== 'ACTIVA') {
          return 'no_disponible';
        }

        if (practica.materia.carreraId !== alumno.carreraId) {
          return 'carrera_no_corresponde';
        }

        const yaInscripto = await Inscripcion.findOne({
          where: {
            alumnoId: alumno.id,
            practicaId: practica.id
          },
          transaction
        });

        if (yaInscripto && yaInscripto.estado === 'ACTIVA') {
          return 'ya_inscripto';
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

        if (yaInscripto) {
          await yaInscripto.update({
            estado: 'ACTIVA',
            fechaInscripcion: new Date()
          }, { transaction });
        } else {
          await Inscripcion.create({
            alumnoId: alumno.id,
            practicaId: practica.id,
            estado: 'ACTIVA',
            certificadoEnviado: false
          }, { transaction });
        }

        return 'inscripto';
      });

      const mensajes = {
        ya_inscripto: 'ya-inscripto',
        sin_cupo: 'sin-cupo',
        no_disponible: 'no-disponible',
        carrera_no_corresponde: 'carrera-no-corresponde'
      };

      if (resultado !== 'inscripto') {
        if (resultado === 'carrera_no_corresponde') {
          return res.redirect(
            '/alumno/practicas-disponibles?mensaje=carrera-no-corresponde'
          );
        }

        return res.redirect(
          `/practicas/${req.params.practicaId}?mensaje=${mensajes[resultado]}`
        );
      }

      return res.redirect('/alumno/mis-inscripciones?mensaje=inscripcion-ok');
    } catch (error) {
      console.error(error);
      return res.redirect(
        `/practicas/${req.params.practicaId}?mensaje=error-inscripcion`
      );
    }
  },

  cancelar: async (req, res) => {
    const alumno = await Alumno.findOne({
      where: { usuarioId: req.session.user.id }
    });

    if (!alumno) {
      return res.status(403).send('Solo los alumnos pueden cancelar inscripciones');
    }

    await Inscripcion.update(
      { estado: 'CANCELADA' },
      {
        where: {
          id: req.params.id,
          alumnoId: alumno.id
        }
      }
    );

    return res.redirect('/alumno/mis-inscripciones?mensaje=cancelacion-ok');
  },

  descargarComprobante: async (req, res) => {
    try {
      const alumno = await Alumno.findOne({
        where: { usuarioId: req.session.user.id }
      });

      const inscripcion = await Inscripcion.findOne({
        where: {
          id: req.params.id,
          alumnoId: alumno.id
        },
        include: [
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
        ]
      });

      if (!inscripcion) {
        return res.status(404).send('Inscripción no encontrada');
      }

      const pdf = await generarComprobantePdf(inscripcion);
      const filename = `comprobante-inscripcion-${inscripcion.id}.pdf`;

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${filename}"`
      );
      res.setHeader('Content-Length', pdf.length);

      return res.send(pdf);
    } catch (error) {
      console.error(error);
      return res.status(500).send('No se pudo generar el comprobante');
    }
  }
};

module.exports = inscripcionController;
