const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Venta = sequelize.define('Venta', {
    idVenta: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    idCarrito: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    tipoPago: {
        type: DataTypes.STRING,
        allowNull: false
    },
    idAlias: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    ganancia: {
        type: DataTypes.DECIMAL,
        allowNull: false
    },
    fecha: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    estado: {
        type: DataTypes.TINYINT
    }
}, {
    tableName: 'ventas',
    timestamps: false
});

module.exports = Venta;