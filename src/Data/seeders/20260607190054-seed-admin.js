'use strict';

const bcrypt = require('bcryptjs');

module.exports = {
  async up(queryInterface, Sequelize) {

    const [roles] = await queryInterface.sequelize.query(
      "SELECT id FROM roles WHERE nombre = 'ADMIN'"
    );

    const rolAdminId = roles[0].id;

    await queryInterface.bulkInsert('usuarios', [
      {
        dni: '12345678',
        password: await bcrypt.hash('admin123', 10),
        apellido: 'Administrador',
        nombre: 'Sistema',
        email: 'agustin.granda22@gmail.com',
        celular: '1111111111',
        fechaNacimiento: '1990-01-01',
        genero: 'Masculino',
        estado: 'ACTIVO',
        solicitaSerProfesor: false,
        rolId: rolAdminId,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('usuarios', {
      dni: '12345678'
    });
  }
};
