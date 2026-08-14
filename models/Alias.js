const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Alias = sequelize.define('Alias', {
    idAlias: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    valor: {
        type: DataTypes.STRING,
        allowNull: false
    },
    banco: {
        type: DataTypes.STRING,
        allowNull: false
    },
    propietario: {
        type: DataTypes.STRING,
        allowNull: false
    },
    estado: {
        type: DataTypes.TINYINT,
        allowNull: false
    }
}, {
    tableName: 'alias',
    timestamps: false
});

module.exports = Alias;