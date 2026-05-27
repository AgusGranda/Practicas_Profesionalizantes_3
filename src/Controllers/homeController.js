const store = require('../Data/store');

exports.index = (req, res) => {
    res.render('home', {
        titulo: 'Sistema de Practicas Profesionalizantes'
    });
};

exports.login = (req, res) => {
    res.render('login', {
        titulo: 'Ingresar',
        error: null
    });
};

exports.loginPost = async (req, res) => {
    const usuario = await store.autenticar(req.body.dni, req.body.password);

    if (!usuario) {
        const usuarioExistente = await store.getUsuarioByDni(req.body.dni);
        const profesor = usuarioExistente && usuarioExistente.rol === 'PROFESOR'
            ? await store.getProfesorById(usuarioExistente.profesorId)
            : null;
        const error = profesor && !profesor.aprobado && usuarioExistente.password === req.body.password
            ? 'Tu perfil de profesor todavia esta pendiente de aprobacion.'
            : 'El usuario o la clave no son correctos.';

        return res.status(401).render('login', {
            titulo: 'Ingresar',
            error
        });
    }

    req.session.usuario = usuario;

    if (usuario.rol === 'ADMIN' || usuario.rol === 'PRECEPTOR') return res.redirect('/admin');
    if (usuario.rol === 'PROFESOR') return res.redirect('/profesor');

    return res.redirect('/practicas');
};

exports.logout = (req, res) => {
    req.session.destroy(() => {
        res.redirect('/');
    });
};
