'use strict';

module.exports = (sequelize, DataTypes) => {
    return sequelize.define('MailEnviado', {
        fecha: DataTypes.DATE,
        para: DataTypes.STRING,
        asunto: DataTypes.STRING,
        texto: DataTypes.TEXT,
        adjuntoNombre: DataTypes.STRING,
        adjuntoTipo: DataTypes.STRING,
        adjuntoBytes: DataTypes.INTEGER
    }, {
        tableName: 'mails_enviados',
        timestamps: false
    });
};
