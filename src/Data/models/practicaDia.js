'use strict';

module.exports = (sequelize, DataTypes) => {
  const PracticaDia = sequelize.define('PracticaDia', {
    practicaId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    diaId: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    tableName: 'practicas_dias',
    indexes: [
      {
        unique: true,
        fields: ['practicaId', 'diaId']
      }
    ]
  });

  PracticaDia.associate = function(models) {
    PracticaDia.belongsTo(models.Practica, {
      foreignKey: 'practicaId',
      as: 'practica'
    });

    PracticaDia.belongsTo(models.Dia, {
      foreignKey: 'diaId',
      as: 'dia'
    });
  };

  return PracticaDia;
};