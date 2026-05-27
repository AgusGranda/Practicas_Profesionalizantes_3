'use strict';

module.exports = (sequelize, DataTypes) => {
    const Profesor = sequelize.define('Profesor', {
        apellidoNombre: DataTypes.STRING,
        email: DataTypes.STRING,
        aprobado: DataTypes.BOOLEAN
    }, {
        tableName: 'profesores',
        timestamps: false
    });

    Profesor.associate = (models) => {
        Profesor.hasOne(models.Usuario, { foreignKey: 'profesorId' });
        Profesor.hasMany(models.GrupoPractica, { foreignKey: 'profesorId' });
    };

    return Profesor;
};
