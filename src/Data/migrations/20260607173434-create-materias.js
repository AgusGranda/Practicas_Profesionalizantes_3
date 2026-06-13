'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('materias', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      nombre: {
        type: Sequelize.STRING,
        allowNull: false
      },
      descripcion: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      carreraId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'carreras',
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

    await queryInterface.addIndex('materias', ['nombre', 'carreraId'], {
      unique: true
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('materias');
  }
};