const { Op } = require('sequelize');
const Auditoria = require('../models/Auditoria');

const listar = async (req, res) => {
    try {
        const auditorias = await Auditoria.findAll();
        res.json(auditorias);
    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
};

const listar10Recientes = async (req, res) => {
    try {
        const auditorias = await Auditoria.findAll({
            limit: 10,
            order: [['fecha', 'DESC']]
        });

        res.json(auditorias);
    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
};

const obtener = async (req, res) => {
    try {
        const auditoria = await Auditoria.findByPk(
            req.params.id
        );
        if (!auditoria) {
            return res.status(404).json({
                mensaje: 'Auditoria no encontrado'
            });
        }

        res.json(auditoria);
    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
};

const crear = async (req, res) => {
    try {
        const auditoria = await Auditoria.create({
            entidad: req.body.entidad,
            idEntidad: req.body.idEntidad,
            accion: req.body.accion,
            descripcion: req.body.descripcion,
            fecha: req.body.fecha
        });
        res.status(201).json(auditoria);
    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
};

const actualizar = async (req, res) => {
    try {
        const auditoria = await Auditoria.findByPk(
            req.params.id
        );
        if (!auditoria) {
            return res.status(404).json({
                mensaje: 'Auditoria no encontrado'
            });
        }
        await auditoria.update({
            entidad: req.body.entidad,
            idEntidad: req.body.idEntidad,
            accion: req.body.accion,
            descripcion: req.body.descripcion,
            fecha: req.body.fecha
        });
        res.json(auditoria);
    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
};

const filtrar = async (req, res) => {
    try {
        const {
            entidad,
            accion,
            fechaDesde,
            fechaHasta,
            usuario,
        } = req.query;

        const where = {};

        if (entidad) {
            where.entidad = {
                [Op.like]: `%${entidad}%`
            };
        }

        if (accion) {
            where.accion = {
                [Op.like]: `%${accion}%`
            };
        }

        if (usuario) {
            where.usuario = {
                [Op.like]: `%${usuario}%`
            };
        }

        if (fechaDesde && fechaHasta) {
            where.fecha = {
                [Op.gte]: `${fechaDesde} 00:00:00`,
                [Op.lt]: `${fechaHasta} 00:00:00`
            };
        }

        const auditorias = await Auditoria.findAll({
            where,
            order: [['fecha', 'DESC']]
        });

        res.json(auditorias);

    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
};

module.exports = {
    listar,
    listar10Recientes,
    obtener,
    actualizar,
    crear,
    filtrar
};