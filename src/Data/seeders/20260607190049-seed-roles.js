'use strict';

module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert('roles', [
      {
        nombre: 'ADMIN',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nombre: 'PROFESOR',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nombre: 'ALUMNO',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('roles', null, {});
  }
};