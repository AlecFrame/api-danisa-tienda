const express = require('express');
const router = express.Router();

const {
    filtrar,
    obtener,
    listar10Recientes
} = require('../controllers/auditoriaController');

router.get('/', filtrar);
router.get('/recientes', listar10Recientes);
router.get('/:id', obtener);

module.exports = router;