'use strict';

module.exports = (sequelize, DataTypes) => {
  const Carrera = sequelize.define('Carrera', {
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    estado: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'ACTIVA'
    }
  }, {
    tableName: 'carreras'
  });

  Carrera.associate = function(models) {
    Carrera.hasMany(models.Materia, {
      foreignKey: 'carreraId',
      as: 'materias'
    });

    Carrera.hasMany(models.ProfesorCarrera, {
      foreignKey: 'carreraId',
      as: 'profesoresCarreras'
    });

    Carrera.hasMany(models.Profesor, {
      foreignKey: 'carreraId',
      as: 'profesores'
    });

    Carrera.hasMany(models.AlumnoCarrera, {
      foreignKey: 'carreraId',
      as: 'alumnosCarreras'
    });

    Carrera.hasMany(models.Alumno, {
      foreignKey: 'carreraId',
      as: 'alumnos'
    });
  };

  return Carrera;
};
