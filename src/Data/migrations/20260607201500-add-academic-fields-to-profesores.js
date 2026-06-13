'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('profesores', 'carreraId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'carreras',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT'
    });

    await queryInterface.addColumn('profesores', 'materiaId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'materias',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT'
    });

    await queryInterface.sequelize.query(`
      UPDATE profesores AS profesor
      INNER JOIN (
        SELECT profesorId, MIN(materiaId) AS materiaId
        FROM practicas
        GROUP BY profesorId
      ) AS practicaProfesor
        ON practicaProfesor.profesorId = profesor.id
      SET profesor.materiaId = practicaProfesor.materiaId
      WHERE profesor.materiaId IS NULL
    `);

    await queryInterface.sequelize.query(`
      UPDATE profesores AS profesor
      INNER JOIN materias AS materia
        ON materia.id = profesor.materiaId
      SET profesor.carreraId = materia.carreraId
      WHERE profesor.carreraId IS NULL
    `);

    await queryInterface.sequelize.query(`
      UPDATE profesores AS profesor
      INNER JOIN (
        SELECT profesorId, MIN(carreraId) AS carreraId
        FROM profesores_carreras
        GROUP BY profesorId
      ) AS profesorCarrera
        ON profesorCarrera.profesorId = profesor.id
      SET profesor.carreraId = profesorCarrera.carreraId
      WHERE profesor.carreraId IS NULL
    `);
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('profesores', 'materiaId');
    await queryInterface.removeColumn('profesores', 'carreraId');
  }
};
