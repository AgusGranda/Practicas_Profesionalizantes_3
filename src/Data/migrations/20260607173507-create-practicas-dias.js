'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('practicas_dias', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
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
      diaId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'dias',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
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

    await queryInterface.addIndex('practicas_dias', ['practicaId', 'diaId'], {
      unique: true
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('practicas_dias');
  }
};