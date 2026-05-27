const store = require('../Data/store');

function requiereAdmin(req, res) {
    const usuario = req.session.usuario;

    if (!usuario || usuario.rol !== 'ADMIN') {
        res.status(403).send('No tenes permiso para ingresar al panel.');
        return false;
    }

    return true;
}

exports.index = async (req, res) => {
    if (!requiereAdmin(req, res)) return;

    res.render('admin/profesores', {
        titulo: 'Aprobacion de profesores',
        profesores: await store.getProfesoresPendientes()
    });
};

exports.aprobarProfesor = async (req, res) => {
    if (!requiereAdmin(req, res)) return;

    await store.aprobarProfesor(req.params.id);
    res.redirect('/admin');
};
