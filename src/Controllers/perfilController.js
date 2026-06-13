const { Op } = require('sequelize');
const {
  Usuario,
  Profesor,
  ProfesorCarrera,
  ProfesorMateria,
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

function normalizeIds(value) {
  const values = Array.isArray(value) ? value : value ? [value] : [];
  return [...new Set(values.map(Number).filter(Number.isInteger))];
}

function profileValues(usuario, body = {}) {
  const identidadEditable = body.identidadEditable !== false;

  return {
    id: usuario.id,
    dni: identidadEditable && body.dni !== undefined ? body.dni : usuario.dni,
    apellido: identidadEditable && body.apellido !== undefined
      ? body.apellido
      : usuario.apellido,
    nombre: identidadEditable && body.nombre !== undefined
      ? body.nombre
      : usuario.nombre,
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
  let carrerasSeleccionadas = [];
  let materiasSeleccionadas = [];

  if (req.session.user.rol === 'PROFESOR') {
    profesor = await Profesor.findOne({
      where: { usuarioId: usuario.id }
    });

    [carreras, materias] = await Promise.all([
      Carrera.findAll({
        where: { estado: 'ACTIVA' },
        order: [['nombre', 'ASC']]
      }),
      Materia.findAll({
        where: { estado: 'ACTIVA' },
        include: [{ model: Carrera, as: 'carrera' }],
        order: [['nombre', 'ASC']]
      })
    ]);

    if (options.body) {
      carrerasSeleccionadas = normalizeIds(options.body.carreras);
      materiasSeleccionadas = normalizeIds(options.body.materias);
    } else if (profesor) {
      const [relacionesCarreras, relacionesMaterias] = await Promise.all([
        ProfesorCarrera.findAll({ where: { profesorId: profesor.id } }),
        ProfesorMateria.findAll({ where: { profesorId: profesor.id } })
      ]);

      carrerasSeleccionadas = relacionesCarreras.map(item => item.carreraId);
      materiasSeleccionadas = relacionesMaterias.map(item => item.materiaId);

      if (carrerasSeleccionadas.length === 0 && profesor.carreraId) {
        carrerasSeleccionadas.push(profesor.carreraId);
      }

      if (materiasSeleccionadas.length === 0 && profesor.materiaId) {
        materiasSeleccionadas.push(profesor.materiaId);
      }
    }
  } else if (req.session.user.rol === 'ALUMNO') {
    alumno = await Alumno.findOne({
      where: { usuarioId: usuario.id },
      include: [{ model: Carrera, as: 'carrera' }]
    });
  }

  return res.render('perfil/editar', {
    usuario: profileValues(usuario, {
      ...(options.body || {}),
      identidadEditable: req.session.user.rol !== 'ALUMNO'
    }),
    profesor,
    alumno,
    carreras,
    materias,
    carrerasSeleccionadas,
    materiasSeleccionadas,
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
        success: req.query.actualizado === '1'
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

      const esAlumno = req.session.user.rol === 'ALUMNO';
      const dni = esAlumno
        ? usuario.dni
        : String(req.body.dni || '').trim();
      const apellido = esAlumno
        ? usuario.apellido
        : String(req.body.apellido || '').trim();
      const nombre = esAlumno
        ? usuario.nombre
        : String(req.body.nombre || '').trim();
      const email = String(req.body.email || '').trim().toLowerCase();
      const celular = String(req.body.celular || '').trim() || null;
      const fechaNacimiento = req.body.fechaNacimiento || null;
      const genero = String(req.body.genero || '').trim().toUpperCase() || null;
      const passwordActual = String(req.body.passwordActual || '');
      const passwordNueva = String(req.body.passwordNueva || '');
      const passwordConfirmacion = String(req.body.passwordConfirmacion || '');
      const esProfesor = req.session.user.rol === 'PROFESOR';
      const carrerasIds = normalizeIds(req.body.carreras);
      const materiasIds = normalizeIds(req.body.materias);

      const body = {
        ...req.body,
        dni,
        apellido,
        nombre,
        email,
        celular,
        fechaNacimiento,
        genero
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

      if (esProfesor) {
        profesor = await Profesor.findOne({
          where: { usuarioId: usuario.id }
        });

        if (!profesor || carrerasIds.length === 0 || materiasIds.length === 0) {
          return renderProfile(res, req, usuario, {
            body,
            error: 'Seleccioná al menos una carrera y una materia.'
          });
        }

        const [carrerasValidas, materiasValidas] = await Promise.all([
          Carrera.findAll({
            where: {
              id: carrerasIds,
              estado: 'ACTIVA'
            }
          }),
          Materia.findAll({
            where: {
              id: materiasIds,
              estado: 'ACTIVA'
            }
          })
        ]);

        const materiasCompatibles = materiasValidas.every(
          materia => carrerasIds.includes(materia.carreraId)
        );

        if (
          carrerasValidas.length !== carrerasIds.length ||
          materiasValidas.length !== materiasIds.length ||
          !materiasCompatibles
        ) {
          return renderProfile(res, req, usuario, {
            body,
            error: 'Las materias seleccionadas deben pertenecer a las carreras elegidas.'
          });
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
          await Promise.all([
            ProfesorCarrera.destroy({
              where: { profesorId: profesor.id },
              transaction
            }),
            ProfesorMateria.destroy({
              where: { profesorId: profesor.id },
              transaction
            })
          ]);

          await ProfesorCarrera.bulkCreate(
            carrerasIds.map(carreraId => ({
              profesorId: profesor.id,
              carreraId
            })),
            { transaction }
          );

          await ProfesorMateria.bulkCreate(
            materiasIds.map(materiaId => ({
              profesorId: profesor.id,
              materiaId
            })),
            { transaction }
          );

          profesor.carreraId = carrerasIds[0];
          profesor.materiaId = materiasIds[0];
          await profesor.save({ transaction });
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
