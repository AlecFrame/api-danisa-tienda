const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Usuario = sequelize.define('Usuario', {
    idUsuario: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nombre: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: true
    },
    rol: {
        type: DataTypes.STRING,
        allowNull: true
    },
    clave: {
        type: DataTypes.STRING,
        allowNull: false
    },
    estado: {
        type: DataTypes.TINYINT
    }
}, {
    tableName: 'usuarios',
    timestamps: false
});

module.exports = Usuario;