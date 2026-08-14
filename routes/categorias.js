const express = require('express');
const router = express.Router();
const upload = require('../config/multer');

const {
    filtrar,
    obtener,
    crear,
    actualizar,
    desactivar,
    activar
} = require('../controllers/categoriaController');

router.get('/', filtrar);
router.get('/:id', obtener);
router.post('/', upload('categorias').single('foto'), crear);
router.put('/:id', upload('categorias').single('foto'), actualizar);
router.patch('/:id/desactivar', desactivar);
router.patch('/:id/activar', activar);

module.exports = router;