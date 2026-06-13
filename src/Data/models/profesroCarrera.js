'use strict';

module.exports = (sequelize, DataTypes) => {
  const ProfesorCarrera = sequelize.define('ProfesorCarrera', {
    profesorId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    carreraId: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    tableName: 'profesores_carreras',
    indexes: [
      {
        unique: true,
        fields: ['profesorId', 'carreraId']
      }
    ]
  });

  ProfesorCarrera.associate = function(models) {
    ProfesorCarrera.belongsTo(models.Profesor, {
      foreignKey: 'profesorId',
      as: 'profesor'
    });

    ProfesorCarrera.belongsTo(models.Carrera, {
      foreignKey: 'carreraId',
      as: 'carrera'
    });
  };

  return ProfesorCarrera;
};