const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Producto = sequelize.define('Producto', {
    idProducto: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    foto: {
        type: DataTypes.STRING
    },
    nombre: {
        type: DataTypes.STRING
    },
    descripcion: {
        type: DataTypes.STRING
    },
    idCategoria: {
        type: DataTypes.INTEGER
    },
    precio: {
        type: DataTypes.DECIMAL
    },
    costoCompra: {
        type: DataTypes.DECIMAL
    },
    unidad: {
        type: DataTypes.STRING
    },
    stock: {
        type: DataTypes.INTEGER
    },
    stockBajo: {
        type: DataTypes.INTEGER
    },
    estado: {
        type: DataTypes.TINYINT
    }
}, {
    tableName: 'productos',
    timestamps: false
});

module.exports = Producto;