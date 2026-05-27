'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('practicas', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            nombre: {
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
            descripcion: {
                allowNull: false,
                type: Sequelize.TEXT
            },
            visible: {
                allowNull: false,
                defaultValue: true,
                type: Sequelize.BOOLEAN
            }
        });
    },

    async down(queryInterface) {
        await queryInterface.dropTable('practicas');
    }
};
