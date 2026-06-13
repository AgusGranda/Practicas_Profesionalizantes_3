'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('alumnos', 'carreraId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'carreras',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT'
    });

    await queryInterface.sequelize.query(`
      UPDATE alumnos AS alumno
      INNER JOIN (
        SELECT alumnoId, MIN(carreraId) AS carreraId
        FROM alumnos_carreras
        GROUP BY alumnoId
      ) AS alumnoCarrera
        ON alumnoCarrera.alumnoId = alumno.id
      SET alumno.carreraId = alumnoCarrera.carreraId
      WHERE alumno.carreraId IS NULL
    `);

    await queryInterface.sequelize.query(`
      UPDATE alumnos AS alumno
      INNER JOIN (
        SELECT inscripcion.alumnoId, MIN(materia.carreraId) AS carreraId
        FROM inscripciones AS inscripcion
        INNER JOIN practicas AS practica
          ON practica.id = inscripcion.practicaId
        INNER JOIN materias AS materia
          ON materia.id = practica.materiaId
        GROUP BY inscripcion.alumnoId
      ) AS carreraInscripcion
        ON carreraInscripcion.alumnoId = alumno.id
      SET alumno.carreraId = carreraInscripcion.carreraId
      WHERE alumno.carreraId IS NULL
    `);
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('alumnos', 'carreraId');
  }
};
