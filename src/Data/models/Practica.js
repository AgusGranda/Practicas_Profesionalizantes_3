'use strict';

module.exports = (sequelize, DataTypes) => {
    const Practica = sequelize.define('Practica', {
        nombre: DataTypes.STRING,
        carreraId: DataTypes.INTEGER,
        descripcion: DataTypes.TEXT,
        visible: DataTypes.BOOLEAN
    }, {
        tableName: 'practicas',
        timestamps: false
    });

    Practica.associate = (models) => {
        Practica.belongsTo(models.Carrera, { foreignKey: 'carreraId', as: 'carrera' });
        Practica.hasMany(models.GrupoPractica, { foreignKey: 'practicaId' });
    };

    return Practica;
};
