const {
  Usuario,
  Rol,
  Profesor,
  Alumno,
  Carrera,
  Materia,
  sequelize
} = require('../Data/models');
const {
  hashPassword,
  isPasswordHash,
  verifyPassword
} = require('../Services/passwordService');
const {
  enviarNotificacionNuevoProfesor
} = require('../Services/mailService');

async function renderRegister(res, options = {}) {
  const carreras = await Carrera.findAll({
    where: { estado: 'ACTIVA' },
    order: [['nombre', 'ASC']]
  });

  const materias = await Materia.findAll({
    where: { estado: 'ACTIVA' },
    include: [{ model: Carrera, as: 'carrera' }],
    order: [['nombre', 'ASC']]
  });

  return res.render('auth/register', {
    carreras,
    materias,
    error: options.error || null,
    formData: options.formData || {}
  });
}

const authController = {
  loginView: (req, res) => {
    res.render('auth/login', { error: null });
  },

  login: async (req, res) => {
    try {
      const dni = String(req.body.dni || '').trim();
      const password = String(req.body.password || '');

      const usuario = await Usuario.findOne({
        where: { dni },
        include: [{ model: Rol, as: 'rol' }]
      });

      if (!usuario) {
        return res.render('auth/login', { error: 'Usuario no encontrado.' });
      }

      const passwordValida = await verifyPassword(password, usuario.password);

      if (!passwordValida) {
        return res.render('auth/login', { error: 'Contraseña incorrecta.' });
      }

      if (!isPasswordHash(usuario.password)) {
        usuario.password = await hashPassword(password);
        await usuario.save();
      }

      if (usuario.estado !== 'ACTIVO') {
        return res.render('auth/login', {
          error: 'Tu usuario todavía no fue aprobado o se encuentra inactivo.'
        });
      }

      req.session.user = {
        id: usuario.id,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        email: usuario.email,
        rol: usuario.rol.nombre
      };

      if (usuario.rol.nombre === 'ADMIN') {
        return res.redirect('/admin/dashboard');
      }

      if (usuario.rol.nombre === 'PROFESOR') {
        return res.redirect('/profesor/dashboard');
      }

      return res.redirect('/alumno/dashboard');
    } catch (error) {
      console.error(error);
      return res.status(500).send('Error al iniciar sesión');
    }
  },

  registerView: async (req, res) => {
    try {
      return await renderRegister(res);
    } catch (error) {
      console.error(error);
      return res.status(500).send('Error al cargar el registro');
    }
  },

  register: async (req, res) => {
    try {
      const dni = String(req.body.dni || '').trim();
      const password = String(req.body.password || '');
      const apellido = String(req.body.apellido || '').trim();
      const nombre = String(req.body.nombre || '').trim();
      const email = String(req.body.email || '').trim().toLowerCase();
      const celular = String(req.body.celular || '').trim() || null;
      const fechaNacimiento = req.body.fechaNacimiento || null;
      const genero = req.body.genero || null;
      const esProfesor = req.body.solicitaSerProfesor === 'on';
      const carreraId = Number(req.body.carreraId);
      const materiaId = Number(req.body.materiaId);

      if (!dni || !apellido || !nombre || !email || password.length < 8) {
        return renderRegister(res, {
          error: 'Completá los campos obligatorios y usá una contraseña de al menos 8 caracteres.',
          formData: req.body
        });
      }

      const carrera = await Carrera.findOne({
        where: {
          id: carreraId,
          estado: 'ACTIVA'
        }
      });

      if (!carrera) {
        return renderRegister(res, {
          error: 'Seleccioná una carrera válida.',
          formData: req.body
        });
      }

      let materia = null;

      if (esProfesor) {
        if (!materiaId) {
          return renderRegister(res, {
            error: 'Seleccioná la carrera y la materia a la que pertenecés.',
            formData: req.body
          });
        }

        materia = await Materia.findOne({
          where: {
            id: materiaId,
            carreraId,
            estado: 'ACTIVA'
          }
        });

        if (!materia) {
          return renderRegister(res, {
            error: 'La carrera o materia seleccionada no es válida.',
            formData: req.body
          });
        }
      }

      const rol = await Rol.findOne({
        where: { nombre: esProfesor ? 'PROFESOR' : 'ALUMNO' }
      });

      if (!rol) {
        return renderRegister(res, {
          error: 'No existen roles cargados en la base de datos.',
          formData: req.body
        });
      }

      const usuarioCreado = await sequelize.transaction(async (transaction) => {
        const usuario = await Usuario.create({
          dni,
          password,
          apellido,
          nombre,
          email,
          celular,
          fechaNacimiento,
          genero,
          rolId: rol.id,
          solicitaSerProfesor: esProfesor,
          estado: esProfesor ? 'PENDIENTE' : 'ACTIVO'
        }, { transaction });

        if (esProfesor) {
          await Profesor.create({
            usuarioId: usuario.id,
            carreraId,
            materiaId
          }, { transaction });
        } else {
          await Alumno.create({
            usuarioId: usuario.id,
            carreraId
          }, { transaction });
        }

        return usuario;
      });

      if (esProfesor) {
        try {
          const administradores = await Usuario.findAll({
            attributes: ['email'],
            where: { estado: 'ACTIVO' },
            include: [{
              model: Rol,
              as: 'rol',
              attributes: [],
              where: { nombre: 'ADMIN' }
            }]
          });

          const destinatarios = [
            process.env.MAIL_ADMIN,
            ...administradores.map(admin => admin.email)
          ];

          await enviarNotificacionNuevoProfesor({
            destinatarios,
            usuario: usuarioCreado,
            carrera,
            materia
          });
        } catch (mailError) {
          console.error('No se pudo enviar el correo al administrador:', mailError);
        }
      }

      return res.redirect('/auth/login');
    } catch (error) {
      console.error(error);
      return renderRegister(res, {
        error: 'No se pudo registrar el usuario. Revisá si el DNI o correo electrónico ya están registrados.',
        formData: req.body
      });
    }
  },

  logout: (req, res) => {
    req.session.destroy(() => {
      res.redirect('/auth/login');
    });
  }
};

module.exports = authController;
