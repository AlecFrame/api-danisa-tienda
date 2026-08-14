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
    listarStockBajos
} = require('../controllers/productoController');

router.get('/', filtrar);
router.get('/stock_bajos', listarStockBajos);
router.get('/:id', obtener);
router.post('/', upload('productos').single('foto'), crear);
router.put('/:id', upload('productos').single('foto'), actualizar);
router.patch('/:id/desactivar', desactivar);
router.patch('/:id/activar', activar);

module.exports = router;