'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('usuarios', {
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
            password: {
                allowNull: false,
                type: Sequelize.STRING
            },
            rol: {
                allowNull: false,
                type: Sequelize.ENUM('ADMIN', 'PRECEPTOR', 'PROFESOR', 'ALUMNO')
            },
            alumnoId: {
                allowNull: true,
                type: Sequelize.INTEGER,
                references: {
                    model: 'alumnos',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL'
            },
            profesorId: {
                allowNull: true,
                type: Sequelize.INTEGER,
                references: {
                    model: 'profesores',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL'
            }
        });
    },

    async down(queryInterface) {
        await queryInterface.dropTable('usuarios');
    }
};
