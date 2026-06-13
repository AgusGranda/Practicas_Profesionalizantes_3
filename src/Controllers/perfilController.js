const { Op } = require('sequelize');
const {
  Usuario,
  Profesor,
  Alumno,
  Carrera,
  Materia,
  sequelize
} = require('../Data/models');
const {
  verifyPassword
} = require('../Services/passwordService');

function profileBaseFor(user) {
  return user.rol === 'PROFESOR' ? '/profesor' : '/alumno';
}

function profileValues(usuario, body = {}) {
  return {
    id: usuario.id,
    dni: body.dni !== undefined ? body.dni : usuario.dni,
    apellido: body.apellido !== undefined ? body.apellido : usuario.apellido,
    nombre: body.nombre !== undefined ? body.nombre : usuario.nombre,
    email: body.email !== undefined ? body.email : usuario.email,
    celular: body.celular !== undefined ? body.celular : usuario.celular,
    fechaNacimiento: body.fechaNacimiento !== undefined
      ? body.fechaNacimiento
      : usuario.fechaNacimiento,
    genero: body.genero !== undefined ? body.genero : usuario.genero
  };
}

async function renderProfile(res, req, usuario, options = {}) {
  let profesor = null;
  let alumno = null;
  let carreras = [];
  let materias = [];

  if (['PROFESOR', 'ALUMNO'].includes(req.session.user.rol)) {
    carreras = await Carrera.findAll({
      where: { estado: 'ACTIVA' },
      order: [['nombre', 'ASC']]
    });
  }

  if (req.session.user.rol === 'PROFESOR') {
    profesor = await Profesor.findOne({
      where: { usuarioId: usuario.id }
    });

    materias = await Materia.findAll({
      where: { estado: 'ACTIVA' },
      order: [['nombre', 'ASC']]
    });

    if (profesor && options.body) {
      profesor = {
        ...profesor.get({ plain: true }),
        carreraId: options.body.carreraId !== undefined
          ? options.body.carreraId
          : profesor.carreraId,
        materiaId: options.body.materiaId !== undefined
          ? options.body.materiaId
          : profesor.materiaId
      };
    }
  } else if (req.session.user.rol === 'ALUMNO') {
    alumno = await Alumno.findOne({
      where: { usuarioId: usuario.id }
    });

    if (alumno && options.body) {
      alumno = {
        ...alumno.get({ plain: true }),
        carreraId: options.body.carreraId !== undefined
          ? options.body.carreraId
          : alumno.carreraId
      };
    }
  }

  return res.render('perfil/editar', {
    usuario: profileValues(usuario, options.body),
    profesor,
    alumno,
    carreras,
    materias,
    profileBase: profileBaseFor(req.session.user),
    error: options.error || null,
    success: options.success || false
  });
}

