const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Auditoria = sequelize.define('Auditoria', {
    idAuditoria: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    entidad: {
        type: DataTypes.STRING
    },
    idEntidad: {
        type: DataTypes.INTEGER
    },
    accion: {
        type: DataTypes.STRING
    },
    descripcion: {
        type: DataTypes.STRING
    },
    fecha: {
        type: DataTypes.DATE
    },
    usuario: {
        type: DataTypes.STRING
    },
    datoExtra: {
        type: DataTypes.STRING
    }
}, {
    tableName: 'auditorias',
    timestamps: false
});

module.exports = Auditoria;