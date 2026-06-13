'use strict';

module.exports = (sequelize, DataTypes) => {
  const ProfesorMateria = sequelize.define('ProfesorMateria', {
    profesorId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    materiaId: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    tableName: 'profesores_materias',
    indexes: [
      {
        unique: true,
        fields: ['profesorId', 'materiaId']
      }
    ]
  });

  ProfesorMateria.associate = function(models) {
    ProfesorMateria.belongsTo(models.Profesor, {
      foreignKey: 'profesorId',
      as: 'profesor'
    });

    ProfesorMateria.belongsTo(models.Materia, {
      foreignKey: 'materiaId',
      as: 'materia'
    });
  };

  return ProfesorMateria;
};
