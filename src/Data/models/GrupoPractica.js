'use strict';

module.exports = (sequelize, DataTypes) => {
    const GrupoPractica = sequelize.define('GrupoPractica', {
        practicaId: DataTypes.INTEGER,
        profesorId: DataTypes.INTEGER,
        cupoMaximo: DataTypes.INTEGER,
        dia: DataTypes.STRING,
        horario: DataTypes.STRING,
        lugar: DataTypes.STRING
    }, {
        tableName: 'grupos_practica',
        timestamps: false
    });

    GrupoPractica.associate = (models) => {
        GrupoPractica.belongsTo(models.Practica, { foreignKey: 'practicaId', as: 'practica' });
        GrupoPractica.belongsTo(models.Profesor, { foreignKey: 'profesorId', as: 'profesor' });
        GrupoPractica.hasMany(models.Inscripcion, { foreignKey: 'grupoPracticaId' });
    };

    return GrupoPractica;
};
