'use strict';

module.exports = (sequelize, DataTypes) => {
  const AlumnoCarrera = sequelize.define('AlumnoCarrera', {
    alumnoId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    carreraId: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    tableName: 'alumnos_carreras',
    indexes: [
      {
        unique: true,
        fields: ['alumnoId', 'carreraId']
      }
    ]
  });

  AlumnoCarrera.associate = function(models) {
    AlumnoCarrera.belongsTo(models.Alumno, {
      foreignKey: 'alumnoId',
      as: 'alumno'
    });

    AlumnoCarrera.belongsTo(models.Carrera, {
      foreignKey: 'carreraId',
      as: 'carrera'
    });
  };

  return AlumnoCarrera;
};