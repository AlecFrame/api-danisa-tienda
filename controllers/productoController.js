const { Op } = require('sequelize');
const sequelize = require('../config/database');
const Producto = require('../models/Producto');
const Categoria = require('../models/Categoria');
const { crearAuditoria } = require('./utils');
const { procesarImagen } = require('../utils/imagen');
const fs = require('fs/promises');

const listar = async (req, res) => {
    try {
        const productos = await Producto.findAll(
            {
                include: [
                    {
                        model: Categoria,
                        as: 'categoria'
                    }
                ]
            }
        );
        res.json(productos);
    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
};

const obtener = async (req, res) => {
    try {
        const producto = await Producto.findByPk(
            req.params.id,
            {
                include: [
                    {
                        model: Categoria,
                        as: 'categoria'
                    }
                ]
            }
        );
        if (!producto) {
            return res.status(404).json({
                mensaje: 'Producto no encontrado'
            });
        }

        res.json(producto);
    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
};

const crear = async (req, res) => {
    let rutaImagenProcesada = null;
    let rutaImagenOriginal = null;

    try {
        let nombreFoto = null;

        //console.log("CREAR_PRODUCTO: req.body: "+JSON.stringify(req.body, null, 2));

        if (req.file) {
            rutaImagenOriginal = req.file.path;

            nombreFoto = `${Date.now()}.webp`;
            rutaImagenProcesada = `uploads/productos/${nombreFoto}`;

            await procesarImagen(
                rutaImagenOriginal,
                rutaImagenProcesada
            );

            await fs.unlink(rutaImagenOriginal);
            rutaImagenOriginal = null;
        }

        const producto = await Producto.create({
            foto: nombreFoto,
            nombre: req.body.nombre,
            descripcion: req.body.descripcion,
            idCategoria: req.body.idCategoria,
            precio: req.body.precio,
            costoCompra: req.body.costoCompra,
            unidad: req.body.unidad,
            stock: req.body.stock,
            stockBajo: req.body.stockBajo,
            estado: 1
        });

        const usuario = req.body.usuario;

        await crearAuditoria(
            'Producto',
            producto.idProducto,
            'CREAR',
            `Se creó "${producto.nombre}"`,
            usuario? usuario:'Desconocido'
        );

        res.status(201).json(producto);
    } catch (error) {
        if (rutaImagenProcesada) {
            try {
                await fs.unlink(rutaImagenProcesada);
            } catch (errorImagen) {
                console.error(
                    'No se pudo eliminar la imagen procesada:',
                    errorImagen.message
                );
            }
        }
        if (rutaImagenOriginal) {
            try {
                await fs.unlink(rutaImagenOriginal);
            } catch (errorImagen) {
                console.error(
                    'No se pudo eliminar la imagen original:',
                    errorImagen.message
                );
            }
        }
        res.status(500).json({
            error: error.message
        });
    }
};

const actualizar = async (req, res) => {
    let rutaImagenOriginal = null;
    let rutaImagenNueva = null;

    try {
        const producto = await Producto.findByPk(req.params.id);

        if (!producto) {
            return res.status(404).json({
                mensaje: 'Producto no encontrado'
            });
        }

        const fotoAnterior = producto.foto;
        let nombreFoto = fotoAnterior;

        if (req.file) {
            rutaImagenOriginal = req.file.path;

            nombreFoto = `${Date.now()}.webp`;
            rutaImagenNueva = `uploads/productos/${nombreFoto}`;

            await procesarImagen(
                rutaImagenOriginal,
                rutaImagenNueva
            );

            await fs.unlink(rutaImagenOriginal);
            rutaImagenOriginal = null;
        }

        // Guardar datos del producto
        producto.nombre = req.body.nombre;
        producto.descripcion = req.body.descripcion;
        producto.idCategoria = req.body.idCategoria;
        producto.precio = req.body.precio;
        producto.costoCompra = req.body.costoCompra;
        producto.unidad = req.body.unidad;
        producto.stock = req.body.stock;
        producto.stockBajo = req.body.stockBajo;
        producto.foto = nombreFoto;

        await producto.save();

        if (req.file && fotoAnterior) {
            const rutaFotoAnterior = `uploads/productos/${fotoAnterior}`;

            try {
                await fs.unlink(rutaFotoAnterior);
            } catch (errorImagen) {
                console.error(
                    'No se pudo eliminar la imagen anterior:',
                    errorImagen.message
                );
            }
        }

        res.json(producto);
    } catch (error) {
        if (rutaImagenNueva) {
            try {
                await fs.unlink(rutaImagenNueva);
            } catch (errorImagen) {
                console.error(
                    'No se pudo eliminar la imagen nueva:',
                    errorImagen.message
                );
            }
        }

        if (rutaImagenOriginal) {
            try {
                await fs.unlink(rutaImagenOriginal);
            } catch (errorImagen) {
                console.error(
                    'No se pudo eliminar la imagen temporal:',
                    errorImagen.message
                );
            }
        }

        res.status(500).json({
            error: error.message
        });
    }
};

const desactivar = async (req, res) => {
    try {
        const producto = await Producto.findByPk(
            req.params.id
        );

        if (!producto) {
            return res.status(404).json({
                mensaje: 'Producto no encontrado'
            });
        }

        producto.estado = 0;

        await producto.save();

        const usuario = req.body.usuario? req.body.usuario:'Desconocido';

        await crearAuditoria(
            'Producto',
            producto.idProducto,
            'DESACTIVAR',
            `Se desactivó "${producto.nombre}"`,
            usuario
        );

        res.json({
            mensaje: 'Producto desactivado'
        });
    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
};

const activar = async (req, res) => {
    try {
        const producto = await Producto.findByPk(
            req.params.id
        );

        if (!producto) {
            return res.status(404).json({
                mensaje: 'Producto no encontrado'
            });
        }

        producto.estado = 1;

        await producto.save();

        const usuario = req.body.usuario? req.body.usuario:'Desconocido';

        await crearAuditoria(
            'Producto',
            producto.idProducto,
            'ACTIVAR',
            `Se activó "${producto.nombre}"`,
            usuario
        );

        res.json({
            mensaje: 'Producto activado'
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
            nombre,
            idCategoria,
            estado,
            ordenStock
        } = req.query;

        const where = {};
        const order = [];

        if (nombre) {
            where.nombre = {
                [Op.like]: `%${nombre}%`
            };
        }

        if (idCategoria) {
            where.idCategoria = Number(idCategoria);
        }

        if (estado !== undefined) {
            where.estado = Number(estado);
        }

        if (ordenStock) {
            order.push([
                'stock',
                ordenStock.toUpperCase() === 'DESC'
                    ? 'DESC'
                    : 'ASC'
            ]);
        }

        const productos = await Producto.findAll({
            where,
            order,
            include: [
                {
                    model: Categoria,
                    as: 'categoria'
                }
            ]
        });

        res.json(productos);

    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
};

const listarStockBajos = async (req, res) => {
    try {
        const productos = await Producto.findAll(
            {
                include: [
                    {
                        model: Categoria,
                        as: 'categoria'
                    }
                ],
                where: {
                    estado: 1,
                    stock: {
                        [Op.lte]: sequelize.col('stockBajo')
                    }
                },
                order: [
                    ['stock', 'ASC']
                ]
            }
        );
        res.json(productos);
    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
};

module.exports = {
    listar,
    obtener,
    actualizar,
    crear,
    desactivar,
    activar,
    filtrar,
    listarStockBajos
};