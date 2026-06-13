'use strict';

const {
  hashPassword,
  isPasswordHash
} = require('../../Services/passwordService');

module.exports = (sequelize, DataTypes) => {
  const Usuario = sequelize.define('Usuario', {
    dni: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    apellido: {
      type: DataTypes.STRING,
      allowNull: false
    },
    nombre: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    celular: {
      type: DataTypes.STRING,
      allowNull: true
    },
    fechaNacimiento: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    genero: {
      type: DataTypes.STRING,
      allowNull: true
    },
    estado: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'ACTIVO'
    },
    solicitaSerProfesor: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    rolId: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    tableName: 'usuarios',
    hooks: {
      beforeSave: async (usuario) => {
        if (
          usuario.changed('password') &&
          !isPasswordHash(usuario.password)
        ) {
          usuario.password = await hashPassword(usuario.password);
        }
      }
    }
  });

  Usuario.associate = function(models) {
    Usuario.belongsTo(models.Rol, {
      foreignKey: 'rolId',
      as: 'rol'
    });

    Usuario.hasOne(models.Profesor, {
      foreignKey: 'usuarioId',
      as: 'profesor'
    });

    Usuario.hasOne(models.Alumno, {
      foreignKey: 'usuarioId',
      as: 'alumno'
    });

    Usuario.hasMany(models.Profesor, {
      foreignKey: 'aprobadoPorAdminId',
      as: 'profesoresAprobados'
    });
  };

  return Usuario;
};
