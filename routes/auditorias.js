const express = require('express');
const router = express.Router();

const {
    filtrar,
    obtener,
    crear,
    actualizar
} = require('../controllers/auditoriaController');

router.get('/', filtrar);
router.get('/:id', obtener);
router.post('/', crear);
router.put('/:id', actualizar);

module.exports = router;