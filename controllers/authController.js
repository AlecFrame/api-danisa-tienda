const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Usuario = require('../models/Usuario');

const comparePassword = async (candidatePassword, storedPassword) => {
    if (!storedPassword) {
        return false;
    }

    if (storedPassword.startsWith('$2')) {
        return bcrypt.compare(candidatePassword, storedPassword);
    }

    return candidatePassword === storedPassword;
};

const login = async (req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.clave ?? req.body.password;

        if (!email || !password) {
            return res.status(400).json({
                mensaje: 'Email y contraseña requeridos'
            });
        }

        const usuario = await Usuario.findOne({
            where: { email }
        });

        if (!usuario) {
            return res.status(401).json({
                mensaje: 'Credenciales inválidas'
            });
        }

        const passwordMatches = await comparePassword(password, usuario.clave);

        if (!passwordMatches) {
            return res.status(401).json({
                mensaje: 'Credenciales inválidas'
            });
        }

        const token = jwt.sign(
            { idUsuario: usuario.idUsuario, email: usuario.email },
            process.env.JWT_SECRET,
            { expiresIn: '8h' }
        );

        res.json({
            mensaje: 'Login correcto',
            token,
            usuario: {
                idUsuario: usuario.idUsuario,
                nombre: usuario.nombre,
                email: usuario.email,
                rol: usuario.rol
            }
        });
    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
};

const register = async (req, res) => {
    try {
        const nombre = req.body.nombre;
        const email = req.body.email;
        const password = req.body.clave ?? req.body.password;

        if (!email || !password) {
            return res.status(400).json({
                mensaje: 'Email y contraseña requeridos'
            });
        }

        const usuarioExistente = await Usuario.findOne({
            where: { email }
        });

        if (usuarioExistente) {
            return res.status(409).json({
                mensaje: 'El email ya está registrado'
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const usuario = await Usuario.create({
            nombre,
            email,
            clave: hashedPassword,
            estado: 1
        });

        const token = jwt.sign(
            { idUsuario: usuario.idUsuario, email: usuario.email },
            process.env.JWT_SECRET,
            { expiresIn: '8h' }
        );

        res.status(201).json({
            mensaje: 'Usuario creado correctamente',
            token,
            usuario: {
                idUsuario: usuario.idUsuario,
                nombre: usuario.nombre,
                email: usuario.email,
                rol: null,
                estado: usuario.estado
            }
        });
    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
};

module.exports = {
    login,
    register
};