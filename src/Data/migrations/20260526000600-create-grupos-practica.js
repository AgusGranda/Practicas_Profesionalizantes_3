'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('grupos_practica', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            practicaId: {
                allowNull: false,
                type: Sequelize.INTEGER,
                references: {
                    model: 'practicas',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'RESTRICT'
            },
            profesorId: {
                allowNull: false,
                type: Sequelize.INTEGER,
                references: {
                    model: 'profesores',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'RESTRICT'
            },
            cupoMaximo: {
                allowNull: false,
                type: Sequelize.INTEGER
            },
            dia: {
                allowNull: false,
                type: Sequelize.STRING
            },
            horario: {
                allowNull: false,
                type: Sequelize.STRING
            },
            lugar: {
                allowNull: false,
                type: Sequelize.STRING
            }
        });
    },

    async down(queryInterface) {
        await queryInterface.dropTable('grupos_practica');
    }
};
