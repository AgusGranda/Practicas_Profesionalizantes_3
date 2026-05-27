'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('profesores', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            apellidoNombre: {
                allowNull: false,
                type: Sequelize.STRING
            },
            email: {
                allowNull: false,
                unique: true,
                type: Sequelize.STRING
            },
            aprobado: {
                allowNull: false,
                defaultValue: false,
                type: Sequelize.BOOLEAN
            }
        });
    },

    async down(queryInterface) {
        await queryInterface.dropTable('profesores');
    }
};
