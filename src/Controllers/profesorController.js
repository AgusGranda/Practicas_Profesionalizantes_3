const store = require('../Data/store');

function requiereProfesor(req, res) {
    const usuario = req.session.usuario;

    if (!usuario || usuario.rol !== 'PROFESOR') {
        res.status(403).send('No tenes permiso para ingresar al panel de profesor.');
        return null;
    }

    return usuario;
}

exports.index = async (req, res) => {
    const usuario = requiereProfesor(req, res);
    if (!usuario) return;

    const [todasLasInscripciones, grupos] = await Promise.all([
        store.getTodasLasInscripcionesDetalladas(),
        store.getGruposPorProfesor(usuario.profesorId)
    ]);

    const inscripciones = todasLasInscripciones.filter((inscripcion) => {
        return inscripcion.grupo.profesor.id === usuario.profesorId;
    });

    res.render('profesor', {
        titulo: 'Panel de profesor',
        inscripciones,
        grupos
    });
};

exports.registro = (req, res) => {
    res.render('profesorRegistro', {
        titulo: 'Registro de profesor',
        error: null,
        exito: null
    });
};

exports.crearRegistro = async (req, res) => {
    try {
        await store.crearProfesorPendiente({
            apellidoNombre: req.body.apellidoNombre,
            email: req.body.email,
            dni: req.body.dni,
            password: req.body.password
        });

        return res.render('profesorRegistro', {
            titulo: 'Registro de profesor',
            error: null,
            exito: 'Tu perfil fue creado. Vas a poder ingresar cuando el admin apruebe tu solicitud.'
        });
    } catch (error) {
        return res.status(400).render('profesorRegistro', {
            titulo: 'Registro de profesor',
            error: error.message,
            exito: null
        });
    }
};

exports.nuevaPractica = async (req, res) => {
    const usuario = requiereProfesor(req, res);
    if (!usuario) return;

    res.render('profesorPracticaForm', {
        titulo: 'Nueva practica',
        grupo: null,
        carreras: await store.getCarreras(),
        action: '/profesor/practicas',
        error: null
    });
};

exports.crearPractica = async (req, res) => {
    const usuario = requiereProfesor(req, res);
    if (!usuario) return;

    try {
        await store.crearPracticaProfesor(usuario.profesorId, req.body);
        return res.redirect('/profesor');
    } catch (error) {
        return res.status(400).render('profesorPracticaForm', {
            titulo: 'Nueva practica',
            grupo: null,
            carreras: await store.getCarreras(),
            action: '/profesor/practicas',
            error: error.message
        });
    }
};

exports.editarPractica = async (req, res) => {
    const usuario = requiereProfesor(req, res);
    if (!usuario) return;

    const grupos = await store.getGruposPorProfesor(usuario.profesorId);
    const grupo = grupos.find((item) => item.id === Number(req.params.id));
    if (!grupo) {
        return res.status(404).send('No se encontro la practica solicitada.');
    }

    res.render('profesorPracticaForm', {
        titulo: 'Editar practica',
        grupo,
        carreras: await store.getCarreras(),
        action: `/profesor/practicas/${grupo.id}`,
        error: null
    });
};

exports.actualizarPractica = async (req, res) => {
    const usuario = requiereProfesor(req, res);
    if (!usuario) return;

    const grupo = await store.actualizarPracticaProfesor(usuario.profesorId, req.params.id, req.body);
    if (!grupo) {
        return res.status(404).send('No se encontro la practica solicitada.');
    }

    res.redirect('/profesor');
};

exports.eliminarPractica = async (req, res) => {
    const usuario = requiereProfesor(req, res);
    if (!usuario) return;

    const grupo = await store.eliminarPracticaProfesor(usuario.profesorId, req.params.id);
    if (!grupo) {
        return res.status(404).send('No se encontro la practica solicitada.');
    }

    res.redirect('/profesor');
};
