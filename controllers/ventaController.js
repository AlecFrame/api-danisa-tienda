const { Op } = require('sequelize');
const sequelize = require('../config/database');
const Venta = require('../models/Venta');
const Alias = require('../models/Alias');
const Carrito = require('../models/Carrito');
const CarritoDetalle = require('../models/CarritoDetalle');
const Producto = require('../models/Producto');
const Categoria = require('../models/Categoria');
const Gasto = require('../models/Gasto');
const { crearAuditoria } = require('./utils');

const listar = async (req, res) => {
    try {
        const ventas = await Venta.findAll(
            {
                include: [
                    {
                        model: Carrito,
                        as: 'carrito'
                    }
                ]
            }
        );
        res.json(ventas);
    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
};

const obtener = async (req, res) => {
    try {
        const venta = await Venta.findByPk(
            req.params.id,
            {
                include: [
                    { model: Carrito, as: 'carrito',
                        include: [  { model: CarritoDetalle, as: 'carritoDetalles',
                                include: [ { model: Producto, as: 'producto',
                                    include: [
                                        {
                                            model: Categoria,
                                            as: 'categoria'
                                        }
                                    ]
                                 } ]
                            } ]
                    }, {
                        model: Alias, as: 'alias'
                    }
                ]
            }
        );
        if (!venta) {
            return res.status(404).json({
                mensaje: 'Venta no encontrado'
            });
        }

        res.json(venta);
    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
};

const crear = async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
        const {
            tipoPago,
            idAlias,
            montoTotal,
            detalles
        } = req.body;

        // Validaciones
        if (!detalles) {
            await transaction.rollback();

            return res.status(400).json({
                mensaje: 'Detalles no cargados correctamente'
            });
        }

        // Crear carrito
        const carrito = await Carrito.create({
            montoTotal: montoTotal,
            estado: 'Confirmado'
        }, {
            transaction
        });

        var ganancia = 0;
        var montoTotalReal = 0;

        // Crear detalles
        for (const detalle of detalles) {
            const producto = await Producto.findByPk(
                detalle.idProducto,
                { transaction }
            );

            if (!producto) {
                throw new Error(
                    `Producto ${detalle.idProducto} no encontrado`
                );
            }

            if (producto.stock < detalle.cantidad) {
                throw new Error(
                    `Stock insuficiente para ${producto.nombre}`
                );
            }

            const precioUnitario = producto.precio;
            montoTotalReal += detalle.subtotal;
            let cantidadCalculada = (producto.unidad=='Gramo')? detalle.cantidad/1000:detalle.cantidad;
            ganancia += detalle.subtotal - (cantidadCalculada * producto.costoCompra);

            await CarritoDetalle.create({
                idCarrito: carrito.idCarrito,
                idProducto: producto.idProducto,
                cantidad: detalle.cantidad,
                precioUnitario,
                costoUnitario: producto.costoCompra,
                subtotal: detalle.subtotal
            }, {
                transaction
            });

            producto.stock -= detalle.cantidad;

            await producto.save({
                transaction
            });
        }

        ganancia += (montoTotal-montoTotalReal);

        // Crear venta
        const venta = await Venta.create({
            idCarrito: carrito.idCarrito,
            tipoPago,
            idAlias: tipoPago === 'Transferencia'
                ? idAlias
                : null,
            ganancia,
            fecha: new Date(),
            estado: 1
        }, {
            transaction
        });

        await crearAuditoria(
            req,
            'Venta',
            venta.idVenta,
            'CREAR',
            `Se registró la venta #${venta.idVenta} por $${montoTotal} pesos`
        );

        await transaction.commit();

        res.status(201).json({
            mensaje: 'Venta registrada correctamente',
            venta
        });
    } catch (error) {

        await transaction.rollback();

        res.status(500).json({
            error: error.message
        });
    }
};

