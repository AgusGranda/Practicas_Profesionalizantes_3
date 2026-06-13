'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('inscripciones', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      alumnoId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'alumnos',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      practicaId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'practicas',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      fechaInscripcion: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      estado: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'ACTIVA'
      },
      certificadoEnviado: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      certificadoPath: {
        type: Sequelize.STRING,
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

    await queryInterface.addIndex('inscripciones', ['alumnoId', 'practicaId'], {
      unique: true
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('inscripciones');
  }
};