'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('inscripciones', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            alumnoId: {
                allowNull: false,
                type: Sequelize.INTEGER,
                references: {
                    model: 'alumnos',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'RESTRICT'
            },
            grupoPracticaId: {
                allowNull: false,
                type: Sequelize.INTEGER,
                references: {
                    model: 'grupos_practica',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'RESTRICT'
            },
            fechaInscripcion: {
                allowNull: false,
                type: Sequelize.DATE
            },
            estado: {
                allowNull: false,
                type: Sequelize.ENUM('INSCRIPTO', 'EN_ESPERA', 'CANCELADO')
            }
        });
    },

    async down(queryInterface) {
        await queryInterface.dropTable('inscripciones');
    }
};
