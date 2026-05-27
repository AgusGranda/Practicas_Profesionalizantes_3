const store = require('../Data/store');

async function requiereAlumno(req, res) {
    const usuario = req.session.usuario;

    if (!usuario || usuario.rol !== 'ALUMNO') {
        res.redirect('/login');
        return null;
    }

    return store.getAlumnoById(usuario.alumnoId);
}

exports.index = async (req, res) => {
    const alumno = await requiereAlumno(req, res);
    if (!alumno) return;

    const inscripcion = await store.getInscripcionActivaPorAlumno(alumno.id);
    const detalle = inscripcion ? await store.getInscripcionDetalle(inscripcion.id) : null;

    res.render('alumno', {
        titulo: 'Mi perfil',
        alumno,
        carreras: await store.getCarreras(),
        inscripcion: detalle,
        exito: null,
        error: null
    });
};

exports.actualizarPerfil = async (req, res) => {
    const alumnoActual = await requiereAlumno(req, res);
    if (!alumnoActual) return;

    const alumno = await store.actualizarAlumno(alumnoActual.id, {
        apellidoNombre: req.body.apellidoNombre,
        fechaNacimiento: req.body.fechaNacimiento,
        email: req.body.email,
        telefono: req.body.telefono,
        carreraId: req.body.carreraId,
        anio: req.body.anio
    });

    const inscripcion = await store.getInscripcionActivaPorAlumno(alumno.id);
    const detalle = inscripcion ? await store.getInscripcionDetalle(inscripcion.id) : null;

    res.render('alumno', {
        titulo: 'Mi perfil',
        alumno,
        carreras: await store.getCarreras(),
        inscripcion: detalle,
        exito: 'Tus datos fueron actualizados.',
        error: null
    });
};

exports.cancelarInscripcion = async (req, res) => {
    const alumno = await requiereAlumno(req, res);
    if (!alumno) return;

    const inscripcion = await store.cancelarInscripcion(alumno.id, req.params.id);
    if (!inscripcion) {
        const activa = await store.getInscripcionActivaPorAlumno(alumno.id);
        return res.status(404).render('alumno', {
            titulo: 'Mi perfil',
            alumno,
            carreras: await store.getCarreras(),
            inscripcion: activa ? await store.getInscripcionDetalle(activa.id) : null,
            exito: null,
            error: 'No se encontro una inscripcion activa para cancelar.'
        });
    }

    res.redirect('/alumno');
};
