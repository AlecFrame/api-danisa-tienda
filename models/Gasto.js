const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Gasto = sequelize.define('Gasto', {
    idGasto: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    descripcion: {
        type: DataTypes.STRING,
        allowNull: false
    },
    monto: {
        type: DataTypes.DECIMAL,
        allowNull: false
    },
    fecha: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    categoria: {
        type: DataTypes.STRING,
        allowNull: false
    },
    observacion: {
        type: DataTypes.STRING,
        allowNull: true
    },
    pagado: {
        type: DataTypes.STRING,
        allowNull: true
    },
    estado: {
        type: DataTypes.TINYINT,
        allowNull: false
    }
}, {
    tableName: 'gastos',
    timestamps: false
});

module.exports = Gasto;