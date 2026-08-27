const express = require('express');
const router = express.Router();
const upload = require('../config/multer');

const {
    filtrar,
    obtener,
    crear,
    actualizar,
    desactivar,
    activar,
    filtrarPaginado,
    eliminarFoto
} = require('../controllers/categoriaController');

router.get('/', filtrar);
router.get('/paginado/', filtrarPaginado);
router.get('/:id', obtener);
router.post('/', upload('categorias').single('foto'), crear);
router.put('/:id', upload('categorias').single('foto'), actualizar);
router.patch('/:id/desactivar', desactivar);
router.patch('/:id/activar', activar);
router.delete('/:id/foto', eliminarFoto);

module.exports = router;