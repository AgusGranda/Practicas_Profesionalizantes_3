function profesorMiddleware(req, res, next) {
  if (!req.session || !req.session.user) {
    return res.redirect('/auth/login');
  }

  if (req.session.user.rol !== 'PROFESOR') {
    return res.status(403).send('Acceso denegado. Solo profesores.');
  }

  next();
}

module.exports = profesorMiddleware;