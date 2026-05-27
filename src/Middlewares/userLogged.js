module.exports = (req, res, next) => {
    res.locals.usuario = req.session.usuario || null;
    next();
};
