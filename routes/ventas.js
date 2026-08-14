const express = require('express');
const router = express.Router();

const {
    filtrar,
    obtener,
    crear,
    desactivar,
    activar,
    obtenerReporte,
    obtenerVentasRecientes,
    obtenerDetallesDeCarrito
} = require('../controllers/ventaController');

router.get('/', filtrar);
router.get('/resumen', obtenerVentasRecientes);
router.get('/reporte', obtenerReporte);
router.get('/detalles/:idCarrito', obtenerDetallesDeCarrito);
router.get('/:id', obtener);
router.post('/', crear);
router.patch('/:id/desactivar', desactivar);
router.patch('/:id/activar', activar);

module.exports = router;