'use strict';

const bcrypt = require('bcryptjs');

const BCRYPT_PATTERN = /^\$2[aby]\$\d{2}\$/;

module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      const [usuarios] = await queryInterface.sequelize.query(
        'SELECT id, password FROM usuarios',
        { transaction }
      );

      for (const usuario of usuarios) {
        if (!BCRYPT_PATTERN.test(usuario.password)) {
          const password = await bcrypt.hash(usuario.password, 10);

          await queryInterface.bulkUpdate(
            'usuarios',
            {
              password,
              updatedAt: new Date()
            },
            { id: usuario.id },
            { transaction }
          );
        }
      }
    });
  },

  async down() {
    // Un hash bcrypt es irreversible, por lo que esta migración no puede deshacerse.
  }
};
