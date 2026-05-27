'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('mails_enviados', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            fecha: {
                allowNull: false,
                type: Sequelize.DATE
            },
            para: {
                allowNull: false,
                type: Sequelize.STRING
            },
            asunto: {
                allowNull: false,
                type: Sequelize.STRING
            },
            texto: {
                allowNull: false,
                type: Sequelize.TEXT
            },
            adjuntoNombre: {
                allowNull: true,
                type: Sequelize.STRING
            },
            adjuntoTipo: {
                allowNull: true,
                type: Sequelize.STRING
            },
            adjuntoBytes: {
                allowNull: true,
                type: Sequelize.INTEGER
            }
        });
    },

    async down(queryInterface) {
        await queryInterface.dropTable('mails_enviados');
    }
};
