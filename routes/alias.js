const express = require('express');
const router = express.Router();

const {
    filtrar,
    filtrarPaginado,
    obtener,
    crear,
    actualizar,
    desactivar,
    activar
} = require('../controllers/aliasController');

router.get('/', filtrar);
router.get('/paginado/', filtrarPaginado);
router.get('/:id', obtener);
router.post('/', crear);
router.put('/:id', actualizar);
router.patch('/:id/desactivar', desactivar);
router.patch('/:id/activar', activar);

module.exports = router;