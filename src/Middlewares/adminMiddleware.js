function adminMiddleware(req, res, next) {
  if (!req.session || !req.session.user) {
    return res.redirect('/auth/login');
  }

  if (req.session.user.rol !== 'ADMIN') {
    return res.status(403).send('Acceso denegado. Solo administradores.');
  }

  next();
}

module.exports = adminMiddleware;