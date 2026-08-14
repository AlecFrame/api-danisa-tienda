const express = require('express');
const router = express.Router();

const {
    filtrar,
    obtener,
    crear,
    actualizar,
    listar10Recientes
} = require('../controllers/auditoriaController');

router.get('/', filtrar);
router.get('/recientes', listar10Recientes);
router.get('/:id', obtener);
router.post('/', crear);
router.put('/:id', actualizar);

module.exports = router;