'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('inscripciones', 'fechaResolucion', {
      type: Sequelize.DATE,
      allowNull: true
    });

    await queryInterface.changeColumn('inscripciones', 'estado', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'PENDIENTE'
    });

    await queryInterface.sequelize.query(`
      UPDATE inscripciones
      SET fechaResolucion = updatedAt
      WHERE estado IN ('ACTIVA', 'CANCELADA')
        AND fechaResolucion IS NULL
    `);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('inscripciones', 'estado', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'ACTIVA'
    });

    await queryInterface.removeColumn('inscripciones', 'fechaResolucion');
  }
};
