'use strict';

module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert('dias', [
      {
        nombre: 'Lunes',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nombre: 'Martes',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nombre: 'Miércoles',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nombre: 'Jueves',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nombre: 'Viernes',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nombre: 'Sábado',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('dias', null, {});
  }
};