const store = require('../Data/store');
const { generarComprobantePdf } = require('../Services/comprobantePdfService');
const { enviarComprobanteInscripcion } = require('../Services/mailService');

async function requiereAlumno(req, res) {
    if (!req.session.usuario) {
        res.redirect('/login');
        return null;
    }

    if (req.session.usuario.rol !== 'ALUMNO') {
        res.status(403).send('Solo los alumnos pueden inscribirse a una practica.');
        return null;
    }

    return store.getAlumnoById(req.session.usuario.alumnoId);
}

exports.index = (req, res) => {
    res.redirect('/practicas');
};

exports.form = async (req, res) => {
    const alumno = await requiereAlumno(req, res);
    if (!alumno) return;

    const inscripcionExistente = await store.getInscripcionActivaPorAlumno(alumno.id);
    if (inscripcionExistente) {
        return res.redirect(`/inscripcion/comprobante/${inscripcionExistente.id}`);
    }

    const grupoBase = await store.getGrupoById(req.params.grupoId);
    if (!grupoBase) {
        return res.status(404).send('No se encontro la practica seleccionada.');
    }

    const grupo = await store.buildGrupoDetalle(grupoBase);

    res.render('inscripcion', {
        titulo: 'Confirmar inscripcion',
        alumno,
        grupo,
        error: null
    });
};

exports.create = async (req, res) => {
    const alumno = await requiereAlumno(req, res);
    if (!alumno) return;

    const grupoBase = await store.getGrupoById(req.params.grupoId);
    if (!grupoBase) {
        return res.status(404).send('No se encontro la practica seleccionada.');
    }

    const grupo = await store.buildGrupoDetalle(grupoBase);

    try {
        await store.actualizarAlumno(alumno.id, {
            apellidoNombre: req.body.apellidoNombre,
            fechaNacimiento: req.body.fechaNacimiento,
            email: req.body.email,
            telefono: req.body.telefono
        });

        const inscripcion = await store.crearInscripcion(alumno.id, grupo.id);
        const detalle = await store.getInscripcionDetalle(inscripcion.id);
        await enviarComprobanteInscripcion(detalle);
        return res.redirect(`/inscripcion/comprobante/${inscripcion.id}`);
    } catch (error) {
        return res.status(400).render('inscripcion', {
            titulo: 'Confirmar inscripcion',
            alumno,
            grupo,
            error: error.message
        });
    }
};

exports.comprobante = async (req, res) => {
    const detalle = await store.getInscripcionDetalle(req.params.id);

    if (!detalle) {
        return res.status(404).send('No se encontro el comprobante solicitado.');
    }

    const usuario = req.session.usuario;
    const esAlumnoTitular = usuario && usuario.alumnoId === detalle.alumnoId;
    const puedeVer = usuario && ['ADMIN', 'PRECEPTOR'].includes(usuario.rol);

    if (!esAlumnoTitular && !puedeVer) {
        return res.status(403).send('No tenes permiso para ver este comprobante.');
    }

    return res.render('comprobante', {
        titulo: 'Comprobante de inscripcion',
        inscripcion: detalle
    });
};

exports.comprobantePdf = async (req, res) => {
    const detalle = await store.getInscripcionDetalle(req.params.id);

    if (!detalle) {
        return res.status(404).send('No se encontro el comprobante solicitado.');
    }

    const usuario = req.session.usuario;
    const esAlumnoTitular = usuario && usuario.alumnoId === detalle.alumnoId;
    const puedeVer = usuario && ['ADMIN', 'PRECEPTOR'].includes(usuario.rol);

    if (!esAlumnoTitular && !puedeVer) {
        return res.status(403).send('No tenes permiso para ver este comprobante.');
    }

    const pdf = generarComprobantePdf(detalle);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="comprobante-inscripcion-${detalle.id}.pdf"`);
    res.send(pdf);
};
