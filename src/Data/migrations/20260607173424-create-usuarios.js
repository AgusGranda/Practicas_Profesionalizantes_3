'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('usuarios', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      dni: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false
      },
      apellido: {
        type: Sequelize.STRING,
        allowNull: false
      },
      nombre: {
        type: Sequelize.STRING,
        allowNull: false
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      celular: {
        type: Sequelize.STRING,
        allowNull: true
      },
      fechaNacimiento: {
        type: Sequelize.DATEONLY,
        allowNull: true
      },
      genero: {
        type: Sequelize.STRING,
        allowNull: true
      },
      estado: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'ACTIVO'
      },
      solicitaSerProfesor: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      rolId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'roles',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
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
    await queryInterface.dropTable('usuarios');
  }
};