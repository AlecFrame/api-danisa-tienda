const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CarritoDetalle = sequelize.define('CarritoDetalle', {
    idCarritoDetalle: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    idCarrito: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    idProducto: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    cantidad: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    precioUnitario: {
        type: DataTypes.DECIMAL,
        allowNull: false
    },
    costoUnitario: {
        type: DataTypes.DECIMAL,
        allowNull: false
    },
    subtotal: {
        type: DataTypes.DECIMAL,
        allowNull: false
    }
}, {
    tableName: 'carritodetalles',
    timestamps: false
});

module.exports = CarritoDetalle;