const sequelize = require('../config/database');

const Producto = require('./Producto');
const Categoria = require('./Categoria');
const Carrito = require('./Carrito');
const CarritoDetalle = require('./CarritoDetalle');
const Venta = require('./Venta');
const Alias = require('./Alias');

// Carrito - CarritoDetalle
Carrito.hasMany(CarritoDetalle, {
    foreignKey: 'idCarrito',
    as: 'carritoDetalles'
});

CarritoDetalle.belongsTo(Carrito, {
    foreignKey: 'idCarrito',
    as: 'carrito'
});


// Producto - CarritoDetalle
Producto.hasMany(CarritoDetalle, {
    foreignKey: 'idProducto',
    as: 'carritoDetalles'
});

CarritoDetalle.belongsTo(Producto, {
    foreignKey: 'idProducto',
    as: 'producto'
});


// Categoria - Producto
Categoria.hasMany(Producto, {
    foreignKey: 'idCategoria',
    as: 'productos'
});

Producto.belongsTo(Categoria, {
    foreignKey: 'idCategoria',
    as: 'categoria'
});


// Carrito - Venta
Carrito.hasOne(Venta, {
    foreignKey: 'idCarrito',
    as: 'venta'
});

Venta.belongsTo(Carrito, {
    foreignKey: 'idCarrito',
    as: 'carrito'
});


// Venta - Alias
Alias.hasMany(Venta, {
    foreignKey: 'idAlias',
    as: 'ventas'
});

Venta.belongsTo(Alias, {
    foreignKey: 'idAlias',
    as: 'alias'
});

// Exportar
module.exports = {
    Producto,
    Categoria,
    Carrito,
    CarritoDetalle,
    Venta,
    Alias
};