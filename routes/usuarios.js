const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");

const {
    obtenerPerfil,
    actualizarPerfil,
    cambiarClave
} = require('../controllers/usuarioController');

router.get("/perfil", authMiddleware, obtenerPerfil);
router.put("/perfil", authMiddleware, actualizarPerfil);
router.put("/perfil/clave", authMiddleware, cambiarClave);

module.exports = router;