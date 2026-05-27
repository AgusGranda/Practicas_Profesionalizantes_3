const { Op } = require('sequelize');
const {
    Alumno,
    Carrera,
    GrupoPractica,
    Inscripcion,
    MailEnviado,
    Practica,
    Profesor,
    Usuario,
    sequelize
} = require('./models');

function plain(modelo) {
    if (!modelo) return null;
    return typeof modelo.get === 'function' ? modelo.get({ plain: true }) : modelo;
}

async function getCarreras() {
    return Carrera.findAll({ order: [['id', 'ASC']] });
}

async function getAlumnos() {
    return Alumno.findAll({ order: [['apellidoNombre', 'ASC']] });
}

async function getCarreraById(id) {
    return plain(await Carrera.findByPk(id));
}

async function getProfesorById(id) {
    return plain(await Profesor.findByPk(id));
}

async function getProfesorByEmail(email) {
    return plain(await Profesor.findOne({ where: { email } }));
}

async function getPracticaById(id) {
    return plain(await Practica.findByPk(id));
}

async function getGrupoById(id) {
    return plain(await GrupoPractica.findByPk(id));
}

async function getAlumnoById(id) {
    return plain(await Alumno.findByPk(id));
}

async function getAlumnoByDni(dni) {
    return plain(await Alumno.findOne({ where: { dni: String(dni) } }));
}

async function getUsuarioByDni(dni) {
    return plain(await Usuario.findOne({ where: { dni: String(dni) } }));
}

async function getInscripcionesActivas() {
    return Inscripcion.findAll({
        where: {
            estado: {
                [Op.ne]: 'CANCELADO'
            }
        }
    });
}

async function getInscripcionActivaPorAlumno(alumnoId) {
    return plain(await Inscripcion.findOne({
        where: {
            alumnoId: Number(alumnoId),
            estado: {
                [Op.ne]: 'CANCELADO'
            }
        },
        order: [['fechaInscripcion', 'DESC']]
    }));
}

async function contarInscriptosEnGrupo(grupoId) {
    return Inscripcion.count({
        where: {
            grupoPracticaId: Number(grupoId),
            estado: 'INSCRIPTO'
        }
    });
}

async function buildGrupoDetalle(grupoBase) {
    const grupo = plain(grupoBase);
    if (!grupo) return null;

    const practica = await getPracticaById(grupo.practicaId);
    if (!practica) return null;

    const carrera = await getCarreraById(practica.carreraId);
    const profesor = await getProfesorById(grupo.profesorId);
    const inscriptos = await contarInscriptosEnGrupo(grupo.id);

    return {
        ...grupo,
        practica,
        carrera,
        profesor,
        inscriptos,
        cupoDisponible: Math.max(grupo.cupoMaximo - inscriptos, 0)
    };
}

async function getOfertaVisible() {
    const grupos = await GrupoPractica.findAll({ order: [['id', 'ASC']] });
    const detalles = await Promise.all(grupos.map(buildGrupoDetalle));

    return detalles.filter((grupo) => {
        return grupo && grupo.practica.visible && grupo.profesor.aprobado;
    });
}

async function getInscripcionDetalle(id) {
    const inscripcion = plain(await Inscripcion.findByPk(id));
    if (!inscripcion) return null;

    const alumno = await getAlumnoById(inscripcion.alumnoId);
    if (!alumno) return null;

    const grupo = await buildGrupoDetalle(await getGrupoById(inscripcion.grupoPracticaId));
    if (!grupo) return null;

    return {
        ...inscripcion,
        alumno,
        grupo,
        carreraAlumno: await getCarreraById(alumno.carreraId)
    };
}

async function getTodasLasInscripcionesDetalladas() {
    const inscripciones = await Inscripcion.findAll({ order: [['fechaInscripcion', 'DESC']] });
    const detalles = await Promise.all(inscripciones.map((inscripcion) => getInscripcionDetalle(inscripcion.id)));
    return detalles.filter(Boolean);
}

