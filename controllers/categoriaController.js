const { Op } = require('sequelize');
const Categoria = require('../models/Categoria');
const upload = require('../config/multer');
const { crearAuditoria } = require('./utils');
const { procesarImagen } = require('../utils/imagen');
const fs = require('fs/promises');

const filtrar = async (req, res) => {
    try {
        const {
            nombre,
            estado
        } = req.query;

        const where = {};

        if (nombre) {
            where.nombre = {
                [Op.like]: `%${nombre}%`
            };
        }

        if (estado !== undefined) {
            where.estado = Number(estado);
        }

        const categorias = await Categoria.findAll({
            where
        });

        res.json(categorias);
    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
};

const obtener = async (req, res) => {
    try {
        const categoria = await Categoria.findByPk(
            req.params.id
        );
        if (!categoria) {
            return res.status(404).json({
                mensaje: 'Categoria no encontrada'
            });
        }

        res.json(categoria);
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

        if (req.file) {
            rutaImagenOriginal = req.file.path;

            nombreFoto = `${Date.now()}.webp`;
            rutaImagenProcesada = `uploads/categorias/${nombreFoto}`;

            await procesarImagen(
                rutaImagenOriginal,
                rutaImagenProcesada
            );

            await fs.unlink(rutaImagenOriginal);
            rutaImagenOriginal = null;
        }

        const categoria = await Categoria.create({
            foto: nombreFoto,
            drawable: req.body.drawable,
            color: req.body.color,
            nombre: req.body.nombre,
            ejemplos: req.body.ejemplos,
            estado: 1
        });

        await crearAuditoria(
            req,
            'Categoria',
            categoria.idCategoria,
            'CREAR',
            `Se creó "${categoria.nombre}"`
        );

        res.status(201).json(categoria);
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
        console.log("ERROR_CATEGORIA_CREAR: "+error.message);
    }
};

const actualizar = async (req, res) => {
    let rutaImagenOriginal = null;
    let rutaImagenNueva = null;

    try {
        const categoria = await Categoria.findByPk(req.params.id);

        if (!categoria) {
            return res.status(404).json({
                mensaje: 'Categoria no encontrada'
            });
        }

        const fotoAnterior = categoria.foto;
        let nombreFoto = fotoAnterior;

        if (req.file) {
            rutaImagenOriginal = req.file.path;

            nombreFoto = `${Date.now()}.webp`;
            rutaImagenNueva = `uploads/categorias/${nombreFoto}`;

            await procesarImagen(
                rutaImagenOriginal,
                rutaImagenNueva
            );

            await fs.unlink(rutaImagenOriginal);
            rutaImagenOriginal = null;
        }
        
        categoria.drawable = req.body.drawable;
        categoria.color = req.body.color;
        categoria.nombre = req.body.nombre;
        categoria.ejemplos = req.body.ejemplos;
        categoria.foto = nombreFoto;

        await categoria.save();

        await crearAuditoria(
            req,
            'Categoría',
            categoria.idCategoria,
            'MODIFICAR',
            'Se hicieron cambios en la categoría'
        );

        if (req.file && fotoAnterior) {
            const rutaFotoAnterior = `uploads/categorias/${fotoAnterior}`;

            try {
                await fs.unlink(rutaFotoAnterior);
            } catch (errorImagen) {
                console.error(
                    'No se pudo eliminar la imagen anterior:',
                    errorImagen.message
                );
            }
        }

        res.json(categoria);
    } catch (error) {
        res.status(500).json({
            error: error.message
        });
        console.error(error.response?.data)
    }
};

const desactivar = async (req, res) => {
    try {
        const categoria = await Categoria.findByPk(
            req.params.id
        );

        if (!categoria) {
            return res.status(404).json({
                mensaje: 'Categoria no encontrada'
            });
        }

        categoria.estado = 0;

        await categoria.save();

        await crearAuditoria(
            req,
            'Categoría',
            categoria.idCategoria,
            'DESACTIVAR',
            `Se desactivó "${categoria.nombre}"`
        );

        res.json({
            mensaje: 'Categoria desactivada'
        });
    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
};

const activar = async (req, res) => {
    try {
        const categoria = await Categoria.findByPk(
            req.params.id
        );

        if (!categoria) {
            return res.status(404).json({
                mensaje: 'Categoria no encontrada'
            });
        }

        categoria.estado = 1;

        await categoria.save();

        await crearAuditoria(
            req,
            'Categoría',
            categoria.idCategoria,
            'ACTIVAR',
            `Se activó "${categoria.nombre}"`
        );

        res.json({
            mensaje: 'Categoria activada'
        });
    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
};

const filtrarPaginado = async (req, res) => {
    try {
        const {
            nombre,
            estado,
            pagina = 1,
            limite = 20
        } = req.query;

        const where = {};

        if (nombre) {
            where.nombre = {
                [Op.like]: `%${nombre}%`
            };
        }

        if (estado !== undefined) {
            where.estado = Number(estado);
        }

        const paginaNumero = Number(pagina);
        const limiteNumero = Number(limite);

        const offset = (paginaNumero - 1) * limiteNumero;

        const resultado = await Categoria.findAndCountAll({
            where,
            limit: limiteNumero,
            offset
        });

        res.json({
            categorias: resultado.rows,
            total: resultado.count,
            pagina: paginaNumero,
            limite: limiteNumero,
            totalPaginas: Math.ceil(resultado.count / limiteNumero)
        });
    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
};

const eliminarFoto = async (req, res) => {
    try {
        const categoria = await Categoria.findByPk(req.params.id);

        if (!categoria) {
            return res.status(404).json({
                mensaje: 'Categoría no encontrada'
            });
        }

        if (!categoria.foto) {
            return res.status(400).json({
                mensaje: 'La categoría no tiene una imagen'
            });
        }

        const rutaFoto = `uploads/categorias/${categoria.foto}`;

        try {
            await fs.unlink(rutaFoto);
        } catch (errorImagen) {
            console.error(
                'No se pudo eliminar la imagen:',
                errorImagen.message
            );
        }

        categoria.foto = null;

        await categoria.save();

        await crearAuditoria(
            req,
            'Categoría',
            categoria.idCategoria,
            'MODIFICAR',
            'Se eliminó la imagen de la categoría'
        );

        res.json(categoria);

    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
};

module.exports = {
    filtrar,
    obtener,
    crear,
    actualizar,
    desactivar,
    activar,
    filtrarPaginado,
    eliminarFoto
};