'use strict';

module.exports = (sequelize, DataTypes) => {
  const Rol = sequelize.define('Rol', {
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    }
  }, {
    tableName: 'roles'
  });

  Rol.associate = function(models) {
    Rol.hasMany(models.Usuario, {
      foreignKey: 'rolId',
      as: 'usuarios'
    });
  };

  return Rol;
};