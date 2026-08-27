const bcrypt = require("bcryptjs");
const Usuario = require("../models/Usuario");

const obtenerPerfil = async (req, res) => {
    try {
        const usuario = await Usuario.findByPk(
            req.usuario.idUsuario,
            {
                attributes: {
                    exclude: ["clave"]
                }
            }
        );

        if (!usuario) {
            return res.status(404).json({
                mensaje: "Usuario no encontrado"
            });
        }

        res.json(usuario);
    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }

};

const actualizarPerfil = async (req, res) => {
    try {
        const usuario = await Usuario.findByPk(
            req.usuario.idUsuario
        );

        if (!usuario) {
            return res.status(404).json({
                mensaje: "Usuario no encontrado"
            });
        }

        await usuario.update({
            nombre: req.body.nombre,
            email: req.body.email,
            rol: req.body.rol
        });

        res.json(usuario);
    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
};

const cambiarClave = async (req, res) => {
    try {
        const { claveActual, claveNueva } = req.body;

        if (!claveActual || !claveNueva) {
            return res.status(400).json({
                mensaje: "Debe ingresar la contraseña actual y la nueva."
            });
        }

        const usuario = await Usuario.findByPk(req.usuario.idUsuario);

        if (!usuario) {
            return res.status(404).json({
                mensaje: "Usuario no encontrado"
            });
        }

        // Verificar contraseña actual
        const coincide = await bcrypt.compare(
            claveActual,
            usuario.clave
        );

        if (!coincide) {
            return res.status(401).json({
                mensaje: "La contraseña actual es incorrecta."
            });
        }

        // Evitar que la nueva sea igual
        const mismaClave = await bcrypt.compare(
            claveNueva,
            usuario.clave
        );

        if (mismaClave) {
            return res.status(400).json({
                mensaje: "La nueva contraseña debe ser diferente."
            });
        }

        // Encriptar la nueva contraseña
        const nuevaClaveHash = await bcrypt.hash(claveNueva, 10);

        usuario.clave = nuevaClaveHash;

        await usuario.save();

        res.json({
            mensaje: "Contraseña actualizada correctamente."
        });

    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
};

module.exports = {
    obtenerPerfil,
    actualizarPerfil,
    cambiarClave
};