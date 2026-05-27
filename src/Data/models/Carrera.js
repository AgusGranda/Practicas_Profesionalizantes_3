'use strict';

module.exports = (sequelize, DataTypes) => {
    const Carrera = sequelize.define('Carrera', {
        nombre: DataTypes.STRING
    }, {
        tableName: 'carreras',
        timestamps: false
    });

    Carrera.associate = (models) => {
        Carrera.hasMany(models.Alumno, { foreignKey: 'carreraId' });
        Carrera.hasMany(models.Practica, { foreignKey: 'carreraId' });
    };

    return Carrera;
};
