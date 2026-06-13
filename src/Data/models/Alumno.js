'use strict';

module.exports = (sequelize, DataTypes) => {
  const Alumno = sequelize.define('Alumno', {
    usuarioId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true
    },
    carreraId: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    tableName: 'alumnos'
  });

  Alumno.associate = function(models) {
    Alumno.belongsTo(models.Usuario, {
      foreignKey: 'usuarioId',
      as: 'usuario'
    });

    Alumno.belongsTo(models.Carrera, {
      foreignKey: 'carreraId',
      as: 'carrera'
    });

    Alumno.hasMany(models.AlumnoCarrera, {
      foreignKey: 'alumnoId',
      as: 'carreras'
    });

    Alumno.hasMany(models.Inscripcion, {
      foreignKey: 'alumnoId',
      as: 'inscripciones'
    });
  };

  return Alumno;
};
