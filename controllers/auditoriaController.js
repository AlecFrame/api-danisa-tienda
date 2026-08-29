const { Op } = require('sequelize');
const Auditoria = require('../models/Auditoria');
const Usuario = require('../models/Usuario');

const listar = async (req, res) => {
    try {
        const auditorias = await Auditoria.findAll({
            include: [
                {
                    model: Usuario,
                    as: 'usuario'
                }
            ]
        });
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
            include: [
                {
                    model: Usuario,
                    as: 'usuario'
                }
            ],
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
            req.params.id,
            {
                include: [
                    {
                        model: Usuario,
                        as: 'usuario'
                    }
                ]
            }
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
            include: [
                {
                    model: Usuario,
                    as: 'usuario'
                }
            ],
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

const filtrarPaginado = async (req, res) => {
    try {
        const {
            entidad,
            accion,
            fechaDesde,
            fechaHasta,
            usuario,
            pagina = 1,
            limite = 20
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

        const paginaNumero = Number(pagina);
        const limiteNumero = Number(limite);

        console.log("limite: "+limite)
        console.log("limiteNumero: "+limiteNumero)

        const offset = (paginaNumero - 1) * limiteNumero;

        console.log("offset: "+offset)

        const resultado = await Auditoria.findAndCountAll({
            include: [
                {
                    model: Usuario,
                    as: 'usuario'
                }
            ],
            where,
            offset,
            limit: limiteNumero,
            order: [['fecha', 'DESC']]
        });

        res.json({
            registros: resultado.rows,
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

module.exports = {
    listar,
    listar10Recientes,
    obtener,
    filtrar,
    filtrarPaginado
};