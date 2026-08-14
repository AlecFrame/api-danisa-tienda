const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Categoria = sequelize.define('Categoria', {
    idCategoria: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    foto: {
        type: DataTypes.STRING,
        allowNull: true
    },
    drawable: {
        type: DataTypes.STRING,
        allowNull: true
    },
    color: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    nombre: {
        type: DataTypes.STRING,
        allowNull: false
    },
    ejemplos: {
        type: DataTypes.STRING,
        allowNull: true
    },
    estado: {
        type: DataTypes.TINYINT,
        allowNull: false
    }
}, {
    tableName: 'categorias',
    timestamps: false
});

module.exports = Categoria;