const perfilController = {
  editarView: async (req, res) => {
    try {
      const usuario = await Usuario.findByPk(req.session.user.id);

      if (!usuario) {
        return res.status(404).send('Usuario no encontrado');
      }

      return renderProfile(res, req, usuario, {
        success: req.query.actualizado === '1',
        error: req.query.completarCarrera === '1'
          ? 'Seleccioná tu carrera para consultar las prácticas disponibles.'
          : null
      });
    } catch (error) {
      console.error(error);
      return res.status(500).send('Error al cargar el perfil');
    }
  },

  actualizar: async (req, res) => {
    try {
      const usuario = await Usuario.findByPk(req.session.user.id);

      if (!usuario) {
        return res.status(404).send('Usuario no encontrado');
      }

      const dni = String(req.body.dni || '').trim();
      const apellido = String(req.body.apellido || '').trim();
      const nombre = String(req.body.nombre || '').trim();
      const email = String(req.body.email || '').trim().toLowerCase();
      const celular = String(req.body.celular || '').trim() || null;
      const fechaNacimiento = req.body.fechaNacimiento || null;
      const genero = String(req.body.genero || '').trim().toUpperCase() || null;
      const passwordActual = String(req.body.passwordActual || '');
      const passwordNueva = String(req.body.passwordNueva || '');
      const passwordConfirmacion = String(req.body.passwordConfirmacion || '');
      const carreraId = Number(req.body.carreraId);
      const materiaId = Number(req.body.materiaId);
      const esProfesor = req.session.user.rol === 'PROFESOR';
      const esAlumno = req.session.user.rol === 'ALUMNO';

      const body = {
        dni,
        apellido,
        nombre,
        email,
        celular,
        fechaNacimiento,
        genero,
        carreraId: req.body.carreraId,
        materiaId: req.body.materiaId
      };

      if (!dni || !apellido || !nombre || !email) {
        return renderProfile(res, req, usuario, {
          body,
          error: 'DNI, nombre, apellido y correo electrónico son obligatorios.'
        });
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return renderProfile(res, req, usuario, {
          body,
          error: 'Ingresá un correo electrónico válido.'
        });
      }

      let profesor = null;
      let alumno = null;

      const carrera = await Carrera.findOne({
        where: {
          id: carreraId,
          estado: 'ACTIVA'
        }
      });

      if ((esProfesor || esAlumno) && !carrera) {
        return renderProfile(res, req, usuario, {
          body,
          error: 'Seleccioná una carrera válida.'
        });
      }

      if (esProfesor) {
        profesor = await Profesor.findOne({
          where: { usuarioId: usuario.id }
        });

        const materia = await Materia.findOne({
          where: {
            id: materiaId,
            carreraId,
            estado: 'ACTIVA'
          }
        });

        if (!profesor || !carreraId || !materia) {
          return renderProfile(res, req, usuario, {
            body,
            error: 'Seleccioná una carrera y una materia válidas.'
          });
        }
      } else if (esAlumno) {
        alumno = await Alumno.findOne({
          where: { usuarioId: usuario.id }
        });

        if (!alumno) {
          return res.status(404).send('Perfil de alumno no encontrado');
        }
      }

      const usuarioDuplicado = await Usuario.findOne({
        where: {
          id: { [Op.ne]: usuario.id },
          [Op.or]: [{ dni }, { email }]
        }
      });

      if (usuarioDuplicado) {
        return renderProfile(res, req, usuario, {
          body,
          error: usuarioDuplicado.dni === dni
            ? 'El DNI ingresado ya pertenece a otro usuario.'
            : 'El correo electrónico ingresado ya pertenece a otro usuario.'
        });
      }

      if (passwordNueva || passwordConfirmacion || passwordActual) {
        if (!passwordActual) {
          return renderProfile(res, req, usuario, {
            body,
            error: 'Ingresá tu contraseña actual para cambiarla.'
          });
        }

        const passwordValida = await verifyPassword(
          passwordActual,
          usuario.password
        );

        if (!passwordValida) {
          return renderProfile(res, req, usuario, {
            body,
            error: 'La contraseña actual no es correcta.'
          });
        }

        if (passwordNueva.length < 8) {
          return renderProfile(res, req, usuario, {
            body,
            error: 'La nueva contraseña debe tener al menos 8 caracteres.'
          });
        }

        if (passwordNueva !== passwordConfirmacion) {
          return renderProfile(res, req, usuario, {
            body,
            error: 'La confirmación no coincide con la nueva contraseña.'
          });
        }

        usuario.password = passwordNueva;
      }

      usuario.dni = dni;
      usuario.apellido = apellido;
      usuario.nombre = nombre;
      usuario.email = email;
      usuario.celular = celular;
      usuario.fechaNacimiento = fechaNacimiento;
      usuario.genero = genero;

      await sequelize.transaction(async (transaction) => {
        await usuario.save({ transaction });

        if (profesor) {
          profesor.carreraId = carreraId;
          profesor.materiaId = materiaId;
          await profesor.save({ transaction });
        }

        if (alumno) {
          alumno.carreraId = carreraId;
          await alumno.save({ transaction });
        }
      });

      req.session.user.nombre = usuario.nombre;
      req.session.user.apellido = usuario.apellido;
      req.session.user.email = usuario.email;

      return res.redirect(`${profileBaseFor(req.session.user)}/perfil?actualizado=1`);
    } catch (error) {
      console.error(error);

      if (error.name === 'SequelizeUniqueConstraintError') {
        const usuario = await Usuario.findByPk(req.session.user.id);

        return renderProfile(res, req, usuario, {
          body: req.body,
          error: 'El DNI o correo electrónico ya está registrado.'
        });
      }

      return res.status(500).send('Error al actualizar el perfil');
    }
  }
};

module.exports = perfilController;