const desactivar = async (req, res) => {
    try {
        const venta = await Venta.findByPk(
            req.params.id
        );

        if (!venta) {
            return res.status(404).json({
                mensaje: 'Venta no encontrado'
            });
        }

        venta.estado = 0;

        await venta.save();

        await crearAuditoria(
            req,
            'Venta',
            venta.idVenta,
            'DESACTIVAR',
            `Se desactivó la venta #${venta.idVenta}`
        );

        res.json({
            mensaje: 'Venta desactivado'
        });
    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
};

const activar = async (req, res) => {
    try {
        const venta = await Venta.findByPk(
            req.params.id
        );

        if (!venta) {
            return res.status(404).json({
                mensaje: 'Venta no encontrado'
            });
        }

        venta.estado = 1;

        await venta.save();

        await crearAuditoria(
            req,
            'Venta',
            venta.idVenta,
            'ACTIVAR',
            `Se activó la venta #${venta.idVenta}`
        );

        res.json({
            mensaje: 'Venta activado'
        });
    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
};

const filtrar = async (req, res) => {
    try {
        const {
            tipoPago,
            idAlias,
            estado,
            fechaDesde,
            fechaHasta
        } = req.query;

        const where = {};

        if (tipoPago) {
            where.tipoPago = {
                [Op.like]: `%${tipoPago}%`
            };
        }

        if (idAlias) {
            where.idAlias = Number(idAlias);
        }

        if (estado !== undefined) {
            where.estado = Number(estado);
        }

        if (fechaDesde && fechaHasta) {
            where.fecha = {
                [Op.gte]: `${fechaDesde} 00:00:00`,
                [Op.lt]: `${fechaHasta} 00:00:00`
            };
        }

        const ventas = await Venta.findAll({
            where,
            include: [
                {
                    model: Carrito,
                    as: 'carrito'
                },{
                    model: Alias,
                    as: 'alias'
                }
            ]
        });

        res.json(ventas);

    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
};

const obtenerReporte = async (req, res) => {
    try {
        const { fechaDesde, fechaHasta } = req.query;
        
        const where = {};

        if (fechaDesde && fechaHasta) {
            where.estado = 1,
            where.fecha = {
                [Op.gte]: `${fechaDesde} 00:00:00`,
                [Op.lt]: `${fechaHasta} 00:00:00`
            };
        }

        const totalVentas = await Venta.sum('carrito.montoTotal', {
            include: [
                {
                    model: Carrito,
                    as: 'carrito'
                }
            ],
            where
        }) ?? 0;

        const totalGastos = await Gasto.sum('monto', { where }) ?? 0;

        const ganancia = await Venta.sum('ganancia', { where }) ?? 0;

        const cantidadVentas = await Venta.count({ where });

        const productosMasVendidos = await CarritoDetalle.findAll({
            attributes: [
                'idProducto',
                [sequelize.fn('SUM', sequelize.col('cantidad')), 'cantidadVendida']
            ],
            include: [
                {
                    model: Producto,
                    as: 'producto',
                    include: [
                        {
                            model: Categoria,
                            as: 'categoria'
                        }
                    ]
                },
                {
                    model: Carrito,
                    as: 'carrito',
                    required: true,
                    include: [
                        {
                            model: Venta,
                            as: 'venta',
                            required: true,
                            where
                        }
                    ]
                }
            ],
            group: ['idProducto'],
            order: [[sequelize.literal('cantidadVendida'), 'DESC']]
        });

        productosMasVendidos.forEach(item => {
            if (item.producto.unidad === 'Gramo') {
                item.setDataValue(
                    'cantidadVendida',
                    Number(item.get('cantidadVendida')) / 1000
                );
            }
        });

        productosMasVendidos.sort((a, b) => {
            return Number(b.get('cantidadVendida')) -
                Number(a.get('cantidadVendida'));
        });

        const reporte = {
            resumen: {
                totalVentas, // Suma de todos los "Venta.Carrito.montoTotal" de cada venta
                totalGastos, // Suma de todos los "monto" de cada Gasto
                ganancia, // Suma de todos los "ganancia" de cada venta
                cantidadVentas // Numero de ventas realizadas
            },
            productosMasVendidos // Lista de Producto y numero de ventas del mismo ordenado de menor a mayor
        };

        res.json(reporte);
    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
};

const obtenerVentasRecientes = async (req, res) => {
    try {
        const ahora = new Date();

        // Inicio del día
        const inicioHoy = new Date(ahora);
        inicioHoy.setHours(0, 0, 0, 0);

        // Inicio de la semana (lunes)
        const inicioSemana = new Date(ahora);
        const diaSemana = inicioSemana.getDay();

        const diferencia = diaSemana === 0 ? 6 : diaSemana - 1;

        inicioSemana.setDate(inicioSemana.getDate() - diferencia);
        inicioSemana.setHours(0, 0, 0, 0);

        const totalVentasHoy = await Venta.sum('carrito.montoTotal', {
            include: [
                {
                    model: Carrito,
                    as: 'carrito'
                }
            ],
            where: {
                estado: 1,
                fecha: {
                    [Op.gte]: inicioHoy
                }
            }
        }) ?? 0;

        const totalVentasSemana = await Venta.sum('carrito.montoTotal', {
            include: [
                {
                    model: Carrito,
                    as: 'carrito'
                }
            ],
            where: {
                estado: 1,
                fecha: {
                    [Op.gte]: inicioSemana
                }
            }
        }) ?? 0;

        const resumen = {
            totalVentasHoy,
            totalVentasSemana
        };

        res.json(resumen);
    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
};

const obtenerDetallesDeCarrito = async (req, res) => {
    try {
        const detalles = await CarritoDetalle.findAll(
            {
                where: {
                    idCarrito: req.params.idCarrito
                },
                include: [
                    {
                        model: Producto,
                        as: 'producto',
                        include: [
                            {
                                model: Categoria,
                                as: 'categoria'
                            }
                        ]
                    }
                ]
            }
        );
        res.json(detalles);
    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
};

module.exports = {
    listar,
    obtener,
    crear,
    desactivar,
    activar,
    filtrar,
    obtenerReporte,
    obtenerVentasRecientes,
    obtenerDetallesDeCarrito
};