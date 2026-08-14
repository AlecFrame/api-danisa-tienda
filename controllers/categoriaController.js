const { Op } = require('sequelize');
const Categoria = require('../models/Categoria');
const upload = require('../config/multer');
const { crearAuditoria } = require('./utils');

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
    try {
        console.log('LOGs: '+req.body);

        const categoria = await Categoria.create({
            foto: req.body.foto,
            drawable: req.body.drawable,
            color: req.body.color,
            nombre: req.body.nombre,
            ejemplos: req.body.ejemplos,
            estado: 1
        });

        const usuario = req.body.usuario;

        await crearAuditoria(
            'Categoria',
            categoria.idCategoria,
            'CREAR',
            `Se creó "${categoria.nombre}"`,
            usuario? usuario:'Desconocido'
        );

        res.status(201).json(categoria);
    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
};

const actualizar = async (req, res) => {
    try {
        const categoria = await Categoria.findByPk(
            req.params.id
        );
        if (!categoria) {
            return res.status(404).json({
                mensaje: 'Categoria no encontrada'
            });
        }

        const valoresAnteriores = categoria.toJSON();

        await categoria.update({
            foto: req.body.foto,
            drawable: req.body.drawable,
            color: req.body.color,
            nombre: req.body.nombre,
            ejemplos: req.body.ejemplos
        });

        const usuario = req.body.usuario? req.body.usuario:'Desconocido';
        const cambios = [];
        for (const key in req.body) {
            if (req.body.hasOwnProperty(key) && key!='usuario' && valoresAnteriores[key] !== req.body[key]) {
                cambios.push(`${key}: "${valoresAnteriores[key]}" -> "${req.body[key]}"`);
            }
        }
        const descripcionAuditoria = `Cambios: ${cambios.join(', ')}`;

        await crearAuditoria(
            'Categoría',
            categoria.idCategoria,
            'MODIFICAR',
            descripcionAuditoria,
            usuario
        );

        res.json(categoria);
    } catch (error) {
        res.status(500).json({
            error: error.message
        });
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

        const usuario = req.body.usuario? req.body.usuario:'Desconocido';

        await crearAuditoria(
            'Categoría',
            categoria.idCategoria,
            'DESACTIVAR',
            `Se desactivó "${categoria.nombre}"`,
            usuario
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

        const usuario = req.body.usuario? req.body.usuario:'Desconocido';

        await crearAuditoria(
            'Categoría',
            categoria.idCategoria,
            'ACTIVAR',
            `Se activó "${categoria.nombre}"`,
            usuario
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

module.exports = {
    filtrar,
    obtener,
    crear,
    actualizar,
    desactivar,
    activar
};