function alumnoMiddleware(req, res, next) {
  if (!req.session || !req.session.user) {
    return res.redirect('/auth/login');
  }

  if (req.session.user.rol !== 'ALUMNO') {
    return res.status(403).send('Acceso denegado. Solo alumnos.');
  }

  next();
}

module.exports = alumnoMiddleware;