async function actualizarAlumno(alumnoId, datos) {
    const alumno = await Alumno.findByPk(alumnoId);
    if (!alumno) return null;

    await alumno.update({
        apellidoNombre: datos.apellidoNombre,
        fechaNacimiento: datos.fechaNacimiento,
        email: datos.email,
        telefono: datos.telefono,
        carreraId: Number(datos.carreraId || alumno.carreraId),
        anio: Number(datos.anio || alumno.anio)
    });

    return plain(alumno);
}

async function crearInscripcion(alumnoId, grupoPracticaId) {
    const alumno = await getAlumnoById(alumnoId);
    const grupo = await getGrupoById(grupoPracticaId);

    if (!alumno || !grupo) {
        throw new Error('No se encontro el alumno o la practica seleccionada.');
    }

    if (alumno.egresado) {
        throw new Error('El alumno figura como egresado y no puede inscribirse.');
    }

    const inscripcionExistente = await getInscripcionActivaPorAlumno(alumno.id);
    if (inscripcionExistente) {
        return inscripcionExistente;
    }

    const estado = await contarInscriptosEnGrupo(grupo.id) >= grupo.cupoMaximo ? 'EN_ESPERA' : 'INSCRIPTO';
    return plain(await Inscripcion.create({
        alumnoId: alumno.id,
        grupoPracticaId: grupo.id,
        fechaInscripcion: new Date(),
        estado
    }));
}

async function cancelarInscripcion(alumnoId, inscripcionId) {
    const inscripcion = await Inscripcion.findOne({
        where: {
            id: Number(inscripcionId),
            alumnoId: Number(alumnoId),
            estado: {
                [Op.ne]: 'CANCELADO'
            }
        }
    });

    if (!inscripcion) return null;
    await inscripcion.update({ estado: 'CANCELADO' });
    return plain(inscripcion);
}

async function getProfesoresPendientes() {
    return Profesor.findAll({
        where: { aprobado: false },
        order: [['apellidoNombre', 'ASC']]
    });
}

async function getProfesoresAprobados() {
    return Profesor.findAll({
        where: { aprobado: true },
        order: [['apellidoNombre', 'ASC']]
    });
}

async function crearProfesorPendiente(datos) {
    return sequelize.transaction(async (transaction) => {
        const usuarioExistente = await Usuario.findOne({ where: { dni: datos.dni }, transaction });
        if (usuarioExistente) {
            throw new Error('Ya existe un usuario con ese DNI.');
        }

        const profesorExistente = await Profesor.findOne({ where: { email: datos.email }, transaction });
        if (profesorExistente) {
            throw new Error('Ya existe un profesor registrado con ese mail.');
        }

        const profesor = await Profesor.create({
            apellidoNombre: datos.apellidoNombre,
            email: datos.email,
            aprobado: false
        }, { transaction });

        await Usuario.create({
            dni: datos.dni,
            password: datos.password,
            rol: 'PROFESOR',
            alumnoId: null,
            profesorId: profesor.id
        }, { transaction });

        return plain(profesor);
    });
}

async function aprobarProfesor(profesorId) {
    const profesor = await Profesor.findByPk(profesorId);
    if (!profesor) return null;

    await profesor.update({ aprobado: true });
    return plain(profesor);
}

async function getGruposPorProfesor(profesorId) {
    const grupos = await GrupoPractica.findAll({
        where: { profesorId: Number(profesorId) },
        order: [['id', 'ASC']]
    });
    const detalles = await Promise.all(grupos.map(buildGrupoDetalle));

    return detalles.filter((grupo) => grupo && grupo.practica.visible);
}

