const { Op } = require('sequelize');
const Alias = require('../models/Alias');
const upload = require('../config/multer');
const { crearAuditoria } = require('./utils');

const filtrar = async (req, res) => {
    try {
        const {
            estado
        } = req.query;

        const where = {};

        if (estado !== undefined) {
            where.estado = Number(estado);
        }

        const alias = await Alias.findAll({
            where
        });

        res.json(alias);

    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
};

const obtener = async (req, res) => {
    try {
        const alias = await Alias.findByPk(
            req.params.id
        );
        if (!alias) {
            return res.status(404).json({
                mensaje: 'Alias no encontrado'
            });
        }

        res.json(alias);
    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
};

const crear = async (req, res) => {
    try {
        const alias = await Alias.create({
            valor: req.body.valor,
            banco: req.body.banco,
            propietario: req.body.propietario,
            estado: 1
        });

        const usuario = req.body.usuario;

        await crearAuditoria(
            'Alias',
            alias.idAlias,
            'CREAR',
            `Se creó "${alias.valor}"`,
            usuario? usuario:'Desconocido'
        );

        res.status(201).json(alias);
    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
};

const actualizar = async (req, res) => {
    try {
        const alias = await Alias.findByPk(
            req.params.id
        );
        if (!alias) {
            return res.status(404).json({
                mensaje: 'Alias no encontrado'
            });
        }

        const valoresAnteriores = alias.toJSON();

        await alias.update({
            valor: req.body.valor,
            banco: req.body.banco,
            propietario: req.body.propietario
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
            'Alias',
            alias.idAlias,
            'MODIFICAR',
            descripcionAuditoria,
            usuario
        );

        res.json(alias);
    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
};

const desactivar = async (req, res) => {
    try {
        const alias = await Alias.findByPk(
            req.params.id
        );

        if (!alias) {
            return res.status(404).json({
                mensaje: 'Alias no encontrado'
            });
        }

        alias.estado = 0;

        await alias.save();

        const usuario = req.body.usuario? req.body.usuario:'Desconocido';

        await crearAuditoria(
            'Alias',
            alias.idAlias,
            'DESACTIVAR',
            `Se desactivó "${alias.valor}"`,
            usuario
        );

        res.json({
            mensaje: 'Alias desactivado'
        });
    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
};

const activar = async (req, res) => {
    try {
        const alias = await Alias.findByPk(
            req.params.id
        );

        if (!alias) {
            return res.status(404).json({
                mensaje: 'Alias no encontrado'
            });
        }

        alias.estado = 1;

        await alias.save();

        const usuario = req.body.usuario? req.body.usuario:'Desconocido';

        await crearAuditoria(
            'Alias',
            alias.idAlias,
            'ACTIVAR',
            `Se activó "${alias.valor}"`,
            usuario
        );

        res.json({
            mensaje: 'Alias activado'
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