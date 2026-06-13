'use strict';

module.exports = (sequelize, DataTypes) => {
  const Dia = sequelize.define('Dia', {
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    }
  }, {
    tableName: 'dias'
  });

  Dia.associate = function(models) {
    Dia.hasMany(models.PracticaDia, {
      foreignKey: 'diaId',
      as: 'practicas'
    });
  };

  return Dia;
};