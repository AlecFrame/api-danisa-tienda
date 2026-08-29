const { Op } = require('sequelize');
const Gasto = require('../models/Gasto');
const { crearAuditoria } = require('./utils');

const filtrar = async (req, res) => {
    try {
        const {
            descripcion,
            categoria,
            pagado,
            estado,
            fechaDesde,
            fechaHasta
        } = req.query;

        const where = {};

        if (descripcion) {
            where.descripcion = {
                [Op.like]: `%${descripcion}%`
            };
        }
        if (categoria) {
            where.categoria = {
                [Op.like]: `%${categoria}%`
            };
        }
        if (pagado) {
            where.pagado = {
                [Op.like]: `%${pagado}%`
            };
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

        const gastos = await Gasto.findAll({
            where
        });

        res.json(gastos);

    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
};

const obtener = async (req, res) => {
    try {
        const gasto = await Gasto.findByPk(
            req.params.id
        );
        if (!gasto) {
            return res.status(404).json({
                mensaje: 'Gasto no encontrado'
            });
        }

        res.json(gasto);
    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
};

const crear = async (req, res) => {
    try {
        const gasto = await Gasto.create({
            descripcion: req.body.descripcion,
            monto: req.body.monto,
            fecha: new Date(),
            categoria: req.body.categoria,
            observacion: req.body.observacion,
            pagado: req.body.pagado,
            estado: 1
        });

        await crearAuditoria(
            req,
            'Gasto',
            gasto.idGasto,
            'CREAR',
            `Se creó un gasto de "${gasto.categoria}"`
        );

        res.status(201).json(gasto);
    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
};

const actualizar = async (req, res) => {
    try {
        const gasto = await Gasto.findByPk(
            req.params.id
        );
        if (!gasto) {
            return res.status(404).json({
                mensaje: 'Gasto no encontrado'
            });
        }

        const valoresAnteriores = gasto.toJSON();

        await gasto.update({
            descripcion: req.body.descripcion,
            monto: req.body.monto,
            fecha: req.body.fecha,
            categoria: req.body.categoria,
            observacion: req.body.observacion,
            pagado: req.body.pagado
        });

        const cambios = [];
        for (const key in req.body) {
            if (req.body.hasOwnProperty(key) && key!='usuario' && valoresAnteriores[key] !== req.body[key]) {
                cambios.push(`${key}: "${valoresAnteriores[key]}" -> "${req.body[key]}"`);
            }
        }
        const descripcionAuditoria = `Cambios: ${cambios.join(', ')}`;

        await crearAuditoria(
            req,
            'Gasto',
            gasto.idGasto,
            'MODIFICAR',
            descripcionAuditoria
        );

        res.json(gasto);
    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
};

const desactivar = async (req, res) => {
    try {
        const gasto = await Gasto.findByPk(
            req.params.id
        );

        if (!gasto) {
            return res.status(404).json({
                mensaje: 'Gasto no encontrado'
            });
        }

        gasto.estado = 0;

        await gasto.save();

        await crearAuditoria(
            req,
            'Gasto',
            gasto.idGasto,
            'DESACTIVAR',
            `Se desactivó el gasto de "${gasto.categoria}"`
        );

        res.json({
            mensaje: 'Gasto desactivado'
        });
    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
};

const activar = async (req, res) => {
    try {
        const gasto = await Gasto.findByPk(
            req.params.id
        );

        if (!gasto) {
            return res.status(404).json({
                mensaje: 'Gasto no encontrado'
            });
        }

        gasto.estado = 1;

        await gasto.save();

        await crearAuditoria(
            req,
            'Gasto',
            gasto.idGasto,
            'ACTIVAR',
            `Se activó el gasto de "${gasto.categoria}"`
        );

        res.json({
            mensaje: 'Gasto activado'
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
            descripcion,
            categoria,
            pagado,
            estado,
            fechaDesde,
            fechaHasta,
            pagina = 1,
            limite = 20
        } = req.query;

        const where = {};

        if (descripcion) {
            where.descripcion = {
                [Op.like]: `%${descripcion}%`
            };
        }
        if (categoria) {
            where.categoria = {
                [Op.like]: `%${categoria}%`
            };
        }
        if (pagado) {
            where.pagado = {
                [Op.like]: `%${pagado}%`
            };
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

        const paginaNumero = Number(pagina);
        const limiteNumero = Number(limite);

        const offset = (paginaNumero - 1) * limiteNumero;

        const resultado = await Gasto.findAndCountAll({
            where,
            limit: limiteNumero,
            offset
        });

        res.json({
            gastos: resultado.rows,
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
    filtrar,
    obtener,
    crear,
    actualizar,
    desactivar,
    activar,
    filtrarPaginado
};