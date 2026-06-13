'use strict';

module.exports = (sequelize, DataTypes) => {
  const Inscripcion = sequelize.define('Inscripcion', {
    alumnoId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    practicaId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    fechaInscripcion: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    estado: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'PENDIENTE'
    },
    certificadoEnviado: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    certificadoPath: {
      type: DataTypes.STRING,
      allowNull: true
    },
    fechaResolucion: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'inscripciones',
    indexes: [
      {
        unique: true,
        fields: ['alumnoId', 'practicaId']
      }
    ]
  });

  Inscripcion.associate = function(models) {
    Inscripcion.belongsTo(models.Alumno, {
      foreignKey: 'alumnoId',
      as: 'alumno'
    });

    Inscripcion.belongsTo(models.Practica, {
      foreignKey: 'practicaId',
      as: 'practica'
    });
  };

  return Inscripcion;
};
