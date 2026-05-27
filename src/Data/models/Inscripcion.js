'use strict';

module.exports = (sequelize, DataTypes) => {
    const Inscripcion = sequelize.define('Inscripcion', {
        alumnoId: DataTypes.INTEGER,
        grupoPracticaId: DataTypes.INTEGER,
        fechaInscripcion: DataTypes.DATE,
        estado: DataTypes.ENUM('INSCRIPTO', 'EN_ESPERA', 'CANCELADO')
    }, {
        tableName: 'inscripciones',
        timestamps: false
    });

    Inscripcion.associate = (models) => {
        Inscripcion.belongsTo(models.Alumno, { foreignKey: 'alumnoId', as: 'alumno' });
        Inscripcion.belongsTo(models.GrupoPractica, { foreignKey: 'grupoPracticaId', as: 'grupoBase' });
    };

    return Inscripcion;
};
