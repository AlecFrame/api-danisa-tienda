const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    const header = req.headers.authorization;

    if (!header) {
        return res.status(401).json({ mensaje: 'Token requerido' });
    }

    const [type, token] = header.split(' ');

    if (type !== 'Bearer' || !token) {
        return res.status(401).json({ mensaje: 'Formato de token inválido' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ mensaje: 'Token inválido o expirado' });
    }
};

module.exports = authMiddleware;
