'use strict';

module.exports = (sequelize, DataTypes) => {
  const Profesor = sequelize.define('Profesor', {
    usuarioId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true
    },
    aprobadoPorAdminId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    fechaAprobacion: {
      type: DataTypes.DATE,
      allowNull: true
    },
    carreraId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    materiaId: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    tableName: 'profesores'
  });

  Profesor.associate = function(models) {
    Profesor.belongsTo(models.Usuario, {
      foreignKey: 'usuarioId',
      as: 'usuario'
    });

    Profesor.belongsTo(models.Usuario, {
      foreignKey: 'aprobadoPorAdminId',
      as: 'aprobadoPorAdmin'
    });

    Profesor.belongsTo(models.Carrera, {
      foreignKey: 'carreraId',
      as: 'carrera'
    });

    Profesor.belongsTo(models.Materia, {
      foreignKey: 'materiaId',
      as: 'materia'
    });

    Profesor.hasMany(models.ProfesorCarrera, {
      foreignKey: 'profesorId',
      as: 'carreras'
    });

    Profesor.hasMany(models.Practica, {
      foreignKey: 'profesorId',
      as: 'practicas'
    });
  };

  return Profesor;
};
