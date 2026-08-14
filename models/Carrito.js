const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Carrito = sequelize.define('Carrito', {
    idCarrito: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    montoTotal: {
        type: DataTypes.DECIMAL,
        allowNull: false
    },
    estado: {
        type: DataTypes.STRING //Pendiente / Confirmado / Cancelado
    }
}, {
    tableName: 'carritos',
    timestamps: false
});

module.exports = Carrito;