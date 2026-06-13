'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('alumnos_carreras', {
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
      carreraId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'carreras',
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

    await queryInterface.addIndex('alumnos_carreras', ['alumnoId', 'carreraId'], {
      unique: true
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('alumnos_carreras');
  }
};