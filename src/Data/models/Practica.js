'use strict';

module.exports = (sequelize, DataTypes) => {
  const Practica = sequelize.define('Practica', {
    titulo: {
      type: DataTypes.STRING,
      allowNull: false
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    lugar: {
      type: DataTypes.STRING,
      allowNull: false
    },
    fechaInicio: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    fechaFin: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    horarioInicio: {
      type: DataTypes.TIME,
      allowNull: false
    },
    horarioFin: {
      type: DataTypes.TIME,
      allowNull: false
    },
    cupo: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1
      }
    },
    materiaId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    profesorId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    estado: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'ACTIVA'
    },
    observaciones: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'practicas',
    validate: {
      periodoValido() {
        if (this.fechaFin && this.fechaFin < this.fechaInicio) {
          throw new Error(
            'La fecha de finalización no puede ser anterior a la fecha de inicio.'
          );
        }

        if (this.horarioFin <= this.horarioInicio) {
          throw new Error(
            'El horario de finalización debe ser posterior al horario de inicio.'
          );
        }
      }
    }
  });

  Practica.associate = function(models) {
    Practica.belongsTo(models.Materia, {
      foreignKey: 'materiaId',
      as: 'materia'
    });

    Practica.belongsTo(models.Profesor, {
      foreignKey: 'profesorId',
      as: 'profesor'
    });

    Practica.hasMany(models.PracticaDia, {
      foreignKey: 'practicaId',
      as: 'dias'
    });

    Practica.hasMany(models.Inscripcion, {
      foreignKey: 'practicaId',
      as: 'inscripciones'
    });
  };

  return Practica;
};
