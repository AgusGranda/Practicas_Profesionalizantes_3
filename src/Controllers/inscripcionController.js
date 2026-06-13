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
const {
  enviarSolicitudInscripcion
} = require('../Services/mailService');

function appUrl() {
  return process.env.APP_URL || `http://localhost:${process.env.PORT || 3000}`;
}

const inscripcionController = {
  inscribirse: async (req, res) => {
    try {
      const alumno = await Alumno.findOne({
        where: { usuarioId: req.session.user.id },
        include: [{ model: Usuario, as: 'usuario' }]
      });

      if (!alumno) {
        return res.status(403).send('Solo los alumnos pueden inscribirse');
      }

      if (!alumno.carreraId) {
        return res.redirect('/alumno/perfil');
      }

      const resultado = await sequelize.transaction(async (transaction) => {
        const practica = await Practica.findByPk(req.params.practicaId, {
          include: [
            {
              model: Materia,
              as: 'materia',
              attributes: ['carreraId']
            },
            {
              model: Profesor,
              as: 'profesor',
              include: [{ model: Usuario, as: 'usuario' }]
            }
          ],
          transaction,
          lock: transaction.LOCK.UPDATE
        });

        if (!practica || practica.estado !== 'ACTIVA') {
          return { estado: 'no_disponible' };
        }

        if (practica.materia.carreraId !== alumno.carreraId) {
          return { estado: 'carrera_no_corresponde' };
        }

        const solicitudExistente = await Inscripcion.findOne({
          where: {
            alumnoId: alumno.id,
            practicaId: practica.id
          },
          transaction
        });

        if (
          solicitudExistente &&
          ['PENDIENTE', 'ACTIVA'].includes(solicitudExistente.estado)
        ) {
          return { estado: 'ya_inscripto' };
        }

        const inscripcionesActivas = await Inscripcion.count({
          where: {
            practicaId: practica.id,
            estado: 'ACTIVA'
          },
          transaction
        });

        if (inscripcionesActivas >= practica.cupo) {
          return { estado: 'sin_cupo' };
        }

        let inscripcion;

        if (solicitudExistente) {
          inscripcion = await solicitudExistente.update({
            estado: 'PENDIENTE',
            fechaInscripcion: new Date(),
            fechaResolucion: null,
            certificadoEnviado: false
          }, { transaction });
        } else {
          inscripcion = await Inscripcion.create({
            alumnoId: alumno.id,
            practicaId: practica.id,
            estado: 'PENDIENTE',
            certificadoEnviado: false
          }, { transaction });
        }

        return {
          estado: 'pendiente',
          inscripcionId: inscripcion.id,
          practica
        };
      });

      const mensajes = {
        ya_inscripto: 'ya-inscripto',
        sin_cupo: 'sin-cupo',
        no_disponible: 'no-disponible'
      };

      if (resultado.estado === 'carrera_no_corresponde') {
        return res.redirect(
          '/alumno/practicas-disponibles?mensaje=carrera-no-corresponde'
        );
      }

      if (resultado.estado !== 'pendiente') {
        return res.redirect(
          `/practicas/${req.params.practicaId}?mensaje=${mensajes[resultado.estado]}`
        );
      }

      let mailError = false;

      try {
        await enviarSolicitudInscripcion({
          profesor: resultado.practica.profesor.usuario,
          alumno: alumno.usuario,
          practica: resultado.practica,
          panelUrl: `${appUrl()}/profesor/solicitudes`
        });
      } catch (error) {
        console.error('No se pudo avisar al profesor sobre la solicitud:', error);
        mailError = true;
      }

      return res.redirect(
        `/alumno/mis-inscripciones?mensaje=${mailError ? 'solicitud-mail-error' : 'solicitud-enviada'}`
      );
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
      {
        estado: 'CANCELADA',
        fechaResolucion: new Date()
      },
      {
        where: {
          id: req.params.id,
          alumnoId: alumno.id,
          estado: ['PENDIENTE', 'ACTIVA']
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
          alumnoId: alumno.id,
          estado: 'ACTIVA'
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
        return res.status(404).send('Comprobante no disponible');
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
