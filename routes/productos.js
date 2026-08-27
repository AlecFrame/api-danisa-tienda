const express = require('express');
const router = express.Router();
const upload = require('../config/multer');

const {
    listar,
    obtener,
    actualizar,
    crear,
    desactivar,
    activar,
    filtrar,
    filtrarPaginado,
    listarStockBajos,
    eliminarFoto
} = require('../controllers/productoController');

router.get('/', filtrar);
router.get('/paginado/', filtrarPaginado);
router.get('/stock_bajos', listarStockBajos);
router.get('/:id', obtener);
router.post('/', upload('productos').single('foto'), crear);
router.put('/:id', upload('productos').single('foto'), actualizar);
router.patch('/:id/desactivar', desactivar);
router.patch('/:id/activar', activar);
router.delete('/:id/foto', eliminarFoto);

module.exports = router;