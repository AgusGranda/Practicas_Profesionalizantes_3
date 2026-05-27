const store = require('../Data/store');

exports.index = async (req, res) => {
    res.render('practicas', {
        titulo: 'Practicas disponibles',
        grupos: await store.getOfertaVisible()
    });
};