async function crearPracticaProfesor(profesorId, datos) {
    return sequelize.transaction(async (transaction) => {
        const practica = await Practica.create({
            nombre: datos.nombre,
            carreraId: Number(datos.carreraId),
            descripcion: datos.descripcion,
            visible: true
        }, { transaction });

        const grupo = await GrupoPractica.create({
            practicaId: practica.id,
            profesorId: Number(profesorId),
            cupoMaximo: Number(datos.cupoMaximo),
            dia: datos.dia,
            horario: datos.horario,
            lugar: datos.lugar
        }, { transaction });

        return buildGrupoDetalle(plain(grupo));
    });
}

async function actualizarPracticaProfesor(profesorId, grupoId, datos) {
    const grupo = await GrupoPractica.findByPk(grupoId);
    if (!grupo || grupo.profesorId !== Number(profesorId)) return null;

    const practica = await Practica.findByPk(grupo.practicaId);
    if (!practica) return null;

    await sequelize.transaction(async (transaction) => {
        await practica.update({
            nombre: datos.nombre,
            carreraId: Number(datos.carreraId),
            descripcion: datos.descripcion
        }, { transaction });

        await grupo.update({
            cupoMaximo: Number(datos.cupoMaximo),
            dia: datos.dia,
            horario: datos.horario,
            lugar: datos.lugar
        }, { transaction });
    });

    return buildGrupoDetalle(plain(grupo));
}

async function eliminarPracticaProfesor(profesorId, grupoId) {
    const grupo = await GrupoPractica.findByPk(grupoId);
    if (!grupo || grupo.profesorId !== Number(profesorId)) return null;

    const practica = await Practica.findByPk(grupo.practicaId);
    if (!practica) return null;

    await sequelize.transaction(async (transaction) => {
        await practica.update({ visible: false }, { transaction });
        await Inscripcion.update(
            { estado: 'CANCELADO' },
            {
                where: {
                    grupoPracticaId: grupo.id,
                    estado: {
                        [Op.ne]: 'CANCELADO'
                    }
                },
                transaction
            }
        );
    });

    return buildGrupoDetalle(plain(grupo));
}

async function registrarMailEnviado(mail) {
    return MailEnviado.create({
        fecha: new Date(),
        para: mail.para,
        asunto: mail.asunto,
        texto: mail.texto,
        adjuntoNombre: mail.adjunto ? mail.adjunto.nombre : null,
        adjuntoTipo: mail.adjunto ? mail.adjunto.tipo : null,
        adjuntoBytes: mail.adjunto ? mail.adjunto.bytes : null
    });
}

async function autenticar(dni, password) {
    const usuario = await Usuario.findOne({ where: { dni: String(dni) } });
    if (!usuario || usuario.password !== password) return null;

    if (usuario.rol === 'PROFESOR') {
        const profesor = await Profesor.findByPk(usuario.profesorId);
        if (!profesor || !profesor.aprobado) return null;
    }

    return {
        id: usuario.id,
        dni: usuario.dni,
        rol: usuario.rol,
        alumnoId: usuario.alumnoId,
        profesorId: usuario.profesorId
    };
}

module.exports = {
    autenticar,
    aprobarProfesor,
    actualizarAlumno,
    actualizarPracticaProfesor,
    buildGrupoDetalle,
    cancelarInscripcion,
    contarInscriptosEnGrupo,
    crearInscripcion,
    crearPracticaProfesor,
    crearProfesorPendiente,
    eliminarPracticaProfesor,
    getAlumnoByDni,
    getAlumnoById,
    getAlumnos,
    getCarreraById,
    getCarreras,
    getGrupoById,
    getGruposPorProfesor,
    getInscripcionActivaPorAlumno,
    getInscripcionDetalle,
    getInscripcionesActivas,
    getOfertaVisible,
    getPracticaById,
    getProfesorByEmail,
    getProfesorById,
    getProfesoresAprobados,
    getProfesoresPendientes,
    getTodasLasInscripcionesDetalladas,
    getUsuarioByDni,
    registrarMailEnviado,
    sequelize
};
