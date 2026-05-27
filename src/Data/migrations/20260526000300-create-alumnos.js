'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('alumnos', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            dni: {
                allowNull: false,
                unique: true,
                type: Sequelize.STRING
            },
            apellidoNombre: {
                allowNull: false,
                type: Sequelize.STRING
            },
            fechaNacimiento: {
                allowNull: false,
                type: Sequelize.DATEONLY
            },
            email: {
                allowNull: false,
                type: Sequelize.STRING
            },
            telefono: {
                allowNull: false,
                type: Sequelize.STRING
            },
            carreraId: {
                allowNull: false,
                type: Sequelize.INTEGER,
                references: {
                    model: 'carreras',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'RESTRICT'
            },
            anio: {
                allowNull: false,
                type: Sequelize.INTEGER
            },
            egresado: {
                allowNull: false,
                defaultValue: false,
                type: Sequelize.BOOLEAN
            }
        });
    },

    async down(queryInterface) {
        await queryInterface.dropTable('alumnos');
    }
};
