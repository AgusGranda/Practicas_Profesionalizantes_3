'use strict';

module.exports = (sequelize, DataTypes) => {
    const Alumno = sequelize.define('Alumno', {
        dni: DataTypes.STRING,
        apellidoNombre: DataTypes.STRING,
        fechaNacimiento: DataTypes.DATEONLY,
        email: DataTypes.STRING,
        telefono: DataTypes.STRING,
        carreraId: DataTypes.INTEGER,
        anio: DataTypes.INTEGER,
        egresado: DataTypes.BOOLEAN
    }, {
        tableName: 'alumnos',
        timestamps: false
    });

    Alumno.associate = (models) => {
        Alumno.belongsTo(models.Carrera, { foreignKey: 'carreraId', as: 'carrera' });
        Alumno.hasOne(models.Usuario, { foreignKey: 'alumnoId' });
        Alumno.hasMany(models.Inscripcion, { foreignKey: 'alumnoId' });
    };

    return Alumno;
};
