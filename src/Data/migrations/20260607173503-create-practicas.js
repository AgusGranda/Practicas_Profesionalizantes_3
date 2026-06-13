'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('practicas', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      titulo: {
        type: Sequelize.STRING,
        allowNull: false
      },
      descripcion: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      lugar: {
        type: Sequelize.STRING,
        allowNull: false
      },
      fechaInicio: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      fechaFin: {
        type: Sequelize.DATEONLY,
        allowNull: true
      },
      horarioInicio: {
        type: Sequelize.TIME,
        allowNull: false
      },
      horarioFin: {
        type: Sequelize.TIME,
        allowNull: false
      },
      cupo: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      materiaId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'materias',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      profesorId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'profesores',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      estado: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'ACTIVA'
      },
      observaciones: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('practicas');
  }
};