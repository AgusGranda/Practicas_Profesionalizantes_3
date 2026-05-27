'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('carreras', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            nombre: {
                allowNull: false,
                type: Sequelize.STRING
            }
        });
    },

    async down(queryInterface) {
        await queryInterface.dropTable('carreras');
    }
};
