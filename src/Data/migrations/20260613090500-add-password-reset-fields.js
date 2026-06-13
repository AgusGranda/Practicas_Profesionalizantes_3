'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('usuarios', 'resetPasswordTokenHash', {
      type: Sequelize.STRING,
      allowNull: true
    });

    await queryInterface.addColumn('usuarios', 'resetPasswordExpiresAt', {
      type: Sequelize.DATE,
      allowNull: true
    });

    await queryInterface.addIndex('usuarios', ['resetPasswordTokenHash']);
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('usuarios', ['resetPasswordTokenHash']);
    await queryInterface.removeColumn('usuarios', 'resetPasswordExpiresAt');
    await queryInterface.removeColumn('usuarios', 'resetPasswordTokenHash');
  }
};
