'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('profesores_materias', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      profesorId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'profesores',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      materiaId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'materias',
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

    await queryInterface.addIndex(
      'profesores_materias',
      ['profesorId', 'materiaId'],
      { unique: true }
    );

    await queryInterface.sequelize.query(`
      INSERT IGNORE INTO profesores_materias
        (profesorId, materiaId, createdAt, updatedAt)
      SELECT id, materiaId, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      FROM profesores
      WHERE materiaId IS NOT NULL
    `);

    await queryInterface.sequelize.query(`
      INSERT IGNORE INTO profesores_carreras
        (profesorId, carreraId, createdAt, updatedAt)
      SELECT id, carreraId, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      FROM profesores
      WHERE carreraId IS NOT NULL
    `);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('profesores_materias');
  }
};
