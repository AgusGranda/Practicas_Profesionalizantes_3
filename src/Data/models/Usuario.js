'use strict';

module.exports = (sequelize, DataTypes) => {
    const Usuario = sequelize.define('Usuario', {
        dni: DataTypes.STRING,
        password: DataTypes.STRING,
        rol: DataTypes.ENUM('ADMIN', 'PRECEPTOR', 'PROFESOR', 'ALUMNO'),
        alumnoId: DataTypes.INTEGER,
        profesorId: DataTypes.INTEGER
    }, {
        tableName: 'usuarios',
        timestamps: false
    });

    Usuario.associate = (models) => {
        Usuario.belongsTo(models.Alumno, { foreignKey: 'alumnoId', as: 'alumno' });
        Usuario.belongsTo(models.Profesor, { foreignKey: 'profesorId', as: 'profesor' });
    };

    return Usuario;
};
