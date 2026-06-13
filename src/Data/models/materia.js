'use strict';

module.exports = (sequelize, DataTypes) => {
  const Materia = sequelize.define('Materia', {
    nombre: {
      type: DataTypes.STRING,
      allowNull: false
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    carreraId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    estado: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'ACTIVA'
    }
  }, {
    tableName: 'materias'
  });

  Materia.associate = function(models) {
    Materia.belongsTo(models.Carrera, {
      foreignKey: 'carreraId',
      as: 'carrera'
    });

    Materia.hasMany(models.Practica, {
      foreignKey: 'materiaId',
      as: 'practicas'
    });

    Materia.hasMany(models.Profesor, {
      foreignKey: 'materiaId',
      as: 'profesores'
    });
  };

  return Materia;
};
