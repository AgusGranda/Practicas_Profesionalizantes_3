'use strict';

module.exports = {
    async up(queryInterface) {
        await queryInterface.bulkInsert('carreras', [
            { id: 1, nombre: 'Bibliotecologia' },
            { id: 2, nombre: 'Enfermeria' },
            { id: 3, nombre: 'Instrumentacion Quirurgica' }
        ]);

        await queryInterface.bulkInsert('profesores', [
            { id: 1, apellidoNombre: 'Prof. Laura Gomez', email: 'laura.gomez@example.com', aprobado: true },
            { id: 2, apellidoNombre: 'Prof. Martin Perez', email: 'martin.perez@example.com', aprobado: true },
            { id: 3, apellidoNombre: 'Prof. Cecilia Ruiz', email: 'cecilia.ruiz@example.com', aprobado: true }
        ]);

        await queryInterface.bulkInsert('alumnos', [
            {
                id: 1,
                dni: '40111222',
                apellidoNombre: 'Acosta Juan',
                fechaNacimiento: '2002-04-14',
                email: 'juan.acosta@example.com',
                telefono: '1123456789',
                carreraId: 1,
                anio: 3,
                egresado: false
            },
            {
                id: 2,
                dni: '41222333',
                apellidoNombre: 'Benitez Sofia',
                fechaNacimiento: '2001-09-02',
                email: 'sofia.benitez@example.com',
                telefono: '1134567890',
                carreraId: 2,
                anio: 3,
                egresado: false
            },
            {
                id: 3,
                dni: '42333444',
                apellidoNombre: 'Caceres Martina',
                fechaNacimiento: '2000-11-18',
                email: 'martina.caceres@example.com',
                telefono: '1145678901',
                carreraId: 3,
                anio: 3,
                egresado: false
            }
        ]);

        await queryInterface.bulkInsert('practicas', [
            {
                id: 1,
                nombre: 'Practica en Biblioteca Escolar',
                carreraId: 1,
                descripcion: 'Organizacion, catalogacion y atencion en biblioteca escolar.',
                visible: true
            },
            {
                id: 2,
                nombre: 'Practica Hospitalaria I',
                carreraId: 2,
                descripcion: 'Acompanamiento y tareas supervisadas en sala general.',
                visible: true
            },
            {
                id: 3,
                nombre: 'Instrumentacion en Quirofano',
                carreraId: 3,
                descripcion: 'Reconocimiento de materiales y asistencia al equipo quirurgico.',
                visible: true
            }
        ]);

        await queryInterface.bulkInsert('grupos_practica', [
            {
                id: 1,
                practicaId: 1,
                profesorId: 1,
                cupoMaximo: 15,
                dia: 'Lunes y miercoles',
                horario: '18:00 a 21:00',
                lugar: 'Escuela Secundaria Nro. 12'
            },
            {
                id: 2,
                practicaId: 2,
                profesorId: 2,
                cupoMaximo: 3,
                dia: 'Martes y jueves',
                horario: '08:00 a 12:00',
                lugar: 'Hospital Municipal'
            },
            {
                id: 3,
                practicaId: 3,
                profesorId: 3,
                cupoMaximo: 15,
                dia: 'Viernes',
                horario: '14:00 a 18:00',
                lugar: 'Clinica San Martin'
            }
        ]);

        await queryInterface.bulkInsert('inscripciones', [
            {
                id: 1,
                alumnoId: 2,
                grupoPracticaId: 2,
                fechaInscripcion: new Date('2026-05-20T10:00:00'),
                estado: 'INSCRIPTO'
            },
            {
                id: 2,
                alumnoId: 3,
                grupoPracticaId: 2,
                fechaInscripcion: new Date('2026-05-20T10:05:00'),
                estado: 'INSCRIPTO'
            }
        ]);

        await queryInterface.bulkInsert('usuarios', [
            { id: 1, dni: 'admin', password: 'admin', rol: 'ADMIN', alumnoId: null, profesorId: null },
            { id: 2, dni: 'preceptor', password: 'preceptor', rol: 'PRECEPTOR', alumnoId: null, profesorId: null },
            { id: 3, dni: '40111222', password: '40111222', rol: 'ALUMNO', alumnoId: 1, profesorId: null },
            { id: 4, dni: '41222333', password: '41222333', rol: 'ALUMNO', alumnoId: 2, profesorId: null },
            { id: 5, dni: '42333444', password: '42333444', rol: 'ALUMNO', alumnoId: 3, profesorId: null },
            { id: 6, dni: 'profesor1', password: 'profesor1', rol: 'PROFESOR', alumnoId: null, profesorId: 1 },
            { id: 7, dni: 'profesor2', password: 'profesor2', rol: 'PROFESOR', alumnoId: null, profesorId: 2 }
        ]);
    },

    async down(queryInterface) {
        await queryInterface.bulkDelete('usuarios', null, {});
        await queryInterface.bulkDelete('inscripciones', null, {});
        await queryInterface.bulkDelete('grupos_practica', null, {});
        await queryInterface.bulkDelete('practicas', null, {});
        await queryInterface.bulkDelete('alumnos', null, {});
        await queryInterface.bulkDelete('profesores', null, {});
        await queryInterface.bulkDelete('carreras', null, {});
    }
